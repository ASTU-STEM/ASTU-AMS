import React, { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

interface AlumniMessage {
  id: number;
  sender: 'Alumni' | 'Recruiter' | 'System' | 'Registrar' | 'Mentor';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface MessagingTabProps {
  darkMode: boolean;
  userId?: string;
}

interface Thread {
  id: string;
  label: string;
  desc: string;
  initials: string;
  color: string;
  gradient: string;
  online: boolean;
  unread: number;
  lastMessage: string;
  lastTime: string;
}

const THREADS: Thread[] = [
  { id: 'admin-1', label: 'System Admin', desc: 'Platform Updates', initials: 'SA', color: 'bg-red-500', gradient: 'from-red-400 to-rose-500', online: true, unread: 1, lastMessage: 'Welcome to the new ASTU Alumni Portal!', lastTime: '10:00 AM' },
  { id: 'registrar-1', label: 'Office of Registrar', desc: 'Document Services', initials: 'OR', color: 'bg-blue-500', gradient: 'from-blue-400 to-indigo-500', online: true, unread: 0, lastMessage: 'Your transcript request is being processed.', lastTime: 'Yesterday' },
  { id: 'mentor-1', label: 'Dr. Abebe Bekele', desc: 'Mentor', initials: 'AB', color: 'bg-purple-500', gradient: 'from-purple-400 to-fuchsia-500', online: false, unread: 0, lastMessage: 'Let\'s schedule our next session for Friday.', lastTime: '2 days ago' },
];

const INITIAL_MESSAGES: Record<string, AlumniMessage[]> = {
  'admin-1': [
    { id: 1, sender: 'System', senderName: 'System Admin', text: 'Welcome to the new ASTU Alumni Portal!', timestamp: '10:00 AM', status: 'delivered' }
  ],
  'registrar-1': [
    { id: 1, sender: 'Registrar', senderName: 'Office of Registrar', text: 'Your transcript request is being processed.', timestamp: 'Yesterday', status: 'read' }
  ],
  'mentor-1': [
    { id: 1, sender: 'Mentor', senderName: 'Dr. Abebe Bekele', text: 'Great progress on your CV. Let\'s schedule our next session for Friday.', timestamp: '2 days ago', status: 'read' }
  ]
};

const THREAD_META: Record<string, { name: string; role: string; initials: string; gradient: string; online: boolean }> = {
  'admin-1': { name: 'System Admin', role: 'Platform Support', initials: 'SA', gradient: 'from-red-400 to-rose-500', online: true },
  'registrar-1': { name: 'Office of Registrar', role: 'Document Services', initials: 'OR', gradient: 'from-blue-400 to-indigo-500', online: true },
  'mentor-1': { name: 'Dr. Abebe Bekele', role: 'Mentor', initials: 'AB', gradient: 'from-purple-400 to-fuchsia-500', online: false },
};

import { alumniService } from '../services/alumni.service';
import { io, Socket } from 'socket.io-client';

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode, userId }) => {
  const [activeThread, setActiveThread] = useState(THREADS[0]?.id || '');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [threads, setThreads] = useState<Thread[]>(THREADS);
  const [messages, setMessages] = useState<Record<string, AlumniMessage[]>>(INITIAL_MESSAGES);
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    alumniService.getMessageThreads().then((realThreads: any[]) => {
      if (realThreads && realThreads.length > 0) {
        setThreads(prev => {
          // Merge real threads, keeping existing mock threads if they don't overlap by ID
          const newThreads = [...prev];
          realThreads.forEach(rt => {
            if (!newThreads.find(t => t.id === rt.id)) {
              newThreads.push(rt);
            }
          });
          return newThreads;
        });
        
        setActiveThread((prev) => prev || realThreads[0].id);
        
        // Add meta for real threads
        realThreads.forEach(t => {
          THREAD_META[t.id] = {
            name: t.label,
            role: 'Recruiter',
            initials: t.initials,
            gradient: t.gradient,
            online: t.online
          };
        });
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('register', userId);
    });

    newSocket.on('newMessage', (msg: any) => {
      const threadId = `recruiter-${msg.employerId}`;
      const formattedMsg: AlumniMessage = {
        id: msg.id,
        sender: msg.sender === 'ALUMNI' ? 'Alumni' : 'Recruiter',
        senderName: msg.sender === 'ALUMNI' ? 'You' : (THREAD_META[threadId]?.name || 'Recruiter'),
        text: msg.text,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: msg.isRead ? 'read' : 'delivered'
      };

      setMessages(prev => {
        const threadMsgs = prev[threadId] || [];
        // Prevent duplicate messages if sender is Alumni and it was already appended optimistically
        if (threadMsgs.find(m => m.id === formattedMsg.id || (m.text === formattedMsg.text && m.sender === formattedMsg.sender))) {
          return prev;
        }
        return {
          ...prev,
          [threadId]: [...threadMsgs, formattedMsg]
        };
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (activeThread.startsWith('recruiter-')) {
      const employerId = activeThread.replace('recruiter-', '');
      alumniService.getThreadMessages(employerId).then((data: any[]) => {
        setMessages(prev => ({ ...prev, [activeThread]: data }));
      }).catch(err => console.error(err));
    }
  }, [activeThread]);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`
        }]);
      });
      toast.success(`${files.length} file(s) attached`);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const emojis = ['😊', '👍', '🎉', '🚀', '👋', '🔥', '💡', '📌', '✅', '🌟', '❤️', '💪', '🙏', '🎯', '✨', '🎓'];

  const currentMessages = useMemo(() => messages[activeThread] || [], [messages, activeThread]);
  const currentMeta = THREAD_META[activeThread] || null;

  const quickReplies: Record<string, string[]> = {
    recruiter: ['I am available after 2:00 PM.', 'Could we reschedule?', 'Please share the job description.'],
    registrar: ['When will my document be ready?', 'Can I expedite the process?', 'Thank you for the update!'],
    mentor: ['Can we schedule a session?', 'Thanks for the feedback!', 'I will share the updated draft.'],
    system: ['How do I complete the survey?', 'Show my document status.'],
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    if (activeThread.startsWith('recruiter-')) {
      try {
        const employerId = activeThread.replace('recruiter-', '');
        const msg: any = await alumniService.sendMessage(employerId, typedMessage.trim());
        setMessages(prev => {
          const threadMsgs = prev[activeThread] || [];
          return {
            ...prev,
            [activeThread]: [...threadMsgs, msg],
          };
        });
        setTypedMessage('');
      } catch (err) {
        toast.error('Failed to send message');
      }
    } else {
      const newMsg: AlumniMessage = {
        id: Date.now(),
        sender: 'Alumni',
        senderName: 'You',
        text: typedMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };

      setMessages(prev => {
        const threadMsgs = prev[activeThread] || [];
        return {
          ...prev,
          [activeThread]: [...threadMsgs, newMsg],
        };
      });
      setTypedMessage('');

      // Simulate typing indicator and auto-reply
      setTimeout(() => setIsTyping(true), 800);
      setTimeout(() => {
        setIsTyping(false);
        const autoReplies: Record<string, string> = {
          recruiter: 'Got it! Talk to you then. I will send the calendar invite shortly.',
          registrar: 'Thank you for reaching out. We will update you on the status soon.',
          mentor: "That's a great idea! Let me check my schedule and get back to you.",
          system: 'Acknowledged. Your request has been logged in the system.',
        };
        const reply: AlumniMessage = {
          id: Date.now() + 1,
          sender: activeThread === 'recruiter' ? 'Recruiter' : activeThread === 'registrar' ? 'Registrar' : activeThread === 'mentor' ? 'Mentor' : 'System',
          senderName: currentMeta.name,
          text: autoReplies[activeThread] || 'Received. We will respond shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
        };
        setMessages(prev => {
          const threadMsgs = prev[activeThread] || [];
          return {
            ...prev,
            [activeThread]: [...threadMsgs, reply],
          };
        });
      }, 2200);
    }
  };

  const handleThreadSwitch = (threadId: string) => {
    setActiveThread(threadId);
    setMobileShowThread(true);
  };

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  return (
    <>
      {threads.length > 0 ? (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="grid min-h-[600px] grid-cols-1 lg:grid-cols-[300px_1fr]">

        {/* Sidebar: Thread List */}
        <aside className={`border-b lg:border-b-0 lg:border-r border-[var(--border-color)] flex flex-col ${mobileShowThread && activeThread ? 'hidden lg:flex' : 'flex'}`}>
          {/* Thread Header */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">Messages</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-semibold mt-0.5">
                  {totalUnread} unread conversation{totalUnread !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#003366]/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full text-xs p-2.5 pl-8 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Thread Items */}
          <div className="flex-1 overflow-y-auto">
            {threads.map(thread => {
              const isActive = activeThread === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => handleThreadSwitch(thread.id)}
                  className={`w-full p-4 text-left transition-all duration-200 border-b border-[var(--border-color)] hover:bg-[var(--bg-page)] ${isActive ? 'bg-[var(--bg-page)] border-l-[3px] border-l-[#003366]' : 'border-l-[3px] border-l-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full ${thread.gradient} flex items-center justify-center text-white text-xs font-extrabold shadow-md`}>
                        {thread.initials}
                      </div>
                      {thread.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--bg-card)]"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">{thread.label}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium flex-shrink-0">{thread.lastTime}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{thread.desc}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5 opacity-70">{thread.lastMessage}</p>
                    </div>
                    {thread.unread > 0 && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#CC0033] flex items-center justify-center">
                        <span className="text-[9px] font-extrabold text-white">{thread.unread}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className={`flex flex-col min-h-[600px] ${!mobileShowThread && activeThread ? 'hidden lg:flex' : 'flex'}`}>

          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileShowThread(false)}
                className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-[var(--bg-page)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="relative">
                <div className={`w-10 h-10 rounded-full ${currentMeta.gradient} flex items-center justify-center text-white text-xs font-extrabold shadow-md`}>
                  {currentMeta.initials}
                </div>
                {currentMeta.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-card)]"></div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{currentMeta.name}</h4>
                <div className="flex items-center gap-1.5">
                  {currentMeta.online ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active now
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">Offline</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[var(--bg-page)] transition-colors text-[var(--text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-[var(--bg-page)] transition-colors text-[var(--text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-[var(--bg-page)] transition-colors text-[var(--text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[var(--bg-page)]/30">
            {/* Date Separator */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[var(--border-color)]"></div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Today</span>
              <div className="flex-1 h-px bg-[var(--border-color)]"></div>
            </div>

            {currentMessages.map((msg) => {
              const isMe = msg.sender === 'Alumni';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <div className={`w-7 h-7 rounded-full ${currentMeta.gradient} flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0 shadow-sm`}>
                        {currentMeta.initials}
                      </div>
                    )}
                    <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${isMe
                          ? 'bg-gradient-to-br from-[#003366] to-[#004d99] text-white rounded-br-md'
                          : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-md'
                        }`}>
                        <p className="font-medium">{msg.text}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[9px] text-[var(--text-muted)] font-medium">{msg.timestamp}</span>
                        {isMe && msg.status && (
                          <span className="text-[9px] text-[#003366]">
                            {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className={`w-7 h-7 rounded-full ${currentMeta.gradient} flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0 shadow-sm`}>
                  {currentMeta.initials}
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-5 pt-3 pb-1 flex flex-wrap gap-2 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
            {(quickReplies[activeThread] || quickReplies.recruiter).map(reply => (
              <button
                key={reply}
                type="button"
                onClick={() => setTypedMessage(reply)}
                className="px-3 py-1.5 text-[10px] font-bold rounded-full border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[#003366]/5 hover:border-[#003366]/20 hover:text-[#003366] transition-all duration-200"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="px-5 py-2 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-page)] rounded-lg border border-[var(--border-color)] text-[10px] font-medium">
                    <svg className="w-3.5 h-3.5 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[var(--text-primary)]">{file.name}</span>
                    <span className="text-[var(--text-muted)]">({file.size})</span>
                    <button onClick={() => handleRemoveFile(file.name)} className="text-[var(--text-muted)] hover:text-red-500 ml-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="px-5 py-2 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
              <div className="flex flex-wrap gap-1">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setTypedMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bg-page)] rounded-lg transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSend} className="px-5 py-3 bg-[var(--bg-card)]">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-[var(--bg-page)] transition-colors text-[var(--text-secondary)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileAttach} />
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-lg hover:bg-[var(--bg-page)] transition-colors text-[var(--text-secondary)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder={`Message ${currentMeta.name}...`}
                  className="w-full text-xs p-3 pr-10 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] focus:bg-[var(--bg-card)] transition-all duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                disabled={!typedMessage.trim() && attachedFiles.length === 0}
                className={`p-3 rounded-xl transition-all duration-300 shadow-md ${typedMessage.trim() || attachedFiles.length > 0
                    ? 'bg-gradient-to-r from-[#003366] to-[#004d99] text-white hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-[var(--bg-page)] text-[var(--text-muted)] cursor-not-allowed shadow-none'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
        </div>
        </div>
      ) : (
        <div className={`flex h-[calc(100vh-140px)] min-h-[500px] items-center justify-center rounded-[20px] border border-[var(--border-color)] bg-[var(--bg-color)] shadow-sm ${darkMode ? 'shadow-black/20' : ''}`}>
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-[var(--text-muted)] mb-4 block">chat_bubble_outline</span>
            <h3 className="text-xl font-semibold text-[var(--text-color)]">No Messages Yet</h3>
            <p className="mt-2 text-[var(--text-muted)] max-w-md">When recruiters or mentors send you a message, you will see them here.</p>
          </div>
        </div>
      )}
    </>
  );
};