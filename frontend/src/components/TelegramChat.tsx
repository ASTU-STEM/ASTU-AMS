import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? `${UPLOAD_BASE}${url}` : `${UPLOAD_BASE}/${url}`;
};

const formatMessageTime = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr === 'Just now' || timeStr === 'Recently' || timeStr === 'Now') return timeStr;
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return 'Just now';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface Message {
  id: string;
  sender: string;
  senderId?: string;
  senderRole?: string;
  isSelf?: boolean;
  text: string;
  fileUrl?: string;
  fileType?: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationThread {
  partnerId: string;
  userId: string;
  alumniId?: string;
  employerId?: string;
  name: string;
  alumniName?: string;
  email: string;
  alumniEmail?: string;
  avatar: string | null;
  alumniPhoto?: string | null;
  role: string;
  roleLabel: string;
  department?: string;
  online: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

interface Contact {
  id: string;
  userId: string;
  profileId: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  secondaryInfo: string;
  avatar: string | null;
  online: boolean;
}

interface TelegramChatProps {
  darkMode: boolean;
  initialTarget?: {
    id?: string;
    userId?: string;
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    roleLabel?: string;
    department?: string;
  } | null;
}

export const TelegramChat: React.FC<TelegramChatProps> = ({ darkMode, initialTarget }) => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RECRUITER' | 'ALUMNI' | 'UNIVERSITY'>('ALL');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedMessageForDelete, setSelectedMessageForDelete] = useState<Message | null>(null);
  const [showDeleteThreadModal, setShowDeleteThreadModal] = useState<boolean>(false);

  // Voice Call & In-Chat Search States
  const [activeCall, setActiveCall] = useState<{ isCalling: boolean; isMuted: boolean; duration: number } | null>(null);
  const [isSearchingInChat, setIsSearchingInChat] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');

  // Emoji Picker States
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState<number>(0);

  const emojiCategories = [
    { name: 'Smileys', icon: '😊', emojis: ['😊', '😂', '🤣', '😁', '🥰', '😍', '🤩', '😎', '😜', '😇', '🥳', '🤔', '🤗', '😌', '🙃', '😳'] },
    { name: 'Gestures', icon: '👍', emojis: ['👍', '🙌', '👏', '🙏', '🤝', '💪', '👌', '✌️', '🤙', '👋', '🤞', '👊', '🤜', '🤛', '💯', '✨'] },
    { name: 'Work', icon: '💼', emojis: ['💼', '🚀', '✅', '🎯', '⭐', '💡', '📌', '📊', '📈', '📝', '✉️', '💻', '🎓', '🏆', '📢', '💬'] },
    { name: 'Hearts', icon: '❤️', emojis: ['❤️', '💙', '💚', '💛', '💜', '🧡', '🤍', '🤎', '💖', '💗', '💓', '💞', '💕', '❣', '💔', '🔥'] }
  ];

  const handleInsertEmoji = (emoji: string) => {
    setTypedMessage(prev => prev + emoji);
  };

  // File Upload & Lightbox Preview States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ file: File; previewUrl: string; type: string } | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        file,
        previewUrl: reader.result as string,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Call timer effect
  useEffect(() => {
    let timer: any;
    if (activeCall && activeCall.isCalling) {
      timer = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall?.isCalling]);

  const formatCallDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartCall = () => {
    if (!activeThread) return;
    setActiveCall({ isCalling: true, isMuted: false, duration: 0 });
    toast.success(`Calling ${activeThread.name}...`);
  };

  const handleEndCall = () => {
    setActiveCall(null);
    toast('Call ended', { icon: '📞' });
  };

  // Delete message handler
  const handleDeleteMessage = async (msgId: string, deleteForEveryone: boolean) => {
    try {
      await apiClient.delete(`/chat/message/${msgId}`, { data: { deleteForEveryone } });
      toast.success(deleteForEveryone ? 'Message deleted for everyone.' : 'Message deleted for you.');

      setActiveThread(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages.filter(m => m.id !== msgId)
        };
      });

      setThreads(prev => prev.map(t => ({
        ...t,
        messages: t.messages.filter(m => m.id !== msgId)
      })));

      setSelectedMessageForDelete(null);
    } catch (err) {
      toast.error('Failed to delete message.');
    }
  };

  // Delete entire conversation thread handler
  const handleDeleteThread = async () => {
    if (!activeThread) return;
    const targetId = activeThread.userId || activeThread.partnerId || activeThread.alumniId || activeThread.employerId;
    try {
      await apiClient.delete(`/chat/thread/${targetId}`);
      toast.success(`Deleted conversation with ${activeThread.name}`);

      setThreads(prev => prev.filter(t =>
        !(t.userId === activeThread.userId || t.partnerId === activeThread.partnerId || t.email === activeThread.email)
      ));
      setActiveThread(null);
      setShowDeleteThreadModal(false);
    } catch (err) {
      toast.error('Failed to delete conversation.');
    }
  };

  // 1. Load active conversation threads (Stable callback, no dependencies)
  const loadThreads = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat/threads');
      const data: ConversationThread[] = response.data.data || [];
      setThreads(data);

      setActiveThread(current => {
        if (!current) {
          return null;
        }
        const match = data.find(t =>
          (current.userId && t.userId === current.userId) ||
          (current.partnerId && t.partnerId === current.partnerId) ||
          (current.email && t.email === current.email) ||
          (current.name && t.name.toLowerCase() === current.name.toLowerCase())
        );
        return match ? match : current;
      });
    } catch (err: any) {
      console.error('Failed to load chat threads:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Automatically sync read status with PostgreSQL when activeThread changes
  useEffect(() => {
    if (activeThread) {
      const targetId = activeThread.userId || activeThread.partnerId;
      if (targetId) {
        apiClient.post('/chat/read', { partnerId: targetId }).catch(() => null);
      }
    }
  }, [activeThread?.userId, activeThread?.partnerId]);

  // Handle initial target candidate selection from ApplicationsTab
  const targetKey = initialTarget ? (initialTarget.userId || initialTarget.id || initialTarget.email || initialTarget.name) : null;
  useEffect(() => {
    if (initialTarget && targetKey) {
      const targetId = initialTarget.userId || initialTarget.id;
      const targetName = initialTarget.name || 'Alumni Candidate';

      setThreads(prev => {
        const existing = prev.find(t =>
          (targetId && (t.userId === targetId || t.partnerId === targetId)) ||
          (initialTarget.email && t.email === initialTarget.email) ||
          (t.name && t.name.toLowerCase() === targetName.toLowerCase())
        );

        if (existing) {
          setActiveThread(existing);
          return prev;
        }

        const fallbackId = targetId || `candidate-${Date.now()}`;
        const newThread: ConversationThread = {
          partnerId: fallbackId,
          userId: fallbackId,
          name: targetName,
          email: initialTarget.email || '',
          avatar: initialTarget.avatar || null,
          role: initialTarget.role || 'ALUMNI',
          roleLabel: initialTarget.roleLabel || 'Alumni Candidate',
          department: initialTarget.department || 'Graduate Candidate',
          online: true,
          unreadCount: 0,
          lastMessage: 'Tap to start conversation...',
          lastMessageTime: 'Just now',
          messages: []
        };
        setActiveThread(newThread);
        return [newThread, ...prev];
      });
    }
  }, [targetKey]);

  // 2. Load contacts directory for "+ New Chat"
  const loadContacts = async () => {
    try {
      const response = await apiClient.get('/chat/contacts');
      setContacts(response.data.data || []);
    } catch (err) {
      console.error('Failed to load contacts directory:', err);
    }
  };

  // Run on mount ONCE
  useEffect(() => {
    loadThreads();
    loadContacts();

    // Register WebSocket for live messaging
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr);
        if (currentUser && currentUser.id) {
          const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
          const socket = io(socketUrl);

          socket.emit('register', currentUser.id);
          if (currentUser.alumniProfile?.id) socket.emit('register', currentUser.alumniProfile.id);
          if (currentUser.employerProfile?.id) socket.emit('register', currentUser.employerProfile.id);

          socket.on('newMessage', () => {
            loadThreads();
          });

          return () => {
            socket.disconnect();
          };
        }
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  // 3. Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!typedMessage.trim() && !selectedFile) || !activeThread) return;

    setIsSending(true);
    try {
      const targetId = activeThread.userId || activeThread.partnerId;

      let fileUrl: string | undefined = undefined;
      let fileType: string | undefined = undefined;

      if (selectedFile) {
        fileUrl = selectedFile.previewUrl;
        fileType = selectedFile.type;
      }

      await apiClient.post('/chat/send', {
        targetId,
        text: typedMessage.trim(),
        fileUrl,
        fileType
      });

      setTypedMessage('');
      setSelectedFile(null);
      await loadThreads();
    } catch (err: any) {
      toast.error('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle thread selection and mark as read
  const handleSelectThread = (thread: ConversationThread) => {
    const updatedThread = { ...thread, unreadCount: 0 };
    setActiveThread(updatedThread);

    const targetKey = (thread.userId || thread.partnerId || thread.email || thread.name).toLowerCase();

    setThreads(prev => prev.map(t => {
      const k = (t.userId || t.partnerId || t.email || t.name).toLowerCase();
      return (k === targetKey || (t.name && t.name.toLowerCase() === thread.name.toLowerCase()))
        ? { ...t, unreadCount: 0 }
        : t;
    }));

    const targetId = thread.userId || thread.partnerId || thread.alumniId || thread.employerId;
    if (targetId) {
      apiClient.post('/chat/read', { partnerId: targetId }).then(() => {
        loadThreads();
      }).catch(() => null);
    }
  };

  // Start New Chat from Contact Modal
  const handleStartChatWithContact = (contact: Contact) => {
    const existing = threads.find(t => t.userId === contact.userId || t.partnerId === contact.id);
    if (existing) {
      handleSelectThread(existing);
    } else {
      const newThread: ConversationThread = {
        partnerId: contact.userId,
        userId: contact.userId,
        name: contact.name,
        email: contact.email,
        avatar: contact.avatar,
        role: contact.role,
        roleLabel: contact.roleLabel,
        department: contact.secondaryInfo,
        online: true,
        unreadCount: 0,
        lastMessage: 'Tap to start conversation...',
        lastMessageTime: 'Now',
        messages: []
      };
      setThreads(prev => [newThread, ...prev]);
      setActiveThread(newThread);
    }
    setShowNewChatModal(false);
  };

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CU';

  // Deduplicate and filter threads by tab & query
  const uniqueThreads = useMemo(() => {
    const map = new Map<string, ConversationThread>();
    threads.forEach(t => {
      const key = (t.userId || t.partnerId || t.email || t.name).toLowerCase();
      const activeKey = activeThread ? (activeThread.userId || activeThread.partnerId || activeThread.email || activeThread.name).toLowerCase() : '';
      const isActive = key === activeKey || (activeThread?.name && t.name.toLowerCase() === activeThread.name.toLowerCase());

      if (!map.has(key)) {
        map.set(key, isActive ? { ...t, unreadCount: 0 } : t);
      } else {
        const existing = map.get(key)!;
        const bestMessages = (t.messages?.length || 0) > (existing.messages?.length || 0) ? t.messages : existing.messages;
        const minUnread = isActive ? 0 : Math.min(t.unreadCount ?? 0, existing.unreadCount ?? 0);

        map.set(key, {
          ...existing,
          ...t,
          unreadCount: minUnread,
          messages: bestMessages
        });
      }
    });
    return Array.from(map.values());
  }, [threads, activeThread]);

  const filteredThreads = useMemo(() => {
    return uniqueThreads.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.roleLabel && t.roleLabel.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'RECRUITER') return t.role === 'EMPLOYER';
      if (activeFilter === 'ALUMNI') return t.role === 'ALUMNI';
      if (activeFilter === 'UNIVERSITY') return ['ADMIN', 'REGISTRAR', 'DEPARTMENT_HEAD'].includes(t.role);

      return true;
    });
  }, [uniqueThreads, searchQuery, activeFilter]);

  // Filter modal contacts
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    c.roleLabel.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    c.secondaryInfo.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  const quickReplies = [
    'I am available for a meeting after 2:00 PM.',
    'Could we schedule an interview slot?',
    'Please share the position details.',
    'Thank you for reaching out!'
  ];

  const avatarGradients = [
    'from-blue-600 to-indigo-600',
    'from-emerald-500 to-teal-700',
    'from-violet-600 to-purple-800',
    'from-rose-500 to-pink-600',
    'from-[#003366] to-[#0055a5]',
  ];

  const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
    return avatarGradients[Math.abs(hash) % avatarGradients.length];
  };

  return (
    <div className={`flex flex-col md:flex-row rounded-2xl md:rounded-3xl border shadow-2xl overflow-hidden h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] min-h-[480px] sm:min-h-[560px] md:min-h-[640px] transition-all duration-300 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/60'
    }`}>

      {/* ── Left Sidebar (Telegram Style) ────────────────────────────────────────── */}
      <div className={`w-full md:w-[280px] md:min-w-[280px] md:max-w-[280px] lg:w-[320px] lg:min-w-[320px] lg:max-w-[320px] flex-shrink-0 border-b md:border-b-0 md:border-r flex flex-col ${activeThread ? 'hidden md:flex' : 'flex'} ${
        darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200/80 bg-slate-50/70'
      }`}>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800/80 space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#003366] to-[#0055a5] text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-900/20">
                ✈️
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-[#003366] dark:text-blue-400">ASTU_AMS Hub</h3>
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-wide uppercase">● System Messenger</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#002244] hover:to-[#001122] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95"
              title="Start New Conversation"
            >
              <span className="text-sm font-black">+</span> New Chat
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations & contacts..."
              className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#003366]/30 ${
                darkMode ? 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-200/90 text-slate-800 placeholder-slate-400 shadow-inner'
              }`}
            />
            <span className="material-symbols-outlined text-base absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pt-0.5 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'ALL', label: 'All Chats' },
              { id: 'RECRUITER', label: 'Recruiters' },
              { id: 'ALUMNI', label: 'Candidates' },
              { id: 'UNIVERSITY', label: 'Admin & Staff' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 text-[10px] font-extrabold rounded-xl whitespace-nowrap transition-all ${
                  activeFilter === f.id
                    ? 'bg-[#003366] text-white shadow-md shadow-blue-950/20'
                    : darkMode
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 pb-8">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#003366] border-t-transparent"></div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-[#003366] dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                💬
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">No active conversations</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Click <strong>"+ New Chat"</strong> to connect directly with any applicant, employer, or admin.
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 bg-[#003366] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#002244] transition-all active:scale-95"
              >
                Find Contact
              </button>
            </div>
          ) : (
            filteredThreads.map(thread => {
              const isActive = activeThread?.userId === thread.userId || activeThread?.partnerId === thread.partnerId;
              const avatarSrc = getAvatarUrl(thread.avatar);
              return (
                <button
                  key={thread.partnerId}
                  onClick={() => handleSelectThread(thread)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-all duration-200 ${
                    isActive
                      ? darkMode
                        ? 'bg-slate-800/90 border-l-4 border-l-blue-400 shadow-md'
                        : 'bg-blue-50/90 border-l-4 border-l-[#003366] shadow-sm'
                      : 'hover:bg-blue-50/40 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white dark:ring-slate-800"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : null}
                    {(!avatarSrc) && (
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(thread.name)} text-white flex items-center justify-center font-extrabold text-sm shadow-md ring-2 ring-white dark:ring-slate-800`}>
                        {getInitials(thread.name)}
                      </div>
                    )}
                    {thread.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-extrabold truncate ${isActive ? 'text-[#003366] dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{thread.name}</p>
                      {thread.lastMessageTime && (
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 flex-shrink-0 font-semibold">
                          {formatMessageTime(thread.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 gap-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px] font-medium">
                        {thread.lastMessage}
                      </p>
                      {thread.unreadCount > 0 && (
                        <span className="min-w-[18px] h-4.5 px-1.5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#003366] to-[#0055a5] text-[9px] font-black text-white shadow-md ring-2 ring-blue-400/20 animate-pulse">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[8px] font-extrabold rounded-md ${
                      thread.role === 'EMPLOYER' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' :
                      thread.role === 'ALUMNI' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' :
                      'bg-blue-50 dark:bg-slate-800 text-[#003366] dark:text-blue-300'
                    }`}>
                      {thread.roleLabel || thread.role}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Pane (Telegram Style) ────────────────────────────────────── */}
      <div className={`flex-1 min-w-0 flex flex-col ${!activeThread ? 'hidden md:flex' : 'flex'} h-full max-h-full overflow-hidden`}>
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs min-w-0 z-20 shrink-0 sticky top-0">
              <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                <button
                  onClick={() => setActiveThread(null)}
                  className="md:hidden w-8.5 h-8.5 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0 shadow-xs"
                  title="Back to Contact List"
                >
                  <span className="material-symbols-outlined text-lg font-bold">arrow_back</span>
                </button>

                <div className="relative flex-shrink-0">
                  {getAvatarUrl(activeThread.avatar) ? (
                    <img
                      src={getAvatarUrl(activeThread.avatar)!}
                      alt=""
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover shadow-sm ring-2 ring-white dark:ring-slate-800"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                  {!getAvatarUrl(activeThread.avatar) && (
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${getAvatarGradient(activeThread.name)} text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800`}>
                      {getInitials(activeThread.name)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs"></span>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2 truncate">
                    <span className="truncate">{activeThread.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold ${
                      activeThread.role === 'EMPLOYER' ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' :
                      activeThread.role === 'ALUMNI' ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' :
                      'bg-blue-100 dark:bg-slate-800 text-[#003366] dark:text-blue-300'
                    }`}>
                      {activeThread.roleLabel || activeThread.role}
                    </span>
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 sm:gap-1.5 truncate mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                    <span className="truncate">Active now • {activeThread.email || activeThread.department}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1 text-slate-500 flex-shrink-0">
                <button
                  onClick={handleStartCall}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Voice Call"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">call</span>
                </button>
                <button
                  onClick={() => setIsSearchingInChat(!isSearchingInChat)}
                  className={`p-2 sm:p-2.5 rounded-xl transition-colors ${
                    isSearchingInChat ? 'bg-[#003366] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Search Messages"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">search</span>
                </button>
                <button
                  onClick={() => setShowDeleteThreadModal(true)}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition-colors"
                  title="Delete Conversation"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">delete</span>
                </button>
              </div>
            </div>

            {/* Inline Header Search Bar */}
            {isSearchingInChat && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder={`Search messages with ${activeThread.name}...`}
                  className="flex-1 text-xs bg-transparent focus:outline-none text-slate-800 dark:text-white"
                  autoFocus
                />
                {chatSearchQuery && (
                  <button onClick={() => setChatSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Message History */}
            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto space-y-3 sm:space-y-4 bg-slate-100/50 dark:bg-[#0b1120] min-w-0 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Date Badge */}
              <div className="flex items-center justify-center my-2 sm:my-3">
                <span className="px-3.5 py-1 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold rounded-full shadow-xs uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60">
                  Today
                </span>
              </div>

              {activeThread.messages
                .filter(m => !chatSearchQuery || m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                .map((msg) => {
                const userStr = localStorage.getItem('user');
                let currentUserId = '';
                if (userStr) {
                  try { currentUserId = JSON.parse(userStr)?.id || ''; } catch (e) {}
                }

                const isOpponent = Boolean(
                  (msg.senderId && (msg.senderId === activeThread.userId || msg.senderId === activeThread.partnerId || msg.senderId === activeThread.alumniId || msg.senderId === activeThread.employerId))
                );

                const isMe = msg.isSelf !== undefined 
                  ? msg.isSelf 
                  : (msg.senderId ? msg.senderId === currentUserId : !isOpponent);

                return (
                  <div key={msg.id} className={`flex items-center gap-1.5 sm:gap-2 ${isMe ? 'justify-end' : 'justify-start'} group`}>
                    {isMe && (
                      <button
                        onClick={() => setSelectedMessageForDelete(msg)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-all"
                        title="Delete Message"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">delete</span>
                      </button>
                    )}
                    <div className={`max-w-[88%] sm:max-w-[80%] md:max-w-[70%] p-3 sm:p-3.5 rounded-2xl text-xs space-y-1.5 shadow-md leading-relaxed transition-all relative ${
                      isMe
                        ? 'bg-gradient-to-br from-[#004080] via-[#003366] to-[#002244] text-white rounded-tr-xs border border-blue-400/20 shadow-blue-950/20'
                        : darkMode
                        ? 'bg-slate-800/95 border border-slate-700/80 text-white rounded-tl-xs shadow-slate-950/30'
                        : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs shadow-slate-200/50'
                    }`}>
                      {!isMe && (
                        <p className="font-black text-[10px] text-[#003366] dark:text-blue-400 mb-0.5 tracking-tight">{activeThread.name}</p>
                      )}

                      {/* Image Attachment Preview */}
                      {msg.fileUrl && (msg.fileType?.startsWith('image/') || msg.fileUrl.startsWith('data:image')) && (
                        <div className="rounded-xl overflow-hidden mb-2 cursor-pointer hover:opacity-90 transition-opacity border border-white/20">
                          <img
                            src={msg.fileUrl}
                            alt="Attachment"
                            className="w-full max-h-56 object-cover rounded-xl"
                            onClick={() => setPreviewImageModal(msg.fileUrl!)}
                          />
                        </div>
                      )}

                      {/* Non-Image Document Attachment */}
                      {msg.fileUrl && !(msg.fileType?.startsWith('image/') || msg.fileUrl.startsWith('data:image')) && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 transition-all mb-2"
                        >
                          <span className="material-symbols-outlined text-lg">description</span>
                          <span className="font-bold text-xs truncate flex-1">View File Attachment</span>
                          <span className="material-symbols-outlined text-sm">download</span>
                        </a>
                      )}

                      {msg.text && (
                        <p className="font-medium text-xs whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                      )}

                      <div className="flex items-center justify-end gap-1 pt-1">
                        <span className={`text-[9px] font-semibold ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isMe && (
                          <span className="text-[11px] text-blue-200 font-black">✓✓</span>
                        )}
                      </div>
                    </div>
                    {!isMe && (
                      <button
                        onClick={() => setSelectedMessageForDelete(msg)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-all"
                        title="Delete Message"
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">delete</span>
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Selected File Banner Preview */}
            {selectedFile && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedFile.type.startsWith('image/') ? (
                    <img src={selectedFile.previewUrl} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <span className="material-symbols-outlined text-blue-600 text-xl">description</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{selectedFile.file.name}</p>
                    <p className="text-[9px] text-slate-400">{(selectedFile.file.size / 1024).toFixed(1)} KB • Ready to send</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            )}

            {/* Quick Reply Pills */}
            <div className="w-full max-w-full px-3 sm:px-4 py-2 sm:py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center gap-2 overflow-x-auto shrink-0 min-w-0 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTypedMessage(reply)}
                  className="px-3 py-1.5 text-[9px] sm:text-[10px] font-extrabold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#003366] hover:text-white dark:hover:bg-blue-600 whitespace-nowrap transition-all hover:scale-105 active:scale-95 shadow-xs flex-shrink-0"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="w-full max-w-full p-2.5 sm:p-3.5 md:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 sm:gap-3 rounded-b-2xl md:rounded-b-3xl shrink-0 min-w-0 relative">
              
              {/* Tabbed Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-3 left-2 sm:left-4 z-50 p-3 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl w-72 sm:w-80 space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
                  {/* Category Tabs Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-1">
                    <div className="flex items-center gap-1">
                      {emojiCategories.map((cat, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveEmojiTab(i)}
                          className={`px-2.5 py-1 rounded-xl text-sm transition-all ${
                            activeEmojiTab === i ? 'bg-amber-100 dark:bg-amber-950/60 shadow-xs scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60 hover:opacity-100'
                          }`}
                          title={cat.name}
                        >
                          {cat.icon}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Emoji Grid */}
                  <div className="grid grid-cols-8 gap-1.5 p-1 max-h-48 overflow-y-auto">
                    {emojiCategories[activeEmojiTab].emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-125 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Emoji Picker Toggle Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                  showEmojiPicker ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#003366]'
                }`}
                title="Insert Emoji"
              >
                <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
              </button>

              {/* File Attachment Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#003366] transition-colors flex-shrink-0"
                title="Attach photo or document"
              >
                <span className="material-symbols-outlined text-xl">attach_file</span>
              </button>

              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onFocus={() => setShowEmojiPicker(false)}
                placeholder={`Message ${activeThread.name}...`}
                className={`flex-1 min-w-0 text-xs px-3.5 py-3 sm:px-4.5 sm:py-3.5 rounded-xl sm:rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#003366]/30 ${
                  darkMode ? 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200/90 text-slate-800 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#003366] to-[#002244] hover:from-[#002244] hover:to-[#001122] text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-blue-950/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 flex-shrink-0"
              >
                {isSending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-lg sm:text-xl">send</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 text-[#003366] dark:text-blue-400 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                ✈️
              </div>
              <h3 className="text-base font-extrabold text-gray-800 dark:text-white">ASTU_AMS Hub</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Select a contact from the left or click <strong>"+ New Chat"</strong> to start messaging across ASTU portals.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 px-5 py-2.5 bg-[#003366] text-white text-xs font-bold rounded-xl shadow-lg hover:bg-[#002244] transition-all"
              >
                + Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Message Options Modal ────────────────────────────────────────── */}
      {selectedMessageForDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center font-bold text-xl">
                🗑️
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Delete Message</h3>
                <p className="text-[11px] text-slate-400">Choose deletion option for this message</p>
              </div>
            </div>

            <p className="text-xs italic p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate">
              "{selectedMessageForDelete.text}"
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleDeleteMessage(selectedMessageForDelete.id, false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all text-left flex items-center justify-between"
              >
                <span>Delete for me</span>
                <span className="material-symbols-outlined text-base">person</span>
              </button>

              <button
                onClick={() => handleDeleteMessage(selectedMessageForDelete.id, true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white transition-all text-left flex items-center justify-between shadow-md"
              >
                <span>Delete for everyone</span>
                <span className="material-symbols-outlined text-base">groups</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedMessageForDelete(null)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Conversation Thread Modal ────────────────────────────────────── */}
      {showDeleteThreadModal && activeThread && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Delete Conversation</h3>
                <p className="text-[11px] text-slate-400">Clear chat with {activeThread.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete this entire conversation with <strong>{activeThread.name}</strong>? This action cannot be undone for your account.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteThreadModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteThread}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all"
              >
                Delete Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact Selector Modal ("+ New Chat") ────────────────────────────── */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col ${
            darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-gray-900'
          }`}>

            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✈️</span>
                <h3 className="font-extrabold text-base">New Conversation</h3>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Contact Search Input */}
            <div className="relative">
              <input
                type="text"
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                placeholder="Search candidates, corporate recruiters, registrar, admin..."
                className={`w-full text-xs pl-9 pr-3 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#003366]/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              />
              <span className="material-symbols-outlined text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[350px]">
              {filteredContacts.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-6">No contacts found matching "{contactSearchQuery}".</p>
              ) : (
                filteredContacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleStartChatWithContact(c)}
                    className="w-full p-3 rounded-2xl flex items-center gap-3 text-left hover:bg-blue-50/70 dark:hover:bg-slate-800 transition-all border border-gray-100 dark:border-slate-800/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003366] to-[#0055a5] text-white font-extrabold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold truncate text-gray-900 dark:text-white">{c.name}</p>
                        <span className="px-2 py-0.5 text-[8px] font-extrabold rounded-md bg-blue-100 dark:bg-slate-800 text-[#003366] dark:text-blue-300">
                          {c.roleLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate mt-0.5">{c.secondaryInfo}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Voice Call Modal ──────────────────────────────────────────────────────── */}
      {activeCall && activeThread && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 shadow-2xl flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#003366] to-[#0055a5] text-white text-3xl font-extrabold flex items-center justify-center shadow-xl ring-4 ring-slate-800 relative">
                {getInitials(activeThread.name)}
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-white">{activeThread.name}</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Voice Call • {formatCallDuration(activeCall.duration)}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-md ${
                  activeCall.isMuted ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={activeCall.isMuted ? 'Unmute' : 'Mute'}
              >
                <span className="material-symbols-outlined">{activeCall.isMuted ? 'mic_off' : 'mic'}</span>
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-2xl shadow-lg shadow-rose-950/40 hover:scale-105 active:scale-95 transition-all"
                title="End Call"
              >
                <span className="material-symbols-outlined">call_end</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox Preview Modal ────────────────────────────────────────── */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImageModal(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={previewImageModal} alt="Enlarged preview" className="w-full h-full object-contain rounded-2xl" />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
