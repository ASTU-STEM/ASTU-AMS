import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Mic,
  Paperclip,
  RefreshCw,
  Download,
  Bot,
  User,
  BarChart3,
  ClipboardList,
  Sliders,
  FileText,
  CheckCircle2,
  Trash2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Check,
  Plus,
  MessageSquare,
  Edit2,
  ChevronLeft,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';

// Theme Colors
const COLORS = {
  navy: '#003366',
  gold: '#E8A020',
  green: '#008C44',
  red: '#E31E24',
};

interface AdminAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

type MessageType = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  widget?: 'tracer' | 'survey' | 'custom-report' | 'reminder-success';
  widgetData?: any;
};

type ChatSessionType = {
  id: string;
  title: string;
  messages: MessageType[];
  timestamp: string;
};

const DEFAULT_WELCOME_MSG = (timeStr?: string): MessageType => ({
  id: 'welcome',
  sender: 'assistant',
  text: "Welcome, Administrator. I am your ASTU AI Copilot. ⚡\n\nI can analyze post-graduation tracer studies, display survey completion analytics, or query employment metrics by department. Select a quick command or type your query below.",
  timestamp: timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export default function AdminAiAssistant({ isOpen, onClose }: AdminAiAssistantProps) {
  // Load initial sessions from localStorage or default
  const [sessions, setSessions] = useState<ChatSessionType[]>(() => {
    try {
      const saved = localStorage.getItem('astu_admin_ai_sessions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load chat sessions from localStorage', e);
    }
    
    // Default session
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'session-default',
        title: 'Tracer Analytics Core',
        messages: [DEFAULT_WELCOME_MSG(timeNow)],
        timestamp: timeNow,
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('astu_admin_ai_active_session_id');
      if (savedActive) return savedActive;
    } catch (e) {}
    return 'session-default';
  });

  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStep, setTypingStep] = useState(0); // Agent thought stages
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

  // Active messages selector
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeMessages = activeSession ? activeSession.messages : [];

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('astu_admin_ai_sessions', JSON.stringify(sessions));
      localStorage.setItem('astu_admin_ai_active_session_id', activeSessionId);
    } catch (e) {
      console.error('Failed to sync chat sessions to localStorage', e);
    }
  }, [sessions, activeSessionId]);

  // Auto scroll to bottom when messages or typing step changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping, typingStep]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Default toggle view state for history panel when full screen toggles
  useEffect(() => {
    if (isFullScreen) {
      setIsHistorySidebarOpen(true);
    } else {
      setIsHistorySidebarOpen(false);
    }
  }, [isFullScreen]);

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg: MessageType = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp,
    };

    // Update messages in the active session
    let updatedSessions = sessions.map((sess) => {
      if (sess.id === activeSessionId) {
        let newTitle = sess.title;
        // Auto-title if it is a new discussion
        if (sess.title.toLowerCase().startsWith('new discussion') || sess.title.toLowerCase().startsWith('untitled')) {
          newTitle = trimmed.length > 28 ? trimmed.substring(0, 25) + '...' : trimmed;
        }
        return {
          ...sess,
          title: newTitle,
          messages: [...sess.messages, userMsg],
          timestamp,
        };
      }
      return sess;
    });

    setSessions(updatedSessions);
    setInputValue('');
    setIsTyping(true);
    setTypingStep(1);

    // Animate reasoning stages
    setTimeout(() => setTypingStep(2), 400);
    setTimeout(() => setTypingStep(3), 850);

    // Simulated AI response logic
    setTimeout(() => {
      let botMsg: MessageType = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const query = trimmed.toLowerCase();

      if (query.includes('tracer') || query.includes('employment') || query.includes('cse') || query.includes('department')) {
        botMsg.text = "I have queried the ASTU Registrar DB & Careers portal. Here is the employment breakdown for Computer Science & Engineering (CSE) graduates vs other engineering fields from the 2025 cohort:";
        botMsg.widget = 'tracer';
      } else if (query.includes('survey') || query.includes('response') || query.includes('completion') || query.includes('wave')) {
        botMsg.text = "Here is the response tracking statistics for 'Alumni Survey Wave 3' (Target: 2025 Graduates):";
        botMsg.widget = 'survey';
      } else if (query.includes('report') || query.includes('summary') || query.includes('salary')) {
        botMsg.text = "Sure, I have generated a consolidated Tracer Study salary and placement report for the engineering departments:";
        botMsg.widget = 'custom-report';
      } else if (query.includes('reminder') || query.includes('notify') || query.includes('unregistered')) {
        botMsg.text = "Survey records indicate 184 registered alumni from Adama Science and Technology University have not completed the active Tracer Survey (Wave 3).";
        botMsg.widget = 'survey'; // Offers completion visual with reminder action button
      } else {
        botMsg.text = `I received your query: "${trimmed}". 

Here are some helpful questions you can ask me:
- "Compare employment rates by department"
- "Show response rate for Survey Wave 3"
- "Generate starting salary report"
- "Draft text warning/reminder for incomplete survey users"`;
      }

      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, botMsg],
            };
          }
          return sess;
        })
      );

      setIsTyping(false);
      setTypingStep(0);
    }, 1400);
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  // Create new session/thread
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newSession: ChatSessionType = {
      id: newId,
      title: 'New Discussion',
      messages: [DEFAULT_WELCOME_MSG(timestamp)],
      timestamp,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setAttachedFile(null);
    setRemindersSent(false);
    
    if (!isFullScreen) {
      setIsHistorySidebarOpen(false); // Auto close sidebar on narrow screen
    }
    toast.success('Started a new discussion thread');
  };

  // Delete a specific session
  const handleDeleteSession = (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the thread while clicking delete
    
    if (sessions.length <= 1) {
      toast.error('Cannot delete the last remaining thread.');
      return;
    }

    const updated = sessions.filter((s) => s.id !== sessionIdToDelete);
    setSessions(updated);

    // If active is deleted, switch
    if (activeSessionId === sessionIdToDelete) {
      setActiveSessionId(updated[0].id);
    }
    toast.success('Discussion thread removed.');
  };

  // Rename a session thread
  const handleSaveRename = (sessionId: string) => {
    if (!editingTitleText.trim()) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            title: editingTitleText.trim(),
          };
        }
        return s;
      })
    );
    setEditingSessionId(null);
  };

  // Simulate File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate progression
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setAttachedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
            toast.success(`Attached ${file.name}`);
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Simulate Voice input
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    toast('Listening for voice query...', { icon: '🎙️' });
    
    setTimeout(() => {
      setInputValue('Compare employment rates by department');
      setIsListening(false);
      toast.success('Voice captured!');
    }, 3000);
  };

  const triggerSendReminders = () => {
    if (remindersSent) return;
    setRemindersSent(true);
    toast.success('System reminders dispatched to 184 alumni via SMS and Email.', {
      duration: 4000,
    });
    
    // Append system message inside chat
    setTimeout(() => {
      const botSysMsg: MessageType = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: "🔄 System update: Tracer study reminder notifications have been batched and sent out. The response tracker will automatically refresh as users submit.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widget: 'reminder-success'
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, botSysMsg],
            };
          }
          return s;
        })
      );
    }, 800);
  };

  const handleExportTranscript = () => {
    const textContent = activeMessages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n\n');
    
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ASTU-Copilot-Session-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Copilot chat session transcript downloaded.');
  };

  const handleClearHistory = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Reset to one default session
    setSessions([
      {
        id: 'session-default',
        title: 'Tracer Analytics Core',
        messages: [DEFAULT_WELCOME_MSG(timestamp)],
        timestamp,
      }
    ]);
    setActiveSessionId('session-default');
    localStorage.removeItem('astu_admin_ai_sessions');
    localStorage.removeItem('astu_admin_ai_active_session_id');
    setAttachedFile(null);
    setRemindersSent(false);
    toast.success('All chat threads cleared.');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[3px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Panel Wrapper */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-[#13161f] ${
          isFullScreen ? 'w-full md:w-[90vw]' : 'w-full md:w-[480px] lg:w-[520px]'
        }`}
        style={{
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Adama Stripe Top Decor */}
        <div 
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.green} 35%, ${COLORS.gold} 70%, ${COLORS.red} 100%)`
          }}
        />

        {/* Header section */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Toggle History Sidebar Button */}
            <button
              type="button"
              onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
              className={`rounded-lg p-1.5 transition-all text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 ${
                isHistorySidebarOpen ? 'bg-[#003366]/5 text-[#003366] dark:bg-[#E8A020]/10 dark:text-[#E8A020]' : ''
              }`}
              title="Toggle Chat Threads List"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#003366] to-[#0a4d8c] text-white shadow-md">
              <Sparkles className="h-4.5 w-4.5 text-[#E8A020]" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-extrabold text-[#003366] dark:text-[#E8A020] leading-none">ASTU AI Copilot</h2>
                <span className="rounded bg-[#003366]/10 px-1 py-0.2 text-[8px] font-bold text-[#003366] dark:bg-[#E8A020]/20 dark:text-[#E8A020]">AGENT</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Scope: ASTU DB Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              title={isSoundOn ? 'Mute assistance' : 'Unmute assistance'}
            >
              {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              title={isFullScreen ? 'Exit full screen' : 'Expand full screen'}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 px-3 bg-slate-50 dark:bg-[#161a25] dark:border-slate-800 shrink-0 items-center justify-between">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-[#003366] text-[#003366] dark:border-[#E8A020] dark:text-[#E8A020]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Assistant Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-[#003366] text-[#003366] dark:border-[#E8A020] dark:text-[#E8A020]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Copilot Settings
            </button>
          </div>

          {/* Model Selection Dropdown (Only in Chat mode) */}
          {activeTab === 'chat' && (
            <div className="flex items-center pr-1">
              <label htmlFor="model-select" className="sr-only">AI Agent Model</label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-500 outline-none hover:text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 select-none"
              >
                <option value="gpt4-tracer">GPT-4 Tracer Pro</option>
                <option value="claude-35">Claude 3.5 Analytics</option>
                <option value="astu-llama">ASTU Llama-3 Fine-tuned</option>
              </select>
            </div>
          )}
        </div>

        {/* Master-Detail Multi-Thread Split Area */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Collapsible Session History Panel */}
          {isHistorySidebarOpen && (
            <div 
              className={`absolute md:relative inset-y-0 left-0 z-10 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1a1d27] transition-all duration-300 ${
                isFullScreen ? 'w-64' : 'w-52 md:w-56'
              }`}
            >
              {/* New Thread Trigger */}
              <div className="p-3 shrink-0">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:border-[#003366] hover:text-[#003366] dark:border-slate-700 dark:text-slate-400 dark:hover:border-[#E8A020] dark:hover:text-[#E8A020] transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Discussion</span>
                </button>
              </div>

              {/* Thread list scroll view */}
              <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                {sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  const isEditing = editingSessionId === sess.id;

                  return (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setActiveSessionId(sess.id);
                        if (!isFullScreen) {
                          setIsHistorySidebarOpen(false); // Close sidebar after selecting thread on narrow screens
                        }
                      }}
                      className={`group relative flex items-center justify-between rounded-lg p-2.5 text-xs font-medium cursor-pointer transition-all select-none ${
                        isActive
                          ? 'bg-[#003366]/5 text-[#003366] dark:bg-[#E8A020]/10 dark:text-[#E8A020] border-l-2 border-[#003366] dark:border-[#E8A020]'
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(sess.id);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            autoFocus
                            className="w-full bg-white border border-slate-200 outline-none text-[11px] rounded px-1 dark:bg-slate-800 dark:border-slate-700"
                            onClick={(e) => e.stopPropagation()} // Stop switching thread while editing
                          />
                        ) : (
                          <span className="truncate text-[11px] leading-tight pr-4 font-semibold">{sess.title}</span>
                        )}
                      </div>

                      {/* Options (Rename & Delete) */}
                      {!isEditing && (
                        <div className="absolute right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/90 dark:bg-[#1a1d27]/90 px-1 rounded">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(sess.id);
                              setEditingTitleText(sess.title);
                            }}
                            className="p-0.5 hover:text-[#003366] dark:hover:text-[#E8A020] transition-colors"
                            title="Rename Thread"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(sess.id, e)}
                            className="p-0.5 hover:text-red-500 transition-colors"
                            title="Delete Thread"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sidebar footer utility */}
              <div className="border-t border-slate-200 p-2.5 dark:border-slate-800 text-center shrink-0">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[9px] font-extrabold text-red-500/80 hover:text-red-500 uppercase tracking-widest flex items-center justify-center gap-1 w-full hover:bg-red-500/5 py-1 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear All Threads</span>
                </button>
              </div>
            </div>
          )}

          {/* Chat Pane */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-[#0c0e14]">
              {/* Message History list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs ${
                          isUser
                            ? 'bg-[#008C44] shadow-sm'
                            : 'bg-gradient-to-br from-[#003366] to-[#0a4d8c] shadow-sm'
                        }`}
                      >
                        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>

                      {/* Speech box */}
                      <div className="max-w-[78%] space-y-2.5">
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isUser
                              ? 'bg-[#003366] text-white shadow-sm rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none dark:bg-[#1a1d27] dark:border-slate-800 dark:text-slate-100'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          
                          <div className="mt-1.5 flex items-center justify-between text-[9px] opacity-65">
                            <span>{msg.timestamp}</span>
                            {!isUser && <span className="font-semibold text-[#E8A020]">Copilot AI</span>}
                          </div>

                          {/* Thumbs Feedback Rating */}
                          {!isUser && (
                            <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100/60 pt-1.5 dark:border-slate-700/60">
                              <span className="text-[9px] text-slate-400">Rate answer:</span>
                              <button
                                type="button"
                                onClick={() => toast.success('Feedback recorded: Helpful! Thank you.')}
                                className="text-[10px] opacity-70 hover:opacity-100 transition-opacity"
                                title="Helpful"
                              >
                                👍
                              </button>
                              <button
                                type="button"
                                onClick={() => toast.success('Feedback recorded: Unhelpful. We will optimize.')}
                                className="text-[10px] opacity-70 hover:opacity-100 transition-opacity"
                                title="Not helpful"
                              >
                                👎
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Render Visual Widgets if specified */}
                        {msg.widget === 'tracer' && (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-[#1a1d27] transition-all">
                            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                              <BarChart3 className="h-4 w-4 text-[#E8A020]" />
                              <span className="text-[11px] font-extrabold text-[#003366] dark:text-[#E8A020]">CSE 2025 Tracer Survey Visual</span>
                            </div>

                            <div className="space-y-2.5">
                              {[
                                { label: 'Computer Science (CSE)', pct: 87.2, color: 'bg-emerald-500' },
                                { label: 'Electrical Engineering (ECE)', pct: 79.5, color: 'bg-blue-500' },
                                { label: 'Mechanical Engineering (ME)', pct: 72.1, color: 'bg-amber-500' },
                                { label: 'Civil Engineering (CE)', pct: 64.8, color: 'bg-rose-500' },
                              ].map((item) => (
                                <div key={item.label} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                    <span className="text-slate-800 dark:text-slate-100">{item.pct}% Employed</span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 bg-amber-50/40 border border-amber-100/50 rounded-lg p-2 text-[10px] text-amber-800 dark:bg-amber-500/5 dark:border-amber-500/10 dark:text-amber-300 leading-normal">
                              <strong>Insight:</strong> CSE graduates show 87.2% employment within 6 months post-graduation. Major hiring clusters are located in Addis Ababa (Telecomm &amp; FinTech).
                            </div>
                          </div>
                        )}

                        {msg.widget === 'survey' && (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-[#1a1d27] transition-all">
                            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                              <ClipboardList className="h-4 w-4 text-[#008C44]" />
                              <span className="text-[11px] font-extrabold text-[#003366] dark:text-[#E8A020]">Survey Wave 3 Response Progress</span>
                            </div>

                            <div className="flex items-center gap-4 py-1.5">
                              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500 border-t-transparent shrink-0">
                                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">74.2%</span>
                              </div>

                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">520 / 704 Graduated Alumni</div>
                                <p className="text-[10px] text-slate-400">Response Rate target: 85% by end of week.</p>
                                <p className="text-[10px] text-slate-500 font-semibold dark:text-slate-300">Pending notifications: 184 users.</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={triggerSendReminders}
                              disabled={remindersSent}
                              className={`w-full mt-3 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white transition-all shadow-sm ${
                                remindersSent
                                  ? 'bg-emerald-600 cursor-default shadow-none'
                                  : 'bg-[#003366] hover:bg-[#002244] dark:bg-[#E8A020] dark:text-slate-900 dark:hover:bg-[#d08f1b]'
                              }`}
                            >
                              {remindersSent ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  <span>Reminders Sent Successfully</span>
                                </>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5 rotate-45 shrink-0" />
                                  <span>Send Auto-Reminders to 184 Alumni</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {msg.widget === 'custom-report' && (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-[#1a1d27] overflow-hidden transition-all">
                            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                              <FileText className="h-4 w-4 text-[#003366] dark:text-[#E8A020]" />
                              <span className="text-[11px] font-extrabold text-[#003366] dark:text-[#E8A020]">Salary &amp; Job Stats Report</span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-[10px]">
                                <thead>
                                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-bold">
                                    <th className="py-1 px-2">Dept</th>
                                    <th className="py-1 px-2">Median Salary</th>
                                    <th className="py-1 px-2">Top Job Field</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                  <tr>
                                    <td className="py-1 px-2 font-bold">CSE</td>
                                    <td className="py-1 px-2">19,500 ETB</td>
                                    <td className="py-1 px-2">Software Eng.</td>
                                  </tr>
                                  <tr>
                                    <td className="py-1 px-2 font-bold">ECE</td>
                                    <td className="py-1 px-2">16,200 ETB</td>
                                    <td className="py-1 px-2">Network Analyst</td>
                                  </tr>
                                  <tr>
                                    <td className="py-1 px-2 font-bold">ME</td>
                                    <td className="py-1 px-2">14,800 ETB</td>
                                    <td className="py-1 px-2">Plant Engineer</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
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

                      {/* Step-by-step reasoning logs */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-[9px] dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          <Sparkles className="h-3 w-3 animate-spin text-[#E8A020] shrink-0" />
                          <span>Copilot Execution Steps</span>
                        </div>
                        <div className="space-y-1 text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            <span>Connecting to ASTU Registrar DB...</span>
                          </div>
                          {typingStep >= 2 && (
                            <div className="flex items-center gap-1.5 animate-slide-up">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              <span>Retrieving placement indices...</span>
                            </div>
                          )}
                          {typingStep >= 3 && (
                            <div className="flex items-center gap-1.5 animate-slide-up">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              <span>Compiling analytical response...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="border-t border-slate-100 bg-white px-4 py-2.5 dark:bg-[#13161f] dark:border-slate-800 shrink-0">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Preset Queries</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    { text: '📊 Compare CSE employment stats', label: 'Tracer Stats' },
                    { text: '📋 Check response rate for Wave 3', label: 'Survey Tracking' },
                    { text: '💸 Salary report summary', label: 'Salaries' },
                    { text: '✉️ Send reminder notifications', label: 'Actions' },
                  ].map((chip) => (
                    <button
                      key={chip.text}
                      type="button"
                      onClick={() => handleQuickAction(chip.text)}
                      disabled={isTyping}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-[#003366] hover:bg-[#003366]/5 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-[#E8A020] dark:hover:bg-[#E8A020]/5 disabled:opacity-50"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated file upload preview */}
              {attachedFile && (
                <div className="border-t border-slate-100 bg-emerald-50/40 px-4 py-2 flex items-center justify-between dark:bg-[#0c0e14] dark:border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Check className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-bold truncate max-w-[280px]">
                      Attached: {attachedFile.name} ({attachedFile.size})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Simulated upload progression */}
              {isUploading && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 space-y-1 dark:bg-[#0c0e14] dark:border-slate-800">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Uploading file analysis...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Chat Input area */}
              <div className="border-t border-slate-100 bg-white p-3 dark:bg-[#13161f] dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                    title="Voice command dictation"
                  >
                    <Mic className="h-4.5 w-4.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700"
                    title="Upload dataset (CSV, XLSX, PDF)"
                  >
                    <Paperclip className="h-4.5 w-4.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls,.pdf"
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage(inputValue);
                      }
                    }}
                    disabled={isTyping}
                    placeholder="Ask about tracer stats or surveys..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#003366] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-[#1a1d27] dark:text-slate-100 dark:focus:border-[#E8A020]"
                  />

                  <button
                    type="button"
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003366] text-white transition-all hover:bg-[#002244] disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[#E8A020] dark:text-slate-900 dark:hover:bg-[#d08f1b]"
                  >
                    <Send className="h-4 w-4 rotate-45" />
                  </button>
                </div>

                {/* Utility shortcuts */}
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800/60">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExportTranscript}
                      className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Download className="h-3 w-3" />
                      <span>Export Transcript</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="flex items-center gap-1 hover:text-[#E31E24]"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Reset Copilot</span>
                    </button>
                  </div>
                  <span>ESC to close</span>
                </div>
              </div>
            </div>
          ) : (
            /* Settings Panel Content */
            <div className="flex-grow overflow-y-auto bg-slate-50/30 p-4 space-y-5 dark:bg-[#0c0e14]">
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-[#003366] dark:text-[#E8A020] uppercase tracking-wider">Copilot System Configuration</h3>
                <p className="text-[10px] text-slate-400">Configure parameters for Tracer AI agents and prompt context.</p>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#1a1d27]">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-600 dark:text-slate-300">Agent Creativity (Temperature)</span>
                    <span className="text-[#003366] dark:text-[#E8A020]">0.1 (Strict Metrics)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.1"
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                  />
                  <p className="text-[9px] text-slate-400 leading-normal">Lower values restrict replies strictly to confirmed database/tracer figures.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Default System Instruction</label>
                  <textarea
                    defaultValue="You are ASTU AI Copilot, a secure assistant tailored for Adama Science & Technology University. You help administrators query, analyze, and format post-graduation tracer studies, platform registration rates, and survey completions."
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px] leading-relaxed outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-800/40 focus:bg-white"
                  />
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    defaultChecked
                    id="scope-lock"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#003366] focus:ring-[#003366] dark:border-slate-700"
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="scope-lock" className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Enforce Scope Lock</label>
                    <p className="text-[9px] text-slate-400 leading-normal">Restrict model scope to ASTU academic records, surveys, and registrar metrics only.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('chat');
                    toast.success('Agent parameters saved.');
                  }}
                  className="flex-1 rounded-lg bg-[#003366] py-2 text-xs font-bold text-white hover:bg-[#002244] dark:bg-[#E8A020] dark:text-slate-900 dark:hover:bg-[#d08f1b] shadow-sm"
                >
                  Save parameters
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#1a1d27] dark:text-slate-300 dark:hover:bg-slate-800/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
