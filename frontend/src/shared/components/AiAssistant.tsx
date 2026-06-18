import React, { useState, useRef, useEffect } from 'react';
import {
  X, Send, Sparkles, Mic, Paperclip, RefreshCw, Download,
  Bot, User, BarChart3, ClipboardList, FileText, CheckCircle2,
  Trash2, Volume2, VolumeX, Maximize2, Minimize2, Check, Plus,
  MessageSquare, Edit2, ChevronLeft, Menu, GraduationCap,
  Building2, ScrollText, LifeBuoy, Briefcase, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = {
  navy: '#003366',
  gold: '#E8A020',
  green: '#008C44',
  red: '#E31E24',
};

type AssistantRole = 'alumni' | 'employer' | 'registrar' | 'support';

interface AiAssistantProps {
  role: AssistantRole;
  isOpen: boolean;
  onClose: () => void;
}

type MessageType = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  widget?: 'tracer' | 'survey' | 'custom-report' | 'reminder-success';
  widgetData?: Record<string, unknown>;
};

type ChatSessionType = {
  id: string;
  title: string;
  messages: MessageType[];
  timestamp: string;
};

const ROLE_CONFIG: Record<AssistantRole, {
  title: string;
  subtitle: string;
  badge: string;
  scopeLabel: string;
  icon: React.ReactNode;
  welcomeMsg: string;
  quickActions: { text: string; label: string }[];
  placeholder: string;
  responses: Record<string, string>;
  localStorageKey: string;
}> = {
  alumni: {
    title: 'Alumni AI Assistant',
    subtitle: 'ASTU Alumni Copilot',
    badge: 'ALUMNI',
    scopeLabel: 'Scope: Alumni Portal',
    icon: <GraduationCap className="h-4.5 w-4.5 text-[#E8A020]" />,
    welcomeMsg: "Welcome, Alumni! I am your ASTU Alumni AI Assistant. ⚡\n\nI can help you update your profile, find job opportunities, connect with mentors, request transcripts, and more. Select a quick command or type your query below.",
    quickActions: [
      { text: 'How do I update my profile?', label: 'Update Profile' },
      { text: 'Find job opportunities', label: 'Find Jobs' },
      { text: 'Request transcript', label: 'Transcript' },
      { text: 'Connect with a mentor', label: 'Mentorship' },
    ],
    placeholder: 'Ask about alumni services...',
    responses: {
      profile: "To update your profile, go to the Profile tab in your dashboard. You can edit your personal information, work experience, education, and contact details. Changes will be saved to the ASTU alumni database.",
      job: "You can find job opportunities in the Jobs tab. Employers post positions tailored for ASTU graduates. Use the filters to search by industry, location, or salary range.",
      transcript: "To request an official transcript, go to Document Services in your dashboard. Submit a request and it will be processed by the Registrar's office. Processing takes 3-5 business days.",
      mentor: "The Mentorship tab connects you with experienced alumni and industry professionals. Browse mentor profiles, send connection requests, and schedule virtual meetings.",
    },
    localStorageKey: 'astu_alumni_ai',
  },
  employer: {
    title: 'Employer AI Assistant',
    subtitle: 'ASTU Employer Copilot',
    badge: 'EMPLOYER',
    scopeLabel: 'Scope: Employer Portal',
    icon: <Building2 className="h-4.5 w-4.5 text-[#E8A020]" />,
    welcomeMsg: "Welcome, Employer! I am your ASTU Employer AI Assistant. ⚡\n\nI can help you post job listings, review applications, search for talent, and provide feedback on graduates. Select a quick command or type your query below.",
    quickActions: [
      { text: 'How do I post a job?', label: 'Post Job' },
      { text: 'Review applications', label: 'Applications' },
      { text: 'Search alumni talent', label: 'Talent Search' },
      { text: 'Submit employer feedback', label: 'Feedback' },
    ],
    placeholder: 'Ask about employer services...',
    responses: {
      post: "To post a new job, go to the Job Postings tab. Fill in the position details, requirements, and application deadline. Your posting will be visible to all registered ASTU alumni.",
      applications: "You can review applications in the Applications tab. Each application shows the applicant's profile, resume, and cover letter. You can shortlist, schedule interviews, or reject applicants.",
      talent: "The Talent Search tab lets you find ASTU graduates by department, graduation year, skills, and more. Contact promising candidates directly through the platform.",
      feedback: "We value your feedback! Go to the Feedback tab to rate ASTU graduates on their performance, skills, and preparedness. Your input helps us improve our programs.",
    },
    localStorageKey: 'astu_employer_ai',
  },
  registrar: {
    title: 'Registrar AI Assistant',
    subtitle: 'ASTU Registrar Copilot',
    badge: 'REGISTRAR',
    scopeLabel: 'Scope: Registrar Portal',
    icon: <ScrollText className="h-4.5 w-4.5 text-[#E8A020]" />,
    welcomeMsg: "Welcome, Registrar! I am your ASTU Registrar AI Assistant. ⚡\n\nI can help you manage graduate records, process verifications, handle document requests, and sync data. Select a quick command or type your query below.",
    quickActions: [
      { text: 'How do I manage records?', label: 'Records' },
      { text: 'Process verification requests', label: 'Verifications' },
      { text: 'Handle document requests', label: 'Documents' },
      { text: 'Sync registrar data', label: 'Data Sync' },
    ],
    placeholder: 'Ask about registrar operations...',
    responses: {
      records: "Graduate records are managed in the Records tab. You can view, add, edit, and search alumni records. Each record includes personal info, graduation details, and document status.",
      verifications: "Verification requests appear in the Verification tab. Verify alumni identity and academic credentials against registrar database records. Approve or reject with comments.",
      documents: "Document processing is handled in the Document Services tab. Track transcript requests, degree verifications, and other document orders. Update status as documents are processed.",
      sync: "The Data Integration tab allows you to sync records between the alumni platform and the university's registrar database. Monitor sync status and resolve any conflicts.",
    },
    localStorageKey: 'astu_registrar_ai',
  },
  support: {
    title: 'Support AI Assistant',
    subtitle: 'ASTU Support Copilot',
    badge: 'SUPPORT',
    scopeLabel: 'Scope: Support Portal',
    icon: <LifeBuoy className="h-4.5 w-4.5 text-[#E8A020]" />,
    welcomeMsg: "Welcome! I am your ASTU Support AI Assistant. ⚡\n\nI can help you with common issues, guide you through processes, and answer questions about the ASTU Alumni platform. Select a quick command or type your query below.",
    quickActions: [
      { text: 'How to reset password?', label: 'Password' },
      { text: 'Registration issues', label: 'Registration' },
      { text: 'Account activation', label: 'Activation' },
      { text: 'Contact administrator', label: 'Contact' },
    ],
    placeholder: 'Ask about support topics...',
    responses: {
      password: "To reset your password, go to the login page and click 'Forgot Password'. Enter your registered email or phone number to receive reset instructions. The link expires after 15 minutes.",
      registration: "If you're having trouble registering, ensure you have your student ID ready. Registration requires: first name, last name, student ID, ASTU email, and a strong password. Contact support if issues persist.",
      activation: "Account activation requires the activation link sent to your ASTU email. If you didn't receive it, check your spam folder or request a new activation link from the login page.",
      contact: "You can reach the ASTU administration by submitting a support ticket, emailing support@astust.edu.et, or visiting the registrar's office in person during business hours.",
    },
    localStorageKey: 'astu_support_ai',
  },
};

const DEFAULT_WELCOME = (config: typeof ROLE_CONFIG[AssistantRole], timeStr?: string): MessageType => ({
  id: 'welcome',
  sender: 'assistant',
  text: config.welcomeMsg,
  timestamp: timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export default function AiAssistant({ role, isOpen, onClose }: AiAssistantProps) {
  const config = ROLE_CONFIG[role];

  const [sessions, setSessions] = useState<ChatSessionType[]>(() => {
    try {
      const saved = localStorage.getItem(config.localStorageKey + '_sessions');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [{ id: 'session-default', title: 'New Discussion', messages: [DEFAULT_WELCOME(config, timeNow)], timestamp: timeNow }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(config.localStorageKey + '_active_session');
      if (saved) return saved;
    } catch { /* ignore */ }
    return 'session-default';
  });

  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStep, setTypingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [selectedModel, setSelectedModel] = useState('gpt4-tracer');
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [remindersSent, setRemindersSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeMessages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    try {
      localStorage.setItem(config.localStorageKey + '_sessions', JSON.stringify(sessions));
      localStorage.setItem(config.localStorageKey + '_active_session', activeSessionId);
    } catch { /* ignore */ }
  }, [sessions, activeSessionId, config.localStorageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping, typingStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setIsHistorySidebarOpen(isFullScreen);
  }, [isFullScreen]);

  const getResponse = (query: string): { text: string; widget?: MessageType['widget'] } => {
    const q = query.toLowerCase();
    const res = config.responses;

    if (q.includes('profile') || q.includes('update')) return { text: res.profile || res.contact };
    if (q.includes('job') || q.includes('employ') || q.includes('work')) return { text: res.job || res.post || res.contact };
    if (q.includes('transcript') || q.includes('document') || q.includes('request')) return { text: res.transcript || res.documents || res.contact };
    if (q.includes('mentor') || q.includes('network')) return { text: res.mentor || res.contact };
    if (q.includes('application') || q.includes('applicant') || q.includes('hire')) return { text: res.applications || res.contact };
    if (q.includes('talent') || q.includes('search') || q.includes('graduate')) return { text: res.talent || res.records || res.contact };
    if (q.includes('feedback') || q.includes('review')) return { text: res.feedback || res.contact };
    if (q.includes('record') || q.includes('graduate')) return { text: res.records || res.contact };
    if (q.includes('verif')) return { text: res.verifications || res.contact };
    if (q.includes('sync') || q.includes('import') || q.includes('export')) return { text: res.sync || res.contact };
    if (q.includes('password') || q.includes('reset') || q.includes('forgot')) return { text: res.password || res.contact };
    if (q.includes('register') || q.includes('signup') || q.includes('create')) return { text: res.registration || res.contact };
    if (q.includes('activat') || q.includes('verify')) return { text: res.activation || res.contact };
    if (q.includes('contact') || q.includes('admin') || q.includes('help')) return { text: res.contact || 'You can reach support by submitting a ticket or emailing support@astust.edu.et.' };

    return {
      text: `I received your query: "${query}".\n\nHere are some things I can help with:\n${config.quickActions.map(a => `- "${a.text}"`).join('\n')}`,
    };
  };

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MessageType = { id: `msg-${Date.now()}`, sender: 'user', text: trimmed, timestamp };

    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== activeSessionId) return sess;
        let newTitle = sess.title;
        if (sess.title.toLowerCase().startsWith('new discussion') || sess.title.toLowerCase().startsWith('untitled')) {
          newTitle = trimmed.length > 28 ? trimmed.substring(0, 25) + '...' : trimmed;
        }
        return { ...sess, title: newTitle, messages: [...sess.messages, userMsg], timestamp };
      })
    );

    setInputValue('');
    setIsTyping(true);
    setTypingStep(1);
    setTimeout(() => setTypingStep(2), 400);
    setTimeout(() => setTypingStep(3), 850);

    setTimeout(() => {
      const response = getResponse(trimmed);
      const botMsg: MessageType = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widget: response.widget,
      };

      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === activeSessionId) return { ...sess, messages: [...sess.messages, botMsg] };
          return sess;
        })
      );
      setIsTyping(false);
      setTypingStep(0);
    }, 1400);
  };

  const handleQuickAction = (actionText: string) => handleSendMessage(actionText);

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSessions((prev) => [{ id: newId, title: 'New Discussion', messages: [DEFAULT_WELCOME(config, timestamp)], timestamp }, ...prev]);
    setActiveSessionId(newId);
    setAttachedFile(null);
    setRemindersSent(false);
    if (!isFullScreen) setIsHistorySidebarOpen(false);
    toast.success('Started a new discussion thread');
  };

  const handleDeleteSession = (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) { toast.error('Cannot delete the last remaining thread.'); return; }
    const updated = sessions.filter((s) => s.id !== sessionIdToDelete);
    setSessions(updated);
    if (activeSessionId === sessionIdToDelete) setActiveSessionId(updated[0].id);
    toast.success('Discussion thread removed.');
  };

  const handleSaveRename = (sessionId: string) => {
    if (!editingTitleText.trim()) return;
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s));
    setEditingSessionId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => { setIsUploading(false); setAttachedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' }); toast.success(`Attached ${file.name}`); }, 300); return 100; }
        return prev + 30;
      });
    }, 200);
  };

  const toggleListening = () => {
    if (isListening) { setIsListening(false); return; }
    setIsListening(true);
    toast('Listening for voice query...', { icon: '🎙️' });
    setTimeout(() => { setInputValue(config.quickActions[0]?.text || ''); setIsListening(false); toast.success('Voice captured!'); }, 3000);
  };

  const handleExportTranscript = () => {
    const textContent = activeMessages.map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ASTU-${role}-Copilot-Session-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Chat session transcript downloaded.');
  };

  const handleClearHistory = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSessions([{ id: 'session-default', title: 'New Discussion', messages: [DEFAULT_WELCOME(config, timestamp)], timestamp }]);
    setActiveSessionId('session-default');
    localStorage.removeItem(config.localStorageKey + '_sessions');
    localStorage.removeItem(config.localStorageKey + '_active_session');
    setAttachedFile(null);
    setRemindersSent(false);
    toast.success('All chat threads cleared.');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[3px] transition-opacity duration-300" onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-[#13161f] ${isFullScreen ? 'w-full md:w-[90vw]' : 'w-full md:w-[480px] lg:w-[520px]'}`} style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }}>
        <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.green} 35%, ${COLORS.gold} 70%, ${COLORS.red} 100%)` }} />

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
              className={`rounded-lg p-1.5 transition-all text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 ${isHistorySidebarOpen ? 'bg-[#003366]/5 text-[#003366] dark:bg-[#E8A020]/10 dark:text-[#E8A020]' : ''}`}>
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#003366] to-[#0a4d8c] text-white shadow-md">
              <Sparkles className="h-4.5 w-4.5 text-[#E8A020]" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-extrabold text-[#003366] dark:text-[#E8A020] leading-none">{config.title}</h2>
                <span className="rounded bg-[#003366]/10 px-1 py-0.2 text-[8px] font-bold text-[#003366] dark:bg-[#E8A020]/20 dark:text-[#E8A020]">{config.badge}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{config.scopeLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setIsSoundOn(!isSoundOn)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200">
              {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setIsFullScreen(!isFullScreen)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200">
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-100 px-3 bg-slate-50 dark:bg-[#161a25] dark:border-slate-800 shrink-0 items-center justify-between">
          <div className="flex">
            <button type="button" onClick={() => setActiveTab('chat')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeTab === 'chat' ? 'border-[#003366] text-[#003366] dark:border-[#E8A020] dark:text-[#E8A020]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              Assistant Chat
            </button>
            <button type="button" onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeTab === 'settings' ? 'border-[#003366] text-[#003366] dark:border-[#E8A020] dark:text-[#E8A020]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              Settings
            </button>
          </div>
          {activeTab === 'chat' && (
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-slate-500 outline-none hover:text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
              <option value="gpt4">GPT-4</option>
              <option value="claude">Claude 3.5</option>
              <option value="astu-llama">ASTU Llama</option>
            </select>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {isHistorySidebarOpen && (
            <div className={`absolute md:relative inset-y-0 left-0 z-10 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1a1d27] transition-all duration-300 ${isFullScreen ? 'w-64' : 'w-52 md:w-56'}`}>
              <div className="p-3 shrink-0">
                <button type="button" onClick={handleNewChat}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:border-[#003366] hover:text-[#003366] dark:border-slate-700 dark:text-slate-400 dark:hover:border-[#E8A020] dark:hover:text-[#E8A020] transition-all">
                  <Plus className="h-3.5 w-3.5" /> New Discussion
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                {sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  const isEditing = editingSessionId === sess.id;
                  return (
                    <div key={sess.id} onClick={() => { setActiveSessionId(sess.id); if (!isFullScreen) setIsHistorySidebarOpen(false); }}
                      className={`group relative flex items-center justify-between rounded-lg p-2.5 text-xs font-medium cursor-pointer transition-all ${isActive ? 'bg-[#003366]/5 text-[#003366] dark:bg-[#E8A020]/10 dark:text-[#E8A020] border-l-2 border-[#003366] dark:border-[#E8A020]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:text-slate-400'}`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        {isEditing ? (
                          <input type="text" value={editingTitleText} onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(sess.id); if (e.key === 'Escape') setEditingSessionId(null); }}
                            autoFocus className="w-full bg-white border border-slate-200 outline-none text-[11px] rounded px-1 dark:bg-slate-800 dark:border-slate-700"
                            onClick={(e) => e.stopPropagation()} />
                        ) : (
                          <span className="truncate text-[11px] leading-tight pr-4 font-semibold">{sess.title}</span>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="absolute right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/90 dark:bg-[#1a1d27]/90 px-1 rounded">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setEditingSessionId(sess.id); setEditingTitleText(sess.title); }}
                            className="p-0.5 hover:text-[#003366] dark:hover:text-[#E8A020]"><Edit2 className="h-3 w-3" /></button>
                          <button type="button" onClick={(e) => handleDeleteSession(sess.id, e)}
                            className="p-0.5 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-200 p-2.5 dark:border-slate-800 text-center shrink-0">
                <button type="button" onClick={handleClearHistory}
                  className="text-[9px] font-extrabold text-red-500/80 hover:text-red-500 uppercase tracking-widest flex items-center justify-center gap-1 w-full hover:bg-red-500/5 py-1 rounded">
                  <Trash2 className="h-3 w-3" /> Clear All Threads
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-[#0c0e14]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs ${isUser ? 'bg-[#008C44]' : 'bg-gradient-to-br from-[#003366] to-[#0a4d8c]'}`}>
                        {isUser ? <User className="h-4 w-4" /> : config.icon}
                      </div>
                      <div className="max-w-[78%] space-y-2.5">
                        <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${isUser ? 'bg-[#003366] text-white shadow-sm rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none dark:bg-[#1a1d27] dark:border-slate-800 dark:text-slate-100'}`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[9px] opacity-65">
                            <span>{msg.timestamp}</span>
                            {!isUser && <span className="font-semibold text-[#E8A020]">{config.badge} AI</span>}
                          </div>
                          {!isUser && (
                            <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100/60 pt-1.5 dark:border-slate-700/60">
                              <span className="text-[9px] text-slate-400">Rate:</span>
                              <button type="button" onClick={() => toast.success('Feedback recorded: Helpful!')}
                                className="text-[10px] opacity-70 hover:opacity-100">👍</button>
                              <button type="button" onClick={() => toast.success('Feedback recorded: Not helpful.')}
                                className="text-[10px] opacity-70 hover:opacity-100">👎</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#003366] to-[#0a4d8c] text-white">
                      <Bot className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 max-w-[78%]">
                      <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white px-4 py-3 shadow-sm dark:bg-[#1a1d27] dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-[9px] dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          <Sparkles className="h-3 w-3 animate-spin text-[#E8A020] shrink-0" />
                          <span>Assistant Steps</span>
                        </div>
                        <div className="space-y-1 text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-emerald-500" /><span>Processing your request...</span></div>
                          {typingStep >= 2 && <div className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-emerald-500" /><span>Searching relevant information...</span></div>}
                          {typingStep >= 3 && <div className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-emerald-500" /><span>Generating response...</span></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-100 bg-white px-4 py-2.5 dark:bg-[#13161f] dark:border-slate-800 shrink-0">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Quick Actions</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {config.quickActions.map((chip) => (
                    <button key={chip.text} type="button" onClick={() => handleQuickAction(chip.text)} disabled={isTyping}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-[#003366] hover:bg-[#003366]/5 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-[#E8A020] dark:hover:bg-[#E8A020]/5 disabled:opacity-50">
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {attachedFile && (
                <div className="border-t border-slate-100 bg-emerald-50/40 px-4 py-2 flex items-center justify-between dark:bg-[#0c0e14] dark:border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Check className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-bold truncate max-w-[280px]">Attached: {attachedFile.name} ({attachedFile.size})</span>
                  </div>
                  <button type="button" onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-slate-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              )}

              {isUploading && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 space-y-1 dark:bg-[#0c0e14] dark:border-slate-800">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Uploading...</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 bg-white p-3 dark:bg-[#13161f] dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={toggleListening}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                    <Mic className="h-4.5 w-4.5" />
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700">
                    <Paperclip className="h-4.5 w-4.5" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls,.pdf" className="hidden" />
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputValue); }}
                    disabled={isTyping} placeholder={config.placeholder}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#003366] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-[#1a1d27] dark:text-slate-100 dark:focus:border-[#E8A020]" />
                  <button type="button" onClick={() => handleSendMessage(inputValue)} disabled={!inputValue.trim() || isTyping}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003366] text-white transition-all hover:bg-[#002244] disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[#E8A020] dark:text-slate-900 dark:hover:bg-[#d08f1b]">
                    <Send className="h-4 w-4 rotate-45" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800/60">
                  <div className="flex gap-2">
                    <button type="button" onClick={handleExportTranscript} className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200">
                      <Download className="h-3 w-3" /> Export
                    </button>
                    <button type="button" onClick={handleClearHistory} className="flex items-center gap-1 hover:text-[#E31E24]">
                      <RefreshCw className="h-3 w-3" /> Reset
                    </button>
                  </div>
                  <span>ESC to close</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto bg-slate-50/30 p-4 space-y-5 dark:bg-[#0c0e14]">
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-[#003366] dark:text-[#E8A020] uppercase tracking-wider">AI Configuration</h3>
                <p className="text-[10px] text-slate-400">Configure parameters for the {config.badge} AI assistant.</p>
              </div>
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#1a1d27]">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-600 dark:text-slate-300">Temperature</span>
                    <span className="text-[#003366] dark:text-[#E8A020]">0.3 (Balanced)</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" defaultValue="0.3" className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">System Instruction</label>
                  <textarea defaultValue={`You are ASTU AI Assistant for the ${config.badge} portal. Help users navigate and use the ASTU Alumni Management System.`} rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px] leading-relaxed outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-800/40" />
                </div>
              </div>
              <button type="button" onClick={() => { setActiveTab('chat'); toast.success('Settings saved.'); }}
                className="w-full rounded-lg bg-[#003366] py-2 text-xs font-bold text-white hover:bg-[#002244] dark:bg-[#E8A020] dark:text-slate-900">
                Save & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
