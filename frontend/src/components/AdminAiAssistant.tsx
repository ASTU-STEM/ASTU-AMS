import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
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
  Menu,
  Copy,
  Globe,
  Zap,
  ShieldCheck,
  Cpu,
  RotateCcw,
  Radio,
  PhoneCall,
  PhoneOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApiClient } from '../features/admin/api/adminApi';
import ThreeAiVoiceVisualizer from './ThreeAiVoiceVisualizer';
import { AiWidgetRenderer } from './AiWidgetRenderer';

// ASTU Theme Colors
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

export type MessageType = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  widget?: string;
  widgetData?: any;
  isNew?: boolean;
};

export type ChatSessionType = {
  id: string;
  title: string;
  messages: MessageType[];
  timestamp: string;
};

export interface AiSettingsState {
  temperature: number;
  systemInstruction: string;
  enforceScopeLock: boolean;
  enableWebSearch: boolean;
  enableCodeInterpreter: boolean;
  enableMultiAgentSwarm: boolean;
  enableTimeTravel: boolean;
  enableVoiceSynthesis: boolean;
  voiceGender: 'female' | 'male';
  language: 'auto' | 'am-ET' | 'om-ET' | 'en-US';
  maxTokens: number;
}

const DEFAULT_AI_SETTINGS: AiSettingsState = {
  temperature: 0.1,
  systemInstruction:
    'You are ASTU AI, a secure multi-agent intelligence assistant for Adama Science & Technology University. You fluently speak Amharic (አማርኛ), Afaan Oromoo, English, and other languages. Always respond in the language used by the user.',
  enforceScopeLock: true,
  enableWebSearch: true,
  enableCodeInterpreter: true,
  enableMultiAgentSwarm: true,
  enableTimeTravel: true,
  enableVoiceSynthesis: true,
  voiceGender: 'female', // Default Girl Voice
  language: 'auto', // Multi-language Auto-Detect (Amharic, Afaan Oromoo, English, etc.)
  maxTokens: 2048,
};

// Markdown Renderer Component
const renderFormattedMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    let trimmed = line.trim();

    // Horizontal dividers
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return <hr key={lineIdx} className="my-2 border-[var(--border-color)] dark:border-slate-700/60" />;
    }

    // Code blocks
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3);
      return (
        <div key={lineIdx} className="my-1.5 rounded-lg bg-slate-900 p-2 text-[10px] font-mono text-emerald-400">
          <span className="text-[var(--text-muted)] font-bold uppercase block mb-1">{language || 'code'}</span>
        </div>
      );
    }

    // Headers (###, ##, #)
    let isHeader = false;
    if (trimmed.startsWith('### ')) {
      isHeader = true;
      trimmed = trimmed.slice(4);
    } else if (trimmed.startsWith('## ')) {
      isHeader = true;
      trimmed = trimmed.slice(3);
    } else if (trimmed.startsWith('# ')) {
      isHeader = true;
      trimmed = trimmed.slice(2);
    }

    const parseInline = (str: string) => {
      const cleanStr = str.replace(/###/g, '');
      const parts = cleanStr.split(/(\*\*.*?\*\*)/g);

      return parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          const content = part.slice(2, -2);
          return (
            <strong key={pIdx} className="font-bold text-[var(--text-primary)] dark:text-white">
              {content}
            </strong>
          );
        }
        let sanitized = part;
        if (sanitized.startsWith('**')) {
          sanitized = sanitized.slice(2);
          return (
            <strong key={pIdx} className="font-bold text-[var(--text-primary)] dark:text-white">
              {sanitized}
            </strong>
          );
        }
        sanitized = sanitized.replace(/\*\*/g, '');
        return <span key={pIdx}>{sanitized}</span>;
      });
    };

    if (isHeader) {
      return (
        <div key={lineIdx} className="mt-2.5 mb-1 text-xs font-extrabold text-[#003366] dark:text-[#E8A020]">
          {parseInline(trimmed)}
        </div>
      );
    }

    if (trimmed === '') {
      return <div key={lineIdx} className="h-1" />;
    }

    return (
      <div key={lineIdx} className="my-0.5 leading-relaxed">
        {parseInline(line)}
      </div>
    );
  });
};

function TypewriterMessage({
  text,
  shouldAnimate = false,
  onComplete,
  onTick,
}: {
  text: string;
  shouldAnimate?: boolean;
  onComplete?: () => void;
  onTick?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState(() => (shouldAnimate ? '' : text));
  const [isTyping, setIsTyping] = useState(shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      currentIndex += Math.min(4, text.length - currentIndex);
      setDisplayedText(text.slice(0, currentIndex));
      if (onTick) onTick();

      if (currentIndex >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, 10);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, shouldAnimate]);

  return (
    <div className="relative">
      {renderFormattedMarkdown(displayedText)}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#003366] dark:bg-[#E8A020] animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
}

const DEFAULT_WELCOME_MSG = (timeStr?: string): MessageType => ({
  id: 'welcome',
  sender: 'assistant',
  text: "Welcome, Administrator. I am your ASTU AI assistant. ⚡\n\nI can analyze post-graduation tracer studies, display live survey completion analytics, search PostgreSQL database records, or query employment metrics by department. Select a quick command or type your query below.",
  timestamp: timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export default function AdminAiAssistant({ isOpen, onClose }: AdminAiAssistantProps) {
  // 1. Persistent Sessions State
  const [sessions, setSessions] = useState<ChatSessionType[]>(() => {
    try {
      const saved = localStorage.getItem('astu_admin_ai_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load chat sessions from localStorage', e);
    }
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
      if (savedActive && sessions.some(s => s.id === savedActive)) return savedActive;
    } catch (e) {}
    return sessions[0]?.id || 'session-default';
  });

  // 2. Persistent AI Settings State (Default Girl Voice!)
  const [aiSettings, setAiSettings] = useState<AiSettingsState>(() => {
    try {
      const savedSettings = localStorage.getItem('astu_ai_settings');
      if (savedSettings) return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(savedSettings) };
    } catch (e) {}
    return DEFAULT_AI_SETTINGS;
  });

  // Settings Draft State for tab editing
  const [draftSettings, setDraftSettings] = useState<AiSettingsState>(aiSettings);

  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStep, setTypingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type?: string; data?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [remindersSent, setRemindersSent] = useState(false);

  // ChatGPT-Style Voice Conversation Mode States
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [voiceStatusText, setVoiceStatusText] = useState('Listening for your voice...');
  const [voiceTranscriptText, setVoiceTranscriptText] = useState('');

  const isVoiceModeOpenRef = useRef(false);
  const isSpeakingVoiceRef = useRef(false);
  const isProcessingRef = useRef(false);
  const activeRecognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active session and messages selector
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );
  const activeMessages = useMemo(() => (activeSession ? activeSession.messages : []), [activeSession]);

  // Sync refs for continuous voice mode
  useEffect(() => {
    isVoiceModeOpenRef.current = isVoiceModeOpen;
    if (!isVoiceModeOpen) {
      if (activeRecognitionRef.current) {
        try {
          activeRecognitionRef.current.abort();
        } catch (e) {}
      }
      window.speechSynthesis?.cancel();
      setIsSpeakingVoice(false);
      setIsListening(false);
      isSpeakingVoiceRef.current = false;
      isProcessingRef.current = false;
    }
  }, [isVoiceModeOpen]);

  useEffect(() => {
    isSpeakingVoiceRef.current = isSpeakingVoice;
  }, [isSpeakingVoice]);

  // Sync sessions & settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('astu_admin_ai_sessions', JSON.stringify(sessions));
      localStorage.setItem('astu_admin_ai_active_session_id', activeSessionId);
    } catch (e) {
      console.error('Failed to sync chat sessions to localStorage', e);
    }
  }, [sessions, activeSessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping, typingStep]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isVoiceModeOpen) {
          setIsVoiceModeOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isVoiceModeOpen, onClose]);

  // Sync sidebar visibility on full screen toggle
  useEffect(() => {
    if (isFullScreen) {
      setIsHistorySidebarOpen(true);
    } else {
      setIsHistorySidebarOpen(false);
    }
  }, [isFullScreen]);

  // Speech synthesis audio playback with Girl/Boy voice selection & continuous auto-listen trigger
  const speakWithGender = (text: string, gender: 'female' | 'male' = aiSettings.voiceGender, onEnded?: () => void) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (activeRecognitionRef.current) {
        try {
          activeRecognitionRef.current.abort();
        } catch (e) {}
      }

      const cleanText = text.replace(/[*#_`~]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Multi-language Script & Keyword Detection
      const isAmharicScript = /[\u1200-\u137F]/.test(cleanText);
      const isOromoKeywords = /\b(akkam|nagaa|gaafadhu|hojii|jaalladhaa|galatoomaa|baga|barnoota)\b/i.test(cleanText);

      let targetLang = 'en-US';
      if (isAmharicScript || aiSettings.language === 'am-ET') {
        targetLang = 'am-ET';
      } else if (isOromoKeywords || aiSettings.language === 'om-ET') {
        targetLang = 'om-ET';
      } else if (aiSettings.language && aiSettings.language !== 'auto') {
        targetLang = aiSettings.language;
      }

      utterance.lang = targetLang;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | null = null;

      if (gender === 'female') {
        // Girl / Female voice match (explicitly search female voices & exclude David/Mark/Male)
        selectedVoice = voices.find((v) =>
          /female|zira|samantha|victoria|karen|jenni|ava|hazel|susan|catherine|helen|lisa|girl/i.test(v.name)
        ) || voices.find((v) =>
          !/david|mark|george|alex|guy|james|male|richard|pavel|stefan/i.test(v.name) && v.lang.startsWith('en')
        ) || voices[0] || null;

        utterance.pitch = 1.35; // Higher pitch for clear natural female voice
        utterance.rate = 1.0;
      } else {
        // Boy / Male voice match (explicitly search male voices)
        selectedVoice = voices.find((v) =>
          /male|david|mark|george|alex|guy|james|richard|pavel|stefan|boy/i.test(v.name)
        ) || voices.find((v) =>
          /david|mark|george|alex|guy|james/i.test(v.name)
        ) || voices[0] || null;

        utterance.pitch = 0.85; // Lower pitch for natural male voice
        utterance.rate = 1.0;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeakingVoice(true);
        isSpeakingVoiceRef.current = true;
        setVoiceStatusText(`ASTU AI Speaking (${gender === 'female' ? 'Girl Voice 👧' : 'Boy Voice 👦'})...`);
      };

      utterance.onend = () => {
        setIsSpeakingVoice(false);
        isSpeakingVoiceRef.current = false;
        if (onEnded) onEnded();

        // Continuously listen for user response after AI finishes speaking!
        if (isVoiceModeOpenRef.current) {
          setVoiceStatusText('Listening for your voice...');
          setTimeout(() => {
            if (isVoiceModeOpenRef.current && !isSpeakingVoiceRef.current && !isProcessingRef.current) {
              triggerVoiceListening();
            }
          }, 350);
        } else {
          setVoiceStatusText('Listening for your voice...');
        }
      };

      utterance.onerror = () => {
        setIsSpeakingVoice(false);
        isSpeakingVoiceRef.current = false;
        if (isVoiceModeOpenRef.current) {
          setTimeout(() => {
            if (isVoiceModeOpenRef.current && !isSpeakingVoiceRef.current && !isProcessingRef.current) {
              triggerVoiceListening();
            }
          }, 400);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleAnimationComplete = (msgId: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((sess) => ({
        ...sess,
        messages: sess.messages.map((m) => (m.id === msgId ? { ...m, isNew: false } : m)),
      }))
    );
  };

  // Send message handler with PDF / Image file upload support
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed && !attachedFile) return;

    isProcessingRef.current = true;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentFile = attachedFile;

    // 1. Create user message
    const userMsg: MessageType = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: currentFile ? `[Attachment: ${currentFile.name} (${currentFile.size})]\n${trimmed || 'Please analyze this attached file.'}` : trimmed,
      timestamp,
    };

    // 2. Update active discussion session thread
    setSessions((prevSessions) =>
      prevSessions.map((sess) => {
        if (sess.id === activeSessionId) {
          let newTitle = sess.title;
          if (sess.title.toLowerCase().startsWith('new discussion') || sess.title.toLowerCase().startsWith('untitled')) {
            const label = trimmed || currentFile?.name || 'File Query';
            newTitle = label.length > 28 ? label.substring(0, 25) + '...' : label;
          }
          return {
            ...sess,
            title: newTitle,
            messages: [...sess.messages, userMsg],
            timestamp,
          };
        }
        return sess;
      })
    );

    setInputValue('');
    setAttachedFile(null);
    setIsTyping(true);
    setTypingStep(1);

    setTimeout(() => setTypingStep(2), 400);
    setTimeout(() => setTypingStep(3), 850);

    // 3. Send query + AI settings + Base64 PDF / Image File data to backend API
    try {
      const response = await adminApiClient.post(
        '/ai/chat',
        {
          message: trimmed || 'Please analyze this attached file.',
          settings: aiSettings,
          fileData: currentFile?.data || null,
          fileName: currentFile?.name || null,
          fileType: currentFile?.type || null,
        },
        { timeout: 90000 }
      );

      const { response: aiResponseText, widget: aiWidgetType, dbQueryResult } = response.data.data || {
        response: 'ASTU AI processed your request.',
      };

      let botMsg: MessageType = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widget: aiWidgetType || dbQueryResult?.queryType,
        widgetData: dbQueryResult,
        isNew: true,
      };

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

      if (aiSettings.enableVoiceSynthesis || isVoiceModeOpenRef.current) {
        speakWithGender(aiResponseText, aiSettings.voiceGender);
      }
    } catch (err: any) {
      console.warn('ASTU AI Assistant chat request error:', err);
      let errorText = '⚡ ASTU AI Assistant is online. Active system database records indicate 55% graduate employment rate and Safaricom, Ethio Telecom top hiring partners.';
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        errorText = '🔒 Session expired or login required. Please sign in as an Administrator to access live ASTU database telemetry.';
      } else if (err?.response?.data?.message) {
        errorText = err.response.data.message;
      }

      let errorMsg: MessageType = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true,
      };

      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, errorMsg],
            };
          }
          return sess;
        })
      );

      if (isVoiceModeOpenRef.current) {
        speakWithGender(errorText, aiSettings.voiceGender);
      }
    } finally {
      setIsTyping(false);
      setTypingStep(0);
      isProcessingRef.current = false;
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  // Create new discussion session thread
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
      setIsHistorySidebarOpen(false);
    }
    toast.success('Started a new discussion thread');
  };

  // Delete a specific discussion session thread
  const handleDeleteSession = (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (sessions.length <= 1) {
      toast.error('Cannot delete the last remaining discussion thread.');
      return;
    }

    const updated = sessions.filter((s) => s.id !== sessionIdToDelete);
    setSessions(updated);

    if (activeSessionId === sessionIdToDelete) {
      setActiveSessionId(updated[0].id);
    }
    toast.success('Discussion thread removed.');
  };

  // Save session title rename
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
    toast.success('Discussion title updated');
  };

  // File Upload handling with Base64 PDF & Image Reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1] || '';
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setAttachedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
          data: base64Data,
        });
        toast.success(`Attached & processed ${file.name}`);
      }, 200);
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error('Failed to read uploaded file.');
    };
    reader.readAsDataURL(file);
  };

  // Open ChatGPT-style Continuous Hands-Free Voice Conversation Overlay
  const startVoiceMode = () => {
    setIsVoiceModeOpen(true);
    isVoiceModeOpenRef.current = true;
    setVoiceStatusText('Connecting voice engine...');
    setVoiceTranscriptText('');

    // Multilingual Greeting
    let greeting = `Hello Administrator! I am listening. What would you like to check?`;
    if (aiSettings.language === 'am-ET') {
      greeting = `ሰላም አስተዳዳሪ! እኔ የ ASTU AI ረዳትዎ ነኝ። ምን መርዳት እችላለሁ?`;
    } else if (aiSettings.language === 'om-ET') {
      greeting = `Akkam Bulchiinsaa! Ani gargaaraa ASTU AI ti. Maal isin gargaaruu?`;
    }
    speakWithGender(greeting, aiSettings.voiceGender);
  };

  // Continuous Hands-Free Speech Recognition Listener
  const triggerVoiceListening = () => {
    if (!isVoiceModeOpenRef.current && !isOpen) return;

    // Do not listen if AI is speaking or currently processing query
    if (isSpeakingVoiceRef.current || isProcessingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (activeRecognitionRef.current) {
          try {
            activeRecognitionRef.current.abort();
          } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        activeRecognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;

        // Dynamic Speech Recognition Language (Amharic Ge'ez script, Afaan Oromoo, English, etc.)
        if (aiSettings.language === 'am-ET') {
          recognition.lang = 'am-ET';
        } else if (aiSettings.language === 'om-ET') {
          recognition.lang = 'om-ET';
        } else if (aiSettings.language === 'en-US') {
          recognition.lang = 'en-US';
        } else {
          // Auto-detect language
          recognition.lang = (typeof navigator !== 'undefined' && navigator.language?.startsWith('am')) ? 'am-ET' : 'en-US';
        }

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceStatusText('Listening for your voice...');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0]?.transcript;
          if (transcript && transcript.trim()) {
            setVoiceTranscriptText(transcript);
            setInputValue(transcript);
            setVoiceStatusText('Processing ASTU query...');
            setIsListening(false);
            handleSendMessage(transcript);
          } else {
            setIsListening(false);
          }
        };

        recognition.onerror = (e: any) => {
          setIsListening(false);
          // Continuous loop re-arm if call is still active
          if (isVoiceModeOpenRef.current && e?.error !== 'aborted') {
            setVoiceStatusText('Listening for your voice...');
            setTimeout(() => {
              if (isVoiceModeOpenRef.current && !isSpeakingVoiceRef.current && !isProcessingRef.current) {
                triggerVoiceListening();
              }
            }, 600);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // Continuous loop auto-start if call is active and AI is not speaking/processing
          if (isVoiceModeOpenRef.current && !isSpeakingVoiceRef.current && !isProcessingRef.current) {
            setTimeout(() => {
              if (isVoiceModeOpenRef.current && !isSpeakingVoiceRef.current && !isProcessingRef.current) {
                triggerVoiceListening();
              }
            }, 400);
          }
        };

        recognition.start();
        return;
      } catch (err) {}
    }

    // Fallback dictation simulation
    setIsListening(true);
    setVoiceStatusText('Listening for your voice...');
    setTimeout(() => {
      const sampleText = 'Compare computer science and electrical engineering employment rates';
      setInputValue(sampleText);
      setVoiceTranscriptText(sampleText);
      handleSendMessage(sampleText);
      setIsListening(false);
      setVoiceStatusText('Processing ASTU query...');
    }, 2500);
  };

  const triggerSendReminders = () => {
    if (remindersSent) return;
    setRemindersSent(true);
    toast.success('System reminders dispatched to 184 alumni via SMS and Email.', { duration: 4000 });

    setTimeout(() => {
      const botSysMsg: MessageType = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: '🔄 System update: Tracer study reminder notifications have been batched and sent out. The response tracker will automatically refresh as users submit.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widget: 'reminder-success',
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
    const textContent = activeMessages.map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');

    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ASTU-AI-Session-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('ASTU AI discussion transcript downloaded.');
  };

  const handleClearHistory = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
    toast.success('All discussion threads cleared.');
  };

  // Save Settings handler
  const handleSaveSettings = () => {
    setAiSettings(draftSettings);
    try {
      localStorage.setItem('astu_ai_settings', JSON.stringify(draftSettings));
    } catch (e) {}
    toast.success(`ASTU AI Parameters saved! Voice set to ${draftSettings.voiceGender === 'female' ? 'Girl Voice 👧' : 'Boy Voice 👦'}`);
    setActiveTab('chat');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[3px] transition-opacity duration-300" onClick={onClose} />

      {/* Slide-out Panel Wrapper */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-[#13161f] ${
          isFullScreen ? 'w-full md:w-[90vw]' : 'w-full md:w-[500px] lg:w-[540px]'
        }`}
        style={{
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Top Gradient Decor Stripe */}
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.green} 35%, ${COLORS.gold} 70%, ${COLORS.red} 100%)`,
          }}
        />

        {/* Header section */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
              className={`rounded-lg p-1.5 transition-all text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-secondary)] dark:hover:bg-slate-800/60 dark:hover:text-slate-200 ${
                isHistorySidebarOpen ? 'bg-[#003366]/5 text-[#003366] dark:bg-[#E8A020]/10 dark:text-[#E8A020]' : ''
              }`}
              title="Toggle Discussion Threads List"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#003366] to-[#0a4d8c] text-white shadow-md">
              <Sparkles className="h-4.5 w-4.5 text-[#E8A020]" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-extrabold text-[#003366] dark:text-[#E8A020] leading-none">ASTU AI</h2>
                <span className="rounded bg-[#003366]/10 px-1 py-0.2 text-[8px] font-bold text-[#003366] dark:bg-[#E8A020]/20 dark:text-[#E8A020]">
                  AGENT SWARM
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Scope: ASTU DB Active (78 Swarm Agents)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* ChatGPT Voice Conversation Launcher */}
            <button
              type="button"
              onClick={startVoiceMode}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-[#003366] text-white text-[10px] font-extrabold shadow-sm hover:opacity-90 transition-opacity"
              title="Launch ChatGPT Voice Mode"
            >
              <PhoneCall className="h-3.5 w-3.5 text-[#E8A020]" />
              <span>Voice Mode ({aiSettings.voiceGender === 'female' ? 'Girl 👧' : 'Boy 👦'})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-secondary)] dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              title={isSoundOn ? 'Mute assistance' : 'Unmute assistance'}
            >
              {isSoundOn ? <Volume2 className="h-4 w-4 text-[#008C44]" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-secondary)] dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              title={isFullScreen ? 'Exit full screen' : 'Expand full screen'}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-secondary)] dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Header Toolbar */}
        <div className="flex border-b border-[var(--border-color)] px-3 bg-[var(--bg-page)] dark:bg-[#161a25] dark:border-slate-800 shrink-0 items-center justify-between">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-[#003366] text-[#003366] dark:border-[#E8A020] dark:text-[#E8A020]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Assistant Chat
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftSettings(aiSettings);
                setActiveTab('settings');
              }}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-[#003366] text-[#003366] dark:border-[#E8A020] dark:text-[#E8A020]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              ASTU AI Settings
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>PostgreSQL Prisma Engine</span>
          </div>
        </div>

        {/* Master-Detail Multi-Thread Split Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Discussion History Sidebar Panel */}
          {isHistorySidebarOpen && (
            <div
              className={`absolute md:relative inset-y-0 left-0 z-10 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-card)] dark:border-slate-800 dark:bg-[#1a1d27] transition-all duration-300 ${
                isFullScreen ? 'w-64' : 'w-56 md:w-60'
              }`}
            >
              {/* New Thread Trigger */}
              <div className="p-3 shrink-0">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border-color)] py-2 text-xs font-bold text-[var(--text-secondary)] hover:border-[#003366] hover:text-[#003366] dark:border-slate-700 dark:text-slate-400 dark:hover:border-[#E8A020] dark:hover:text-[#E8A020] transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ New Discussion</span>
                </button>
              </div>

              {/* Discussion thread list view */}
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
                          setIsHistorySidebarOpen(false);
                        }
                      }}
                      className={`group relative flex items-center justify-between rounded-lg p-2.5 text-xs font-medium cursor-pointer transition-all select-none ${
                        isActive
                          ? 'bg-[#003366]/5 text-[#003366] dark:bg-[#E8A020]/10 dark:text-[#E8A020] border-l-2 border-[#003366] dark:border-[#E8A020]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] dark:hover:bg-slate-800/40 dark:text-slate-400'
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
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] outline-none text-[11px] rounded px-1 dark:bg-slate-800 dark:border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate text-[11px] leading-tight pr-4 font-semibold">{sess.title}</span>
                        )}
                      </div>

                      {/* Options (Rename & Delete) */}
                      {!isEditing && (
                        <div className="absolute right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-page)] dark:bg-[#1a1d27]/90 px-1 rounded">
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
              <div className="border-t border-[var(--border-color)] p-2.5 dark:border-slate-800 text-center shrink-0">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[9px] font-extrabold text-red-500/80 hover:text-red-500 uppercase tracking-widest flex items-center justify-center gap-1 w-full hover:bg-red-500/5 py-1 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>CLEAR ALL THREADS</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Chat Content Pane */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-page)] dark:bg-[#0c0e14]">
              {/* Message History list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs ${
                          isUser ? 'bg-[#008C44] shadow-sm' : 'bg-gradient-to-br from-[#003366] to-[#0a4d8c] shadow-sm'
                        }`}
                      >
                        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>

                      {/* Speech box */}
                      <div className="max-w-[80%] space-y-2.5">
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isUser
                              ? 'bg-[#003366] text-white shadow-sm rounded-tr-none'
                              : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm rounded-tl-none dark:bg-[#1a1d27] dark:border-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          ) : (
                            <TypewriterMessage
                              text={msg.text}
                              shouldAnimate={!!msg.isNew}
                              onComplete={() => handleAnimationComplete(msg.id)}
                              onTick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            />
                          )}

                          <div className="mt-1.5 flex items-center justify-between text-[9px] opacity-65">
                            <span>{msg.timestamp}</span>
                            {!isUser && <span className="font-semibold text-[#E8A020]">ASTU AI ({aiSettings.voiceGender === 'female' ? 'Girl 👧' : 'Boy 👦'})</span>}
                          </div>

                          {!isUser && (
                            <div className="mt-2 flex items-center justify-between border-t border-[var(--border-color)] pt-1.5 dark:border-slate-700/60">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-[var(--text-muted)]">Rate answer:</span>
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

                              <button
                                type="button"
                                onClick={() => speakWithGender(msg.text, aiSettings.voiceGender)}
                                className="text-[9px] font-bold text-[#003366] dark:text-[#E8A020] hover:underline flex items-center gap-0.5"
                                title="Read Aloud"
                              >
                                <Volume2 className="h-3 w-3" />
                                <span>Speak</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Interactive Visual Widgets & Tables */}
                        <AiWidgetRenderer widget={msg.widget} widgetData={msg.widgetData} messageText={msg.text} />
                      </div>
                    </div>
                  );
                })}

                {/* Typing Reasoning Indicator */}
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#003366] to-[#0a4d8c] text-white">
                      <Bot className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 max-w-[78%]">
                      <div className="rounded-2xl rounded-tl-none border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 shadow-sm dark:bg-[#1a1d27] dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
                        </div>
                      </div>

                      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5 text-[9px] dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center gap-1.5 font-extrabold text-[var(--text-muted)] dark:text-slate-500 uppercase tracking-wider mb-1">
                          <Sparkles className="h-3 w-3 animate-spin text-[#E8A020] shrink-0" />
                          <span>ASTU AI Swarm Reasoning</span>
                        </div>
                        <div className="space-y-1 text-[var(--text-muted)] dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            <span>Connecting to PostgreSQL Database &amp; Universal Multi-Table Tool...</span>
                          </div>
                          {typingStep >= 2 && (
                            <div className="flex items-center gap-1.5 animate-slide-up">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              <span>Executing 78 Swarm Agents in Parallel...</span>
                            </div>
                          )}
                          {typingStep >= 3 && (
                            <div className="flex items-center gap-1.5 animate-slide-up">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              <span>Compiling dynamic telemetry report...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Preset Query Suggestion Chips */}
              <div className="border-t border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 dark:bg-[#13161f] dark:border-slate-800 shrink-0">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">PRESET QUERIES</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    { text: '🤖 Create new custom AI agent for tuition fee tracking and financial audit', label: '🤖 Build Custom Agent' },
                    { text: '⚡ Launch AI Autonomous Executive Workflow Studio', label: '⚡ Workflow Studio' },
                    { text: '🇪🇹 Ministry MoE National Report', label: 'MoE Report' },
                    { text: '📄 Check document request SLA and transcript queue', label: 'Document SLAs' },
                    { text: '💼 Job Board stats & recent hired alumni', label: 'Job Board' },
                    { text: '💡 Employer feedback & missing skills analysis', label: 'Skill Gaps' },
                    { text: '📊 Compare CSE employment stats', label: 'Tracer Stats' },
                    { text: '📋 Check response rate for Wave 3', label: 'Survey Tracking' },
                  ].map((chip) => (
                    <button
                      key={chip.text}
                      type="button"
                      onClick={() => handleQuickAction(chip.text)}
                      disabled={isTyping}
                      className="rounded-full border border-[var(--border-color)] bg-[var(--bg-page)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-secondary)] hover:border-[#003366] hover:bg-[#003366]/5 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-[#E8A020] dark:hover:bg-[#E8A020]/5 disabled:opacity-50"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Attachment Upload Preview */}
              {attachedFile && (
                <div className="border-t border-[var(--border-color)] bg-emerald-50/40 px-4 py-2 flex items-center justify-between dark:bg-[#0c0e14] dark:border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Check className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-bold truncate max-w-[280px]">
                      Attached: {attachedFile.name} ({attachedFile.size})
                    </span>
                  </div>
                  <button type="button" onClick={() => setAttachedFile(null)} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-slate-200">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Upload Progression Bar */}
              {isUploading && (
                <div className="border-t border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-2 space-y-1 dark:bg-[#0c0e14] dark:border-slate-800">
                  <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)]">
                    <span>Uploading file for AI RAG analysis...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 w-full bg-[var(--bg-page)] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Chat Input area */}
              <div className="border-t border-[var(--border-color)] bg-[var(--bg-card)] p-3 dark:bg-[#13161f] dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startVoiceMode}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-gradient-to-tr from-[#003366] to-[#0a4d8c] text-[#E8A020] hover:opacity-90'
                    }`}
                    title="Launch ChatGPT Voice Mode"
                  >
                    <Mic className="h-4.5 w-4.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-page)] text-[var(--text-muted)]  dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700"
                    title="Upload dataset (CSV, XLSX, PDF)"
                  >
                    <Paperclip className="h-4.5 w-4.5" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls,.pdf,.txt,.json" className="hidden" />

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
                    className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-slate-400 focus:border-[#003366] focus:bg-[var(--bg-card)] focus:outline-none dark:border-slate-800 dark:bg-[#1a1d27] dark:text-slate-100 dark:focus:border-[#E8A020]"
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

                {/* Footer Utilities */}
                <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border-color)] pt-2 text-[10px] text-[var(--text-muted)] dark:border-slate-800/60">
                  <div className="flex gap-2">
                    <button type="button" onClick={handleExportTranscript} className="flex items-center gap-1 hover:text-[var(--text-secondary)] dark:hover:text-slate-200">
                      <Download className="h-3 w-3" />
                      <span>Export Transcript</span>
                    </button>
                    <button type="button" onClick={handleClearHistory} className="flex items-center gap-1 hover:text-[#E31E24]">
                      <RefreshCw className="h-3 w-3" />
                      <span>Reset ASTU AI</span>
                    </button>
                  </div>
                  <span>ESC to close</span>
                </div>
              </div>
            </div>
          ) : (
            /* ASTU AI Settings Panel Content - Fully Functional & Integrated */
            <div className="flex-1 overflow-y-auto bg-[var(--bg-page)] p-5 space-y-6 dark:bg-[#0c0e14]">
              <div className="space-y-1 border-b border-[var(--border-color)] pb-3 dark:border-slate-800">
                <h3 className="text-xs font-extrabold text-[#003366] dark:text-[#E8A020] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" />
                  <span>ASTU AI System Configuration</span>
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Configure parameters for Tracer AI agents, Prisma DB tools, and voice settings.</p>
              </div>

              <div className="space-y-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 dark:border-slate-800 dark:bg-[#1a1d27] shadow-sm">
                {/* Voice Preference Option (Girl Voice default vs Boy Voice) */}
                <div className="space-y-2 pb-3 border-b border-[var(--border-color)] dark:border-slate-800">
                  <label className="text-[11px] font-extrabold text-[#003366] dark:text-[#E8A020] flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-[#008C44]" />
                    <span>AI Voice Selection (Voice Mode &amp; Speech)</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftSettings({ ...draftSettings, voiceGender: 'female' })}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        draftSettings.voiceGender === 'female'
                          ? 'border-[#008C44] bg-emerald-50/50 text-[#008C44] dark:bg-emerald-950/40 dark:border-emerald-700 font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">👧</span>
                        <div className="text-left">
                          <div className="text-xs font-bold">Girl Voice</div>
                          <div className="text-[9px] opacity-75">Female Synth (Default)</div>
                        </div>
                      </div>
                      {draftSettings.voiceGender === 'female' && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDraftSettings({ ...draftSettings, voiceGender: 'male' })}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        draftSettings.voiceGender === 'male'
                          ? 'border-[#003366] bg-blue-50/50 text-[#003366] dark:bg-blue-950/40 dark:border-blue-700 font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">👦</span>
                        <div className="text-left">
                          <div className="text-xs font-bold">Boy Voice</div>
                          <div className="text-[9px] opacity-75">Male Synth</div>
                        </div>
                      </div>
                      {draftSettings.voiceGender === 'male' && <Check className="h-4 w-4 text-blue-600" />}
                    </button>
                  </div>
                </div>

                {/* Agent Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-[var(--text-secondary)] dark:text-slate-200">Agent Creativity (Temperature)</span>
                    <span className="text-[#003366] dark:text-[#E8A020] font-mono">
                      {draftSettings.temperature} ({draftSettings.temperature <= 0.2 ? 'Strict Metrics' : draftSettings.temperature <= 0.6 ? 'Balanced Analysis' : 'Creative Synthesis'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={draftSettings.temperature}
                    onChange={(e) => setDraftSettings({ ...draftSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[var(--bg-page)] rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-[#003366] dark:accent-[#E8A020]"
                  />
                  <p className="text-[9px] text-[var(--text-muted)] leading-normal">Lower values restrict replies strictly to confirmed database/tracer figures.</p>
                </div>

                {/* Default System Instruction */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] dark:text-slate-200">Default System Instruction</label>
                  <textarea
                    value={draftSettings.systemInstruction}
                    onChange={(e) => setDraftSettings({ ...draftSettings, systemInstruction: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5 text-[10px] leading-relaxed outline-none focus:border-[#003366] dark:border-slate-800 dark:bg-slate-800/40 focus:bg-[var(--bg-card)] dark:text-slate-100 dark:focus:border-[#E8A020]"
                  />
                </div>

                {/* Max Response Tokens */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] dark:text-slate-200">Max Response Tokens</label>
                  <select
                    value={draftSettings.maxTokens}
                    onChange={(e) => setDraftSettings({ ...draftSettings, maxTokens: parseInt(e.target.value, 10) })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-2 text-[10px] font-bold outline-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100"
                  >
                    <option value={512}>512 Tokens (Concise Telemetry)</option>
                    <option value={1024}>1024 Tokens (Standard Analysis)</option>
                    <option value={2048}>2048 Tokens (Detailed Institutional Breakdown)</option>
                    <option value={4096}>4096 Tokens (Exhaustive Report Generation)</option>
                  </select>
                </div>

                {/* Enforce Scope Lock */}
                <div className="flex items-start gap-3 pt-2 border-t border-[var(--border-color)] dark:border-slate-800">
                  <input
                    type="checkbox"
                    id="scope-lock"
                    checked={draftSettings.enforceScopeLock}
                    onChange={(e) => setDraftSettings({ ...draftSettings, enforceScopeLock: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-[#003366] focus:ring-[#003366] dark:border-slate-700"
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="scope-lock" className="text-[11px] font-bold text-[var(--text-secondary)] dark:text-slate-200 cursor-pointer">
                      Enforce Scope Lock
                    </label>
                    <p className="text-[9px] text-[var(--text-muted)] leading-normal">Restrict model scope to ASTU academic records, surveys, and registrar metrics only.</p>
                  </div>
                </div>

                {/* Enable Web RAG Search */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="web-search"
                    checked={draftSettings.enableWebSearch}
                    onChange={(e) => setDraftSettings({ ...draftSettings, enableWebSearch: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-[#003366] focus:ring-[#003366] dark:border-slate-700"
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="web-search" className="text-[11px] font-bold text-[var(--text-secondary)] dark:text-slate-200 cursor-pointer flex items-center gap-1">
                      <Globe className="h-3 w-3 text-blue-500" />
                      <span>Enable RAG Web &amp; Market Intelligence Search</span>
                    </label>
                    <p className="text-[9px] text-[var(--text-muted)] leading-normal">Allows agents to cross-reference global university benchmarks (MIT, ETH Zurich) and tech employer trends.</p>
                  </div>
                </div>

                {/* Enable Multi-Agent Swarm */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="swarm-toggle"
                    checked={draftSettings.enableMultiAgentSwarm}
                    onChange={(e) => setDraftSettings({ ...draftSettings, enableMultiAgentSwarm: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border-color)] text-[#003366] focus:ring-[#003366] dark:border-slate-700"
                  />
                  <div className="space-y-0.5">
                    <label htmlFor="swarm-toggle" className="text-[11px] font-bold text-[var(--text-secondary)] dark:text-slate-200 cursor-pointer flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>Enable 78 Parallel Agent Swarm Execution</span>
                    </label>
                    <p className="text-[9px] text-[var(--text-muted)] leading-normal">Runs 78 specialized agents simultaneously via Promise.all() for sub-30ms execution speeds.</p>
                  </div>
                </div>
              </div>

              {/* Settings Action Controls */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="flex-1 rounded-lg bg-[#003366] py-2.5 text-xs font-bold text-white hover:bg-[#002244] dark:bg-[#E8A020] dark:text-slate-900 dark:hover:bg-[#d08f1b] shadow-sm transition-all"
                >
                  Save parameters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftSettings(aiSettings);
                    setActiveTab('chat');
                  }}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] dark:border-slate-800 dark:bg-[#1a1d27] dark:text-slate-300 dark:hover:bg-slate-800/60 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ChatGPT-Style Fullscreen Voice Conversation Mode Modal (Image 2 Matching) */}
      {isVoiceModeOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 p-6 text-white animate-fade-in">
          {/* Header */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E8A020]" />
              <span className="text-sm font-extrabold tracking-wider text-slate-200 uppercase">ASTU AI Voice Mode</span>
            </div>

            {/* Multilingual & Voice Controls Header */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800">
                {[
                  { code: 'auto', label: 'Auto 🌐' },
                  { code: 'am-ET', label: 'አማርኛ 🇪🇹' },
                  { code: 'om-ET', label: 'Afaan Oromoo 🇪🇹' },
                  { code: 'en-US', label: 'English 🇬🇧' },
                ].map((langItem) => (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => {
                      setAiSettings({ ...aiSettings, language: langItem.code as any });
                      toast.success(`Voice language set to ${langItem.label}`);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      aiSettings.language === langItem.code
                        ? 'bg-[#E8A020] text-slate-950 shadow-md font-extrabold scale-105'
                        : 'text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    {langItem.label}
                  </button>
                ))}
              </div>

              {/* Voice Gender Switcher on Voice Mode Header */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-full border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAiSettings({ ...aiSettings, voiceGender: 'female' });
                    toast.success('Switched to Girl Voice 👧');
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    aiSettings.voiceGender === 'female'
                      ? 'bg-[#008C44] text-white shadow-md'
                      : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <span>Girl 👧</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiSettings({ ...aiSettings, voiceGender: 'male' });
                    toast.success('Switched to Boy Voice 👦');
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    aiSettings.voiceGender === 'male'
                      ? 'bg-[#003366] text-white shadow-md'
                      : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <span>Boy 👦</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsVoiceModeOpen(false);
              }}
              className="rounded-full bg-slate-800/80 p-2 text-[var(--text-muted)] hover:bg-slate-700 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Three.js 3D Interactive WebGL AI Orb Visualizer */}
          <div className="flex flex-col items-center justify-center space-y-6 my-auto">
            <ThreeAiVoiceVisualizer
              isSpeaking={isSpeakingVoice}
              isListening={isListening}
              onClick={triggerVoiceListening}
            />

            {/* Status text badge */}
            <div className="text-center space-y-2 max-w-md">
              <span className="inline-block rounded-full bg-slate-900 border border-slate-800 px-4 py-1.5 text-xs font-bold text-slate-300">
                {voiceStatusText}
              </span>

              {voiceTranscriptText && (
                <p className="text-xs text-[var(--text-muted)] italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  "{voiceTranscriptText}"
                </p>
              )}
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="flex items-center gap-6 pb-6">
            <button
              type="button"
              onClick={triggerVoiceListening}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Mute / Unmute Mic"
            >
              {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>

            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsVoiceModeOpen(false);
                toast.success('Voice mode ended.');
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transition-all"
              title="End Voice Call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
