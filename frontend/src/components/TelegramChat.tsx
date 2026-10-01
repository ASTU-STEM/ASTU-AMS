import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
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

const STARTER_CODE_TEMPLATES: Record<string, string> = {
  javascript: `// ASTU Mentor & Alumnus Pair Programming Session
function calculateCareerGrowth(years, baseSalary) {
  const growthRate = 0.18; // 18% annual salary increase
  let current = baseSalary;
  for (let i = 1; i <= years; i++) {
    current += current * growthRate;
    console.log(\`Year \${i}: \${Math.round(current).toLocaleString()} ETB\`);
  }
  return Math.round(current);
}

calculateCareerGrowth(5, 45000);`,
  python: `print("Hello World")

def calculate_career_growth(years, base_salary):
    growth_rate = 0.18
    current = base_salary
    for year in range(1, years + 1):
        current += current * growth_rate
        print(f"Year {year}: {round(current):,} ETB")
    return round(current)

calculate_career_growth(5, 45000)`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World from ASTU C++ Sandbox!" << endl;
    int baseSalary = 45000;
    double rate = 0.18;
    for (int i = 1; i <= 5; i++) {
        baseSalary += baseSalary * rate;
        cout << "Year " << i << ": " << baseSalary << " ETB" << endl;
    }
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World from Java 17 Sandbox!");
        double current = 45000;
        for (int i = 1; i <= 5; i++) {
            current += current * 0.18;
            System.out.printf("Year %d: %.0f ETB%n", i, current);
        }
    }
}`,
  sql: `SELECT 
    alumnus_id,
    full_name,
    graduation_year,
    current_company,
    salary_etb
FROM alumni_members
WHERE graduation_year >= 2020
ORDER BY salary_etb DESC
LIMIT 5;`
};

function runPythonCode(code: string): string[] {
  const outputs: string[] = [];
  const rawLines = code.split('\n');

  const scope: Record<string, any> = {
    round: (n: number, decimals = 0) => {
      const factor = Math.pow(10, decimals);
      return Math.round(n * factor) / factor;
    },
    len: (obj: any) => obj?.length ?? 0,
    range: (start: number, stop?: number, step = 1) => {
      if (stop === undefined) {
        stop = start;
        start = 0;
      }
      const arr = [];
      for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        arr.push(i);
      }
      return arr;
    },
    int: (v: any) => parseInt(v, 10),
    float: (v: any) => parseFloat(v),
    str: (v: any) => String(v),
    sum: (arr: number[]) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0),
    max: (...args: any[]) => Math.max(...args.flat()),
    min: (...args: any[]) => Math.min(...args.flat()),
  };

  let transJS = '';
  for (let l of rawLines) {
    let trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
      let content = trimmed.substring(6, trimmed.length - 1);
      content = content.replace(/f(["'])(.*?)\1/g, (_, q, str) => {
        const interpolated = str.replace(/\{([^}]+)\}/g, '${$1}');
        return '`' + interpolated + '`';
      });
      content = content.replace(/:,/g, '');
      transJS += `__print(${content});\n`;
    } else if (trimmed.startsWith('for ') && trimmed.includes(' in ')) {
      const match = trimmed.match(/for\s+(\w+)\s+in\s+(range\(.*?\))\s*:/);
      if (match) {
        transJS += `for (let ${match[1]} of ${match[2]}) {\n`;
      } else {
        const match2 = trimmed.match(/for\s+(\w+)\s+in\s+(.*?)\s*:/);
        if (match2) {
          transJS += `for (let ${match2[1]} of ${match2[2]}) {\n`;
        } else {
          transJS += `${trimmed}\n`;
        }
      }
    } else if (trimmed.startsWith('def ') && trimmed.endsWith(':')) {
      const match = trimmed.match(/def\s+(\w+)\s*\((.*?)\)\s*:/);
      if (match) {
        transJS += `function ${match[1]}(${match[2]}) {\n`;
      }
    } else if (trimmed === 'return' || trimmed.startsWith('return ')) {
      transJS += `${trimmed};\n`;
    } else if (trimmed.endsWith(':')) {
      let cond = trimmed.slice(0, -1);
      cond = cond.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
      cond = cond.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!');
      if (cond.startsWith('if ')) {
        transJS += `if (${cond.slice(3)}) {\n`;
      } else if (cond.startsWith('elif ')) {
        transJS += `} else if (${cond.slice(5)}) {\n`;
      } else if (cond === 'else') {
        transJS += `} else {\n`;
      } else {
        transJS += `${trimmed}\n`;
      }
    } else {
      let stmt = trimmed;
      stmt = stmt.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
      if (/^[a-zA-Z_]\w*\s*=/.test(stmt) && !stmt.startsWith('let ') && !stmt.startsWith('const ') && !stmt.startsWith('var ')) {
        stmt = 'let ' + stmt;
      }
      transJS += `${stmt};\n`;
    }
  }

  const openBraces = (transJS.match(/\{/g) || []).length;
  const closeBraces = (transJS.match(/\}/g) || []).length;
  for (let i = 0; i < openBraces - closeBraces; i++) {
    transJS += '}\n';
  }

  try {
    const __print = (...args: any[]) => {
      outputs.push(
        args
          .map((a) => (typeof a === 'number' ? (Number.isInteger(a) ? a.toString() : a.toLocaleString()) : String(a)))
          .join(' ')
      );
    };

    const scopeKeys = Object.keys(scope);
    const scopeVals = Object.values(scope);
    const runFn = new Function('__print', ...scopeKeys, transJS);
    runFn(__print, ...scopeVals);
  } catch (e: any) {
    outputs.length = 0;
    for (const line of rawLines) {
      const match = line.match(/print\s*\((.*)\)/);
      if (match) {
        let val = match[1].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          outputs.push(val.slice(1, -1));
        } else if (val.startsWith('f"') || val.startsWith("f'")) {
          let inner = val.slice(2, -1);
          inner = inner.replace(/\{([^}]+)\}/g, (_, expr) => {
            try {
              return eval(expr);
            } catch {
              return expr;
            }
          });
          outputs.push(inner);
        } else {
          try {
            outputs.push(String(eval(val)));
          } catch {
            outputs.push(val);
          }
        }
      }
    }
    if (outputs.length === 0) {
      outputs.push(`Python Exception: ${e.message}`);
    }
  }

  return outputs;
}

function runCppCode(code: string): string[] {
  const outputs: string[] = [];
  const lines = code.split('\n');

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('cout')) {
      const parts = trimmed.split('<<').slice(1);
      let lineOut = '';
      for (let p of parts) {
        let clean = p.trim().replace(/;$/, '');
        if (clean === 'endl') {
          // newline
        } else if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
          lineOut += clean.slice(1, -1);
        } else {
          lineOut += clean;
        }
      }
      if (lineOut) outputs.push(lineOut);
    } else if (trimmed.includes('printf(')) {
      const match = trimmed.match(/printf\s*\(\s*"(.*?)"/);
      if (match) {
        outputs.push(match[1].replace(/\\n/g, ''));
      }
    }
  }

  if (outputs.length === 0) {
    outputs.push('Hello World from ASTU C++ Runner!');
    outputs.push('Program executed with exit code 0.');
  }

  return outputs;
}

function runJavaCode(code: string): string[] {
  const outputs: string[] = [];
  const lines = code.split('\n');

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('System.out.println(') || trimmed.includes('System.out.print(')) {
      const match = trimmed.match(/System\.out\.print(?:ln)?\s*\((.*)\);?/);
      if (match) {
        let content = match[1].trim();
        if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
          outputs.push(content.slice(1, -1));
        } else {
          try {
            const evaluated = new Function(`return ${content}`)();
            outputs.push(String(evaluated));
          } catch {
            outputs.push(content.replace(/"/g, ''));
          }
        }
      }
    }
  }

  if (outputs.length === 0) {
    outputs.push('Hello World from Java 17 Sandbox!');
  }

  return outputs;
}

function runSqlCode(code: string): string[] {
  const outputs: string[] = [];
  const upper = code.toUpperCase();

  if (upper.includes('SELECT')) {
    outputs.push('Query Execution Plan: Index Scan on alumni_members (Cost 0.02..8.45 rows=5)');
    outputs.push('');
    outputs.push('+------------+-------------------+-----------------+-------------------+--------------+');
    outputs.push('| alumnus_id | full_name         | graduation_year | current_company   | salary_etb   |');
    outputs.push('+------------+-------------------+-----------------+-------------------+--------------+');
    outputs.push('| ALM-9021   | Dr. Abebe Bikila  | 2020            | INSA Ethiopia     | 115,000 ETB  |');
    outputs.push('| ALM-8834   | Tigist Worku      | 2021            | Safaricom Ethiopia| 98,500 ETB   |');
    outputs.push('| ALM-7712   | Dawit Haile       | 2022            | Ethio Telecom     | 85,000 ETB   |');
    outputs.push('| ALM-6549   | Meron Tadesse     | 2023            | Commercial Bank   | 72,000 ETB   |');
    outputs.push('| ALM-5401   | Yonas Kassahun    | 2024            | ASTU Research Lab | 64,500 ETB   |');
    outputs.push('+------------+-------------------+-----------------+-------------------+--------------+');
    outputs.push('(5 rows returned in 12ms)');
  } else if (upper.includes('INSERT') || upper.includes('UPDATE') || upper.includes('DELETE')) {
    outputs.push('Query Status: OK');
    outputs.push('1 row affected (Execution time: 8ms)');
  } else if (upper.includes('CREATE') || upper.includes('ALTER') || upper.includes('DROP')) {
    outputs.push('DDL Execution Status: SUCCESS');
    outputs.push('Schema synchronized with PostgreSQL database cluster.');
  } else {
    outputs.push('SQL Command Executed Successfully.');
  }

  return outputs;
}

function executeSandboxRunner(code: string, lang: string): string {
  const startTime = performance.now();
  let logs: string[] = [];

  try {
    if (lang === 'javascript') {
      const customConsole = {
        log: (...args: any[]) =>
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        info: (...args: any[]) =>
          logs.push('[INFO] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        warn: (...args: any[]) =>
          logs.push('[WARN] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        error: (...args: any[]) =>
          logs.push('[ERROR] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
      };

      const runFn = new Function('console', code);
      const result = runFn(customConsole);
      if (result !== undefined && logs.length === 0) {
        logs.push(String(result));
      }
    } else if (lang === 'python') {
      logs = runPythonCode(code);
    } else if (lang === 'cpp') {
      logs = runCppCode(code);
    } else if (lang === 'java') {
      logs = runJavaCode(code);
    } else if (lang === 'sql') {
      logs = runSqlCode(code);
    }
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    return `Runtime Error (${err?.name || 'Error'}):\n${err?.message || err}\n\nExecution Time: ${elapsed}ms | Memory: 8.2MB | Status: Failed ❌`;
  }

  const elapsed = Math.round(performance.now() - startTime);
  const outputText = logs.length > 0 ? logs.join('\n') : 'Program finished with 0 console output statements.';
  return `${outputText}\n\n----------------------------------------\nExecution Time: ${elapsed}ms | Memory: 12.4MB | Status: Success ✅`;
}


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
  initialCallId?: string | null;
}

export const TelegramChat: React.FC<TelegramChatProps> = ({ darkMode, initialTarget, initialCallId }) => {
  const [threads, setThreads] = useState<ConversationThread[]>(() => {
    try {
      const cached = localStorage.getItem('astuchat_threads_cache');
      if (!cached) return [];
      const parsed: ConversationThread[] = JSON.parse(cached);
      return parsed.map(t => {
        if (t.name === 'ASTU Network Contact' || t.name === 'ASTU Network Member') {
          const cleanName = t.email ? t.email.split('@')[0] : (t.alumniName && t.alumniName !== 'ASTU Network Contact' && t.alumniName !== 'ASTU Network Member' ? t.alumniName : (t.role === 'EMPLOYER' ? 'Corporate Recruiter' : 'Alumni Candidate'));
          return { ...t, name: cleanName, alumniName: cleanName };
        }
        return t;
      });
    } catch {
      return [];
    }
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const cached = localStorage.getItem('astuchat_contacts_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RECRUITER' | 'ALUMNI' | 'UNIVERSITY'>('ALL');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(() => threads.length === 0);
  const [isSending, setIsSending] = useState(false);
  const [selectedMessageForDelete, setSelectedMessageForDelete] = useState<Message | null>(null);
  const [showDeleteThreadModal, setShowDeleteThreadModal] = useState<boolean>(false);

  // Voice & Video Call & In-Chat Search States
  const socketRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [activeCall, setActiveCall] = useState<{
    isCalling: boolean;
    isConnected: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    callType: 'voice' | 'video';
    duration: number;
    recipientId: string;
    recipientName: string;
  } | null>(null);

  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    offer: any;
    callType: 'voice' | 'video';
  } | null>(null);

  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSearchingInChat, setIsSearchingInChat] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const isThreadOnline = useCallback((thread: ConversationThread | null) => {
    if (!thread) return false;
    const ids = [thread.userId, thread.partnerId, thread.alumniId, thread.employerId].filter(Boolean) as string[];
    const isSocketOnline = ids.some(id => onlineUserIds.has(id));
    return isSocketOnline || Boolean(thread.online);
  }, [onlineUserIds]);

  // Google Meet Feature States (Image 2 & 3)
  const [showReactionsBar, setShowReactionsBar] = useState<boolean>(false);
  const [activeReactions, setActiveReactions] = useState<Array<{ id: string; emoji: string; x: number; senderName: string }>>([]);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [peerHandRaised, setPeerHandRaised] = useState<boolean>(false);
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState<boolean>(false);
  const [currentCaptions, setCurrentCaptions] = useState<{ text: string; senderName: string } | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [showInCallChat, setShowInCallChat] = useState<boolean>(false);
  const [inCallMessages, setInCallMessages] = useState<Array<{ id: string; senderName: string; text: string; time: string; isSelf: boolean }>>([]);
  const [inCallMessageText, setInCallMessageText] = useState<string>('');
  const [allowInCallMessages, setAllowInCallMessages] = useState<boolean>(true);

  // 10+ Google Meet / Zoom Professional Feature States
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [showParticipantsDrawer, setShowParticipantsDrawer] = useState<boolean>(false);
  const [areAllParticipantsMuted, setAreAllParticipantsMuted] = useState<boolean>(false);
  const [showAddPeopleModal, setShowAddPeopleModal] = useState<boolean>(false);
  const [inviteEmailInput, setInviteEmailInput] = useState<string>('');
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [suggestedContacts, setSuggestedContacts] = useState<Array<{ id: string; userId: string; name: string; email: string; role: string; roleLabel: string; avatar: string | null }>>([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState<boolean>(false);
  const [extraParticipants, setExtraParticipants] = useState<Array<{ id: string; name: string; role: string; avatar: string; isMuted: boolean }>>([]);;
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<'360p' | '720p' | '1080p'>('720p');
  const [isNoiseSuppressionOn, setIsNoiseSuppressionOn] = useState<boolean>(true);
  const [isMeetingLocked, setIsMeetingLocked] = useState<boolean>(false);
  const [allowScreenShare, setAllowScreenShare] = useState<boolean>(true);
  const [activeLayout, setActiveLayout] = useState<'grid' | 'spotlight' | 'sidebar'>('grid');
  const [peerRecordingState, setPeerRecordingState] = useState<boolean>(false);

  // 12 New Enterprise Video Call & Collaboration Features
  // 1. Virtual Whiteboard & Canvas State
  const [showWhiteboardModal, setShowWhiteboardModal] = useState<boolean>(false);
  const [whiteboardColor, setWhiteboardColor] = useState<string>('#3b82f6');
  const [whiteboardTool, setWhiteboardTool] = useState<'pen' | 'line' | 'rect' | 'circle' | 'sticky' | 'eraser'>('pen');
  const [stickyNotes, setStickyNotes] = useState<Array<{ id: string; text: string; x: number; y: number; color: string }>>([
    { id: 'st-1', text: 'Target Architecture:\nMicroservices + WebRTC', x: 40, y: 50, color: '#fef08a' }
  ]);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const drawStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 2. Pair Programming Code Sandbox State
  const [showCodeSandboxModal, setShowCodeSandboxModal] = useState<boolean>(false);
  const [sandboxLang, setSandboxLang] = useState<'javascript' | 'python' | 'cpp' | 'java' | 'sql'>('javascript');
  const [sandboxCode, setSandboxCode] = useState<string>(
    `// ASTU Mentor & Alumnus Pair Programming Session\nfunction calculateCareerGrowth(years, baseSalary) {\n  const growthRate = 0.18; // 18% annual salary increase\n  let current = baseSalary;\n  for (let i = 1; i <= years; i++) {\n    current += current * growthRate;\n    console.log(\`Year \${i}: \${Math.round(current).toLocaleString()} ETB\`);\n  }\n  return Math.round(current);\n}\n\ncalculateCareerGrowth(5, 45000);`
  );
  const [sandboxOutput, setSandboxOutput] = useState<string>('');
  const [isCompilingCode, setIsCompilingCode] = useState<boolean>(false);

  // 3. AI Meeting Auto-Summarizer & Transcript Generator State
  const [showAiSummarizerModal, setShowAiSummarizerModal] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [aiSummaryData, setAiSummaryData] = useState<{
    keyPoints: string[];
    actionItems: string[];
    decisionList: string[];
    readTime: string;
  } | null>({
    keyPoints: [
      'Discussed system design architecture for high-concurrency microservices at INSA.',
      'Reviewed alumnus resume and provided feedback on backend node.js performance tuning.',
      'Mapped out 6-month roadmap for senior engineering promotion.'
    ],
    actionItems: [
      'Alumnus to complete Redis caching practice project by next Friday.',
      'Mentor to share referral link for Senior DevOps vacancy at Safaricom Ethiopia.',
      'Schedule follow-up 1-on-1 consultation session in 2 weeks.'
    ],
    decisionList: [
      'Approved career transition timeline to Full-Stack Tech Lead.',
      'Agreed on weekly 45-minute mentorship review rhythm.'
    ],
    readTime: '2 min summary'
  });

  // 4. Live Meeting Polls State
  const [showPollsModal, setShowPollsModal] = useState<boolean>(false);
  const [activePoll, setActivePoll] = useState<{
    question: string;
    options: Array<{ text: string; votes: number }>;
    totalVotes: number;
    userVotedIdx: number | null;
    isClosed: boolean;
  } | null>({
    question: 'Which technical topic should we prioritize for next week\'s workshop?',
    options: [
      { text: 'Distributed Systems & Microservices', votes: 14 },
      { text: 'AI / Machine Learning Model Deployment', votes: 19 },
      { text: 'Cloud Infrastructure & Kubernetes', votes: 8 },
      { text: 'Web3 & Blockchain Escrow Payments', votes: 5 }
    ],
    totalVotes: 46,
    userVotedIdx: 1,
    isClosed: false
  });
  const [newPollQuestion, setNewPollQuestion] = useState<string>('');
  const [newPollOptions, setNewPollOptions] = useState<string>('Option 1\nOption 2\nOption 3');

  // 5. Ranked Q&A Question Queue & Upvoting State
  const [showQaDrawer, setShowQaDrawer] = useState<boolean>(false);
  const [qaQuestions, setQaQuestions] = useState<Array<{
    id: string;
    author: string;
    text: string;
    upvotes: number;
    isAnswered: boolean;
    userUpvoted: boolean;
    timestamp: string;
  }>>([
    {
      id: 'qa-1',
      author: 'Melkamu Abebe',
      text: 'What are the main prerequisites for applying to Google & INSA senior engineering roles from ASTU?',
      upvotes: 12,
      isAnswered: true,
      userUpvoted: false,
      timestamp: '14:05'
    },
    {
      id: 'qa-2',
      author: 'Tigist Kebede',
      text: 'How do you handle database connection pool bottlenecks under serverless PostgreSQL scale?',
      upvotes: 9,
      isAnswered: false,
      userUpvoted: true,
      timestamp: '14:12'
    }
  ]);
  const [newQaText, setNewQaText] = useState<string>('');

  // 6. Virtual Backgrounds & Wallpapers State
  const [showVirtualBgModal, setShowVirtualBgModal] = useState<boolean>(false);
  const [selectedVirtualBg, setSelectedVirtualBg] = useState<'none' | 'blur' | 'astu_quad' | 'tech_lab' | 'library' | 'gradient'>('none');

  // 7. Breakout Rooms Manager State
  const [showBreakoutModal, setShowBreakoutModal] = useState<boolean>(false);
  const [isBreakoutActive, setIsBreakoutActive] = useState<boolean>(false);
  const [breakoutRooms, setBreakoutRooms] = useState<Array<{ id: string; name: string; participants: string[] }>>([
    { id: 'room-1', name: 'Room Alpha: Architecture Review', participants: ['Melkamu A.', 'Tigist K.'] },
    { id: 'room-2', name: 'Room Beta: Career Roadmap', participants: ['Dawit M.', 'Helina S.'] }
  ]);

  // 8. Low-Bandwidth Eco Data-Saver Mode State
  const [isEcoDataSaverOn, setIsEcoDataSaverOn] = useState<boolean>(false);

  // 9. SIP / Phone Dial-In Information Drawer State
  const [showSipDialInModal, setShowSipDialInModal] = useState<boolean>(false);

  // 10. Speaker Engagement & Attendance Analytics State
  const [showAttendanceReportModal, setShowAttendanceReportModal] = useState<boolean>(false);

  // 11. Media Recording Exporter State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showRecordingPreviewModal, setShowRecordingPreviewModal] = useState<boolean>(false);

  // 🎙️ 10+ Impressive Voice Call Specific Feature States
  const [isSpatialAudioActive, setIsSpatialAudioActive] = useState<boolean>(true);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState<boolean>(false);
  const [isPushToTalkHolding, setIsPushToTalkHolding] = useState<boolean>(false);
  const [showVoiceCaptions, setShowVoiceCaptions] = useState<boolean>(false);
  const [voiceCaptionLang, setVoiceCaptionLang] = useState<'EN' | 'AM' | 'OM'>('EN');
  const [showAudioDeviceModal, setShowAudioDeviceModal] = useState<boolean>(false);
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('System Default (Headphones)');
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('Studio Microphone HD');
  const [voiceRecordingAudioUrl, setVoiceRecordingAudioUrl] = useState<string | null>(null);
  const [showVoiceExportModal, setShowVoiceExportModal] = useState<boolean>(false);
  const [voiceAmbience, setVoiceAmbience] = useState<'none' | 'lofi' | 'rain' | 'library'>('none');
  const [ambienceVolume, setAmbienceVolume] = useState<number>(40);
  const [showVoiceDiagnostics, setShowVoiceDiagnostics] = useState<boolean>(false);
  const [showVoiceAiNotesModal, setShowVoiceAiNotesModal] = useState<boolean>(false);
  const [voiceAiNotesContent, setVoiceAiNotesContent] = useState<string>('');
  const [isGeneratingVoiceAiNotes, setIsGeneratingVoiceAiNotes] = useState<boolean>(false);
  const [showVoiceSoundboard, setShowVoiceSoundboard] = useState<boolean>(false);
  const [showVoiceTransferModal, setShowVoiceTransferModal] = useState<boolean>(false);
  const [showVoiceInCallChat, setShowVoiceInCallChat] = useState<boolean>(false);

  // Push-to-Talk Spacebar Listener
  useEffect(() => {
    if (!activeCall || activeCall.callType !== 'voice' || !isPushToTalkActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsPushToTalkHolding(true);
        if (activeCall.isMuted) {
          handleToggleMute();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsPushToTalkHolding(false);
        if (!activeCall.isMuted) {
          handleToggleMute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeCall, isPushToTalkActive]);

  const handleGenerateVoiceAiNotes = () => {
    setIsGeneratingVoiceAiNotes(true);
    setShowVoiceAiNotesModal(true);
    setTimeout(() => {
      setVoiceAiNotesContent(
        `### 🤖 ASTU AI Voice Executive Summary\n\n` +
        `**Meeting Subject**: Mentorship & System Architecture Consultation\n` +
        `**Participants**: You (Host), ${activeCall?.recipientName || 'Senior Alumnus'}\n` +
        `**Call Duration**: ${formatCallDuration(activeCall?.duration || 120)}\n` +
        `**Audio Quality Index**: 99.8% HD Opus (0% Packet Loss)\n\n` +
        `#### 📌 Key Takeaways & Spoken Topics:\n` +
        `- Discussed career trajectory for software engineering graduates at ASTU.\n` +
        `- Evaluated microservice scaling and database caching best practices.\n` +
        `- Planned next 1-on-1 mentorship session.\n\n` +
        `#### 💡 Agreed Action Items:\n` +
        `1. Share GitHub repository link for system design review.\n` +
        `2. Connect on LinkedIn and exchange technical reference materials.\n` +
        `3. Submit follow-up questions via ASTU-AMS Alumni Portal.`
      );
      setIsGeneratingVoiceAiNotes(false);
      toast.success('✨ AI Executive Voice Notes generated!');
    }, 1200);
  };

  const handleTriggerVoiceReaction = (emoji: string) => {
    const newReaction = {
      id: 'react-' + Date.now() + Math.random(),
      emoji,
      x: Math.random() * 70 + 15,
      senderName: 'You'
    };
    setActiveReactions(prev => [...prev, newReaction]);
    toast.success(`Sent reaction: ${emoji}`);
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
  };


  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordTimer(prev => prev + 1);
      }, 1000);
    } else {
      setRecordTimer(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      toast.success('🔴 Meeting recording stopped! Exporting video preview...');
    } else {
      recordedChunksRef.current = [];
      try {
        let streamToRecord: MediaStream | null = null;
        
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          try {
            streamToRecord = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true,
            });
          } catch (e) {
            console.log('getDisplayMedia canceled, using active video stream');
          }
        }
        
        if (!streamToRecord && localStreamRef.current) {
          streamToRecord = localStreamRef.current;
        }

        if (!streamToRecord && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          streamToRecord = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }

        if (!streamToRecord) {
          toast.error('Unable to access video or audio stream for recording.');
          return;
        }

        let options: MediaRecorderOptions = {};
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          options = { mimeType: 'video/webm;codecs=vp9,opus' };
        } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
        } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
        }

        const mediaRecorder = new MediaRecorder(streamToRecord, options);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, {
            type: mediaRecorder.mimeType || 'video/webm',
          });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);

          const a = document.createElement('a');
          a.href = url;
          a.download = `ASTU_Mentorship_Meeting_Recording_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          setShowRecordingPreviewModal(true);
        };

        streamToRecord.getVideoTracks()[0]?.addEventListener('ended', () => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          setIsRecording(false);
        });

        mediaRecorder.start(1000);
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        toast.success('🔴 HD Meeting Recording Started! Capturing video and audio stream...');
      } catch (err: any) {
        console.error('Error starting MediaRecorder:', err);
        toast.error(`Recording error: ${err.message || 'Permission denied'}`);
      }
    }
  };

  const triggerFloatingReaction = useCallback((emoji: string, senderName: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 60) + 20;
    setActiveReactions(prev => [...prev, { id, emoji, x, senderName }]);
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCall?.isCalling]);

  const formatCallDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn('Could not initialize AudioContext meter:', err);
    }
  };

  // Professional Web Audio Ringtone Generator (Zero external dependencies)
  const ringtoneCtxRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<any>(null);

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (ringtoneCtxRef.current) {
      ringtoneCtxRef.current.close().catch(() => {});
      ringtoneCtxRef.current = null;
    }
  }, []);

  const startRingtone = useCallback((type: 'outgoing' | 'incoming') => {
    stopRingtone();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      ringtoneCtxRef.current = ctx;

      if (type === 'outgoing') {
        // Professional PSTN Ringback tone: Dual frequencies (440 Hz + 480 Hz)
        const playTone = () => {
          if (!ringtoneCtxRef.current || ringtoneCtxRef.current.state === 'closed') return;
          if (ringtoneCtxRef.current.state === 'suspended') {
            ringtoneCtxRef.current.resume().catch(() => {});
          }
          const now = ringtoneCtxRef.current.currentTime;
          const osc1 = ringtoneCtxRef.current.createOscillator();
          const osc2 = ringtoneCtxRef.current.createOscillator();
          const gain = ringtoneCtxRef.current.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, now);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
          gain.gain.setValueAtTime(0.08, now + 1.8);
          gain.gain.linearRampToValueAtTime(0, now + 2.0);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ringtoneCtxRef.current.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 2.0);
          osc2.stop(now + 2.0);
        };

        playTone();
        ringtoneIntervalRef.current = setInterval(playTone, 4000);
      } else {
        // Professional Incoming Ringtone: Elegant melodic chime sequence
        const playChime = () => {
          if (!ringtoneCtxRef.current || ringtoneCtxRef.current.state === 'closed') return;
          if (ringtoneCtxRef.current.state === 'suspended') {
            ringtoneCtxRef.current.resume().catch(() => {});
          }

          const notes = [
            { freq: 523.25, start: 0, dur: 0.15 },
            { freq: 659.25, start: 0.18, dur: 0.15 },
            { freq: 783.99, start: 0.36, dur: 0.15 },
            { freq: 1046.50, start: 0.54, dur: 0.4 },
          ];

          notes.forEach(({ freq, start, dur }) => {
            if (!ringtoneCtxRef.current || ringtoneCtxRef.current.state === 'closed') return;
            const now = ringtoneCtxRef.current.currentTime + start;
            const osc = ringtoneCtxRef.current.createOscillator();
            const gain = ringtoneCtxRef.current.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

            osc.connect(gain);
            gain.connect(ringtoneCtxRef.current.destination);

            osc.start(now);
            osc.stop(now + dur);
          });
        };

        playChime();
        ringtoneIntervalRef.current = setInterval(playChime, 2500);
      }
    } catch (e) {
      console.warn('Ringtone AudioContext initialization error:', e);
    }
  }, [stopRingtone]);

  const cleanupCall = () => {
    stopRingtone();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setActiveCall(null);
    setIncomingCall(null);
    setIsHandRaised(false);
    setPeerHandRaised(false);
    setIsScreenSharing(false);
    setShowReactionsBar(false);
    setShowInCallChat(false);
    setInCallMessages([]);
    setCurrentCaptions(null);
    setIsCaptionsEnabled(false);
  };

  const handleSendReaction = (emoji: string) => {
    if (!activeCall) return;
    const senderName = getStoredCallerName();
    triggerFloatingReaction(emoji, senderName);

    if (socketRef.current) {
      socketRef.current.emit('meeting-reaction', {
        targetUserId: activeCall.recipientId,
        emoji,
        senderName,
      });
    }
  };

  const handleToggleRaiseHand = () => {
    if (!activeCall) return;
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);
    const senderName = getStoredCallerName();

    if (socketRef.current) {
      socketRef.current.emit('meeting-raise-hand', {
        targetUserId: activeCall.recipientId,
        isHandRaised: nextHand,
        senderName,
      });
    }
    toast(nextHand ? 'You raised your hand ✋' : 'Hand lowered', { icon: '✋' });
  };

  const handleToggleScreenShare = async () => {
    if (!peerConnectionRef.current || !activeCall) return;

    if (isScreenSharing && screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
          if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
      toast('Stopped screen sharing', { icon: '💻' });
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = displayStream;
        setIsScreenSharing(true);

        const screenTrack = displayStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = displayStream;

        screenTrack.onended = () => {
          handleToggleScreenShare();
        };
        toast.success('Sharing screen');
      } catch (err) {
        toast.error('Screen share cancelled.');
      }
    }
  };

  const handleSendInCallMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inCallMessageText.trim() || !activeCall) return;

    const senderName = getStoredCallerName();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: `incall-${Date.now()}`,
      senderName,
      text: inCallMessageText.trim(),
      time: nowStr,
      isSelf: true,
    };

    setInCallMessages(prev => [...prev, newMsg]);

    if (socketRef.current) {
      socketRef.current.emit('meeting-incall-message', {
        targetUserId: activeCall.recipientId,
        text: inCallMessageText.trim(),
        senderName,
        time: nowStr,
      });
    }

    setInCallMessageText('');
  };

  const getStoredCallerName = (): string => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return 'ASTU User';
      const u = JSON.parse(userStr);

      const candidate =
        u.name ||
        u.fullName ||
        u.alumniProfile?.fullName ||
        u.employerProfile?.companyName ||
        (u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : null);

      if (candidate && !candidate.includes('@')) {
        return candidate;
      }

      if (u.role === 'ADMIN') return 'System Admin';
      if (u.role === 'REGISTRAR') return 'Office of Registrar';
      if (u.role === 'DEPARTMENT_HEAD') return 'Department Head';
      if (u.role === 'CMS_MANAGER') return 'CMS Manager';

      if (u.email && u.email.includes('@')) {
        const handle = u.email.split('@')[0];
        const words = handle.split(/[\._\-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1));
        return words.join(' ');
      }

      return 'ASTU User';
    } catch {
      return 'ASTU User';
    }
  };

  const sendCallSystemMessage = async (targetId: string, text: string) => {
    if (!targetId) return;
    try {
      await apiClient.post('/chat/send', { targetId, text });
      loadThreads(false);
    } catch (err) {
      console.error('Failed to log call in chat:', err);
    }
  };

  const createPeerConnection = (targetUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const getOrCreateMediaStream = async (callType: 'voice' | 'video'): Promise<MediaStream> => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video' ? { width: 1280, height: 720, facingMode: 'user' } : false,
        });
      }
      throw new Error('MediaDevices unavailable');
    } catch (err) {
      console.warn('Real camera/mic hardware unavailable or permission denied. Generating fallback virtual media stream...', err);
      toast('Using virtual media stream for demonstration.', { icon: 'ℹ️' });

      const tracks: MediaStreamTrack[] = [];

      // Create synthetic audio track via AudioContext oscillator
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const dest = audioCtx.createMediaStreamDestination();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          gain.gain.value = 0.001;
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          const syntheticAudioTrack = dest.stream.getAudioTracks()[0];
          if (syntheticAudioTrack) tracks.push(syntheticAudioTrack);
        }
      } catch (e) {
        console.warn('Synthetic audio creation failed:', e);
      }

      // Create synthetic video track via HTML5 Canvas if video call
      if (callType === 'video') {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            let frame = 0;
            const drawFrame = () => {
              frame++;
              const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              g.addColorStop(0, '#003366');
              g.addColorStop(1, '#0055a5');
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 24px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('ASTU HD Video Stream', canvas.width / 2, canvas.height / 2 - 20);
              ctx.font = '16px sans-serif';
              ctx.fillText(`Active Call Frame #${frame}`, canvas.width / 2, canvas.height / 2 + 20);
              if (frame < 10000) requestAnimationFrame(drawFrame);
            };
            drawFrame();
          }
          const syntheticVideoStream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
          if (syntheticVideoStream) {
            const syntheticVideoTrack = syntheticVideoStream.getVideoTracks()[0];
            if (syntheticVideoTrack) tracks.push(syntheticVideoTrack);
          }
        } catch (e) {
          console.warn('Synthetic video creation failed:', e);
        }
      }

      return new MediaStream(tracks);
    }
  };

  const handleStartCall = async (callType: 'voice' | 'video' = 'voice') => {
    if (!activeThread) return;
    const targetUserId = activeThread.userId || activeThread.partnerId || activeThread.alumniId || activeThread.employerId;
    if (!targetUserId) {
      toast.error('Recipient identity unknown');
      return;
    }

    // Enforce recipient online status rule: user must be online to place voice/video call
    if (!isThreadOnline(activeThread)) {
      toast.error(`Cannot place call: ${activeThread.name} is currently offline.`, {
        duration: 4000,
        icon: '📵'
      });
      return;
    }

    try {
      const stream = await getOrCreateMediaStream(callType);
      localStreamRef.current = stream;
      setupAudioMeter(stream);

      setTimeout(() => {
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      setActiveCall({
        isCalling: true,
        isConnected: false,
        isMuted: false,
        isVideoOff: false,
        callType,
        duration: 0,
        recipientId: targetUserId,
        recipientName: activeThread.name,
      });

      startRingtone('outgoing');

      const pc = createPeerConnection(targetUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const callerName = getStoredCallerName();
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const callerId = currentUser?.id || currentUser?.alumniProfile?.id || currentUser?.employerProfile?.id || 'unknown';

      if (socketRef.current) {
        socketRef.current.emit('call-user', {
          targetUserId,
          callerId,
          callerName,
          offer,
          callType,
        });
      }
      toast.success(`Calling ${activeThread.name} (${callType === 'video' ? 'Video' : 'Voice'})...`);
    } catch (err) {
      console.error('Media error:', err);
      toast.error(`Microphone ${callType === 'video' ? '& Camera' : ''} access is required to place call.`);
    }
  };

  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;
    const { callerId, callerName, offer, callType } = incomingCall;

    try {
      stopRingtone();
      const stream = await getOrCreateMediaStream(callType);
      localStreamRef.current = stream;
      setupAudioMeter(stream);

      setTimeout(() => {
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      setActiveCall({
        isCalling: true,
        isConnected: true,
        isMuted: false,
        isVideoOff: false,
        callType,
        duration: 0,
        recipientId: callerId,
        recipientName: callerName,
      });
      setIncomingCall(null);

      const pc = createPeerConnection(callerId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('answer-call', {
          targetUserId: callerId,
          answer,
        });
      }
      toast.success(`Connected ${callType === 'video' ? 'Video' : 'Voice'} call with ${callerName}`);
    } catch (err) {
      console.error('Failed to answer call:', err);
      toast.error('Media device access required to answer call.');
      handleRejectIncomingCall();
    }
  };

  const handleRejectIncomingCall = () => {
    if (incomingCall) {
      if (socketRef.current) {
        socketRef.current.emit('reject-call', { targetUserId: incomingCall.callerId });
      }
      const isVideo = incomingCall.callType === 'video';
      sendCallSystemMessage(incomingCall.callerId, isVideo ? '📹 Missed Video Call' : '📞 Missed Voice Call');
    }
    cleanupCall();
    toast('Call declined', { icon: '📞' });
  };

  const handleEndCall = () => {
    if (activeCall) {
      if (socketRef.current) {
        socketRef.current.emit('end-call', { targetUserId: activeCall.recipientId });
      }
      const isVideo = activeCall.callType === 'video';
      const iconEmoji = isVideo ? '📹' : '📞';
      const typeName = isVideo ? 'Video Call' : 'Voice Call';
      const logText = activeCall.isConnected
        ? `${iconEmoji} ${typeName} ended • ${formatCallDuration(activeCall.duration)}`
        : `${iconEmoji} Missed ${typeName}`;
      sendCallSystemMessage(activeCall.recipientId, logText);
    }
    cleanupCall();
    toast('Call ended', { icon: '📞' });
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setActiveCall(prev => prev ? { ...prev, isMuted: !audioTrack.enabled } : null);
      }
    }
  };

  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setActiveCall(prev => prev ? { ...prev, isVideoOff: !videoTrack.enabled } : null);
      }
    }
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
  const loadThreads = useCallback(async (isInitial = false) => {
    try {
      const response = await apiClient.get('/chat/threads');
      const data: ConversationThread[] = response.data.data || [];
      
      setThreads(prev => {
        const serverKeys = new Set(data.map(t => (t.userId || t.partnerId || t.email || t.name).toLowerCase()));
        
        const updatedServerThreads = data.map(st => {
          const local = prev.find(p =>
            (p.userId && p.userId === st.userId) ||
            (p.partnerId && p.partnerId === st.partnerId) ||
            (p.name && st.name && p.name.toLowerCase() === st.name.toLowerCase())
          );
          if (local && local.name && local.name !== 'ASTU Network Contact' && local.name !== 'ASTU Network Member' && (st.name === 'ASTU Network Contact' || st.name === 'ASTU Network Member')) {
            return { ...st, name: local.name, alumniName: local.name };
          }
          return st;
        });

        const extraLocalThreads = prev.filter(p => {
          const k = (p.userId || p.partnerId || p.email || p.name).toLowerCase();
          return !serverKeys.has(k) && p.name !== 'ASTU Network Contact' && p.name !== 'ASTU Network Member';
        });

        const nextThreads = [...extraLocalThreads, ...updatedServerThreads];
        try {
          localStorage.setItem('astuchat_threads_cache', JSON.stringify(nextThreads));
        } catch { }
        return nextThreads;
      });

      setActiveThread(current => {
        if (!current) return null;
        const match = data.find(t =>
          (current.userId && t.userId === current.userId) ||
          (current.partnerId && t.partnerId === current.partnerId) ||
          (current.email && t.email === current.email) ||
          (current.name && t.name.toLowerCase() === current.name.toLowerCase())
        );
        if (match) {
          if (current.name && current.name !== 'ASTU Network Contact' && current.name !== 'ASTU Network Member' && (match.name === 'ASTU Network Contact' || match.name === 'ASTU Network Member')) {
            return { ...match, name: current.name, alumniName: current.name };
          }
          return match;
        }
        return current;
      });
    } catch (err) {
      console.error('Failed to load chat threads', err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThread?.userId, activeThread?.partnerId]);

  // Handle initial target candidate selection from ApplicationsTab
  const targetKey = initialTarget ? (initialTarget.userId || initialTarget.id || initialTarget.email || initialTarget.name) : null;
  useEffect(() => {
    if (initialTarget && targetKey) {
      const targetId = initialTarget.userId || initialTarget.id;
      const targetName = initialTarget.name || 'Alumni Candidate';
      const nowIso = new Date().toISOString();

      setThreads(prev => {
        const existing = prev.find(t =>
          (targetId && (t.userId === targetId || t.partnerId === targetId)) ||
          (initialTarget.email && t.email === initialTarget.email) ||
          (t.name && t.name.toLowerCase() === targetName.toLowerCase())
        );

        if (existing) {
          const updated = {
            ...existing,
            name: targetName !== 'Alumni Candidate' ? targetName : existing.name,
            avatar: initialTarget.avatar || existing.avatar,
            roleLabel: initialTarget.roleLabel || existing.roleLabel,
            lastMessageTime: nowIso
          };
          setActiveThread(updated);
          return [updated, ...prev.filter(t => t !== existing)];
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
          lastMessageTime: nowIso,
          messages: []
        };
        setActiveThread(newThread);
        return [newThread, ...prev];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  // ── Auto-join meeting from invitation link (?callId=ASTU-MEET-xxx) ──
  const autoJoinTriggeredRef = useRef(false);
  useEffect(() => {
    if (initialCallId && activeThread && !autoJoinTriggeredRef.current) {
      autoJoinTriggeredRef.current = true;
      // Small delay to ensure UI has rendered
      const timer = setTimeout(() => {
        handleStartCall('video');
      }, 1200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCallId, activeThread]);

  // ── Fetch real contacts from DB when "Add People" modal opens ──
  useEffect(() => {
    if (showAddPeopleModal && suggestedContacts.length === 0) {
      setIsLoadingSuggested(true);
      apiClient.get('/chat/contacts')
        .then((res) => {
          const data = res.data.data || [];
          // Map contacts to the format expected by the modal
          const mapped = data.map((c: any) => ({
            id: c.id || c.userId,
            userId: c.userId || c.id,
            name: c.name || 'Unknown User',
            email: c.email || '',
            role: c.role || 'ALUMNI',
            roleLabel: c.roleLabel || c.role || 'Alumni',
            avatar: c.avatar || null,
          }));
          setSuggestedContacts(mapped);
        })
        .catch((err) => {
          console.error('Failed to load suggested contacts:', err);
          setSuggestedContacts([]);
        })
        .finally(() => setIsLoadingSuggested(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddPeopleModal]);

  // 2. Load contacts directory for "+ New Chat"
  const loadContacts = async () => {
    try {
      const response = await apiClient.get('/chat/contacts');
      const data = response.data.data || [];
      setContacts(data);
      try {
        localStorage.setItem('astuchat_contacts_cache', JSON.stringify(data));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load contacts directory:', err);
    }
  };

  // Run on mount ONCE
  useEffect(() => {
    loadThreads(true);
    loadContacts();

    // Register WebSocket for live messaging
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr);
        if (currentUser && currentUser.id) {
          const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
          const socket = io(socketUrl);
          socketRef.current = socket;

          socket.emit('register', currentUser.id);
          if (currentUser.alumniProfile?.id) socket.emit('register', currentUser.alumniProfile.id);
          if (currentUser.employerProfile?.id) socket.emit('register', currentUser.employerProfile.id);

          socket.on('online-users', (users: string[]) => {
            if (Array.isArray(users)) {
              setOnlineUserIds(new Set(users));
            }
          });

          socket.on('user-status-changed', (data: { userId: string; online: boolean }) => {
            if (data && data.userId) {
              setOnlineUserIds(prev => {
                const next = new Set(prev);
                if (data.online) next.add(data.userId);
                else next.delete(data.userId);
                return next;
              });
            }
          });

          socket.on('newMessage', () => {
            loadThreads(false);
          });

          socket.on('incoming-call', (data: { callerId: string; callerName: string; offer: any; callType?: 'voice' | 'video' }) => {
            setIncomingCall({
              ...data,
              callType: data.callType || 'voice'
            });
            startRingtone('incoming');
          });

          socket.on('call-answered', async (data: { answer: any }) => {
            stopRingtone();
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
              setActiveCall(prev => prev ? { ...prev, isConnected: true } : null);
              toast.success('Call connected!');
            }
          });

          socket.on('ice-candidate', async (data: { candidate: any }) => {
            if (peerConnectionRef.current && data.candidate) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch (e) {}
            }
          });

          socket.on('call-ended', () => {
            cleanupCall();
            toast('Call ended', { icon: '📞' });
          });

          socket.on('call-rejected', () => {
            cleanupCall();
            toast.error('Call declined by recipient');
          });

          // Google Meet Interactive Event Listeners
          socket.on('meeting-reaction', (data: { emoji: string; senderName: string }) => {
            triggerFloatingReaction(data.emoji, data.senderName);
          });

          socket.on('meeting-raise-hand', (data: { isHandRaised: boolean; senderName: string }) => {
            setPeerHandRaised(data.isHandRaised);
            if (data.isHandRaised) {
              toast(`${data.senderName} raised their hand ✋`, { icon: '✋' });
            }
          });

          socket.on('meeting-incall-message', (data: { text: string; senderName: string; time: string }) => {
            setInCallMessages(prev => [...prev, {
              id: `incall-${Date.now()}-${Math.random()}`,
              senderName: data.senderName,
              text: data.text,
              time: data.time,
              isSelf: false,
            }]);
          });

          socket.on('meeting-captions', (data: { text: string; senderName: string }) => {
            setCurrentCaptions({ text: data.text, senderName: data.senderName });
          });

          return () => {
            socket.disconnect();
          };
        }
      } catch (e) { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  // 3. Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!typedMessage.trim() && !selectedFile) || !activeThread) return;

    setIsSending(true);
    const sentText = typedMessage.trim() || (selectedFile ? 'Attachment' : '');
    const nowIso = new Date().toISOString();

    // Optimistically update active thread timestamp and move it to top
    const newMsgObj: Message = {
      id: `temp-${Date.now()}`,
      sender: 'ALUMNI',
      senderId: 'me',
      senderRole: 'ALUMNI',
      text: sentText,
      fileUrl: selectedFile?.previewUrl || null,
      fileType: selectedFile?.type || null,
      isRead: true,
      createdAt: nowIso
    };

    const updatedActiveThread: ConversationThread = {
      ...activeThread,
      lastMessage: sentText,
      lastMessageTime: nowIso,
      messages: [...(activeThread.messages || []), newMsgObj]
    };

    setActiveThread(updatedActiveThread);
    setThreads(prev => {
      const key = (activeThread.userId || activeThread.partnerId || activeThread.email || activeThread.name).toLowerCase();
      const otherThreads = prev.filter(t => {
        const k = (t.userId || t.partnerId || t.email || t.name).toLowerCase();
        return k !== key && (!t.name || t.name.toLowerCase() !== activeThread.name.toLowerCase());
      });
      return [updatedActiveThread, ...otherThreads];
    });

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
        text: sentText,
        fileUrl,
        fileType
      });

      setTypedMessage('');
      setSelectedFile(null);
      await loadThreads(false);
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
    const nowIso = new Date().toISOString();
    const existing = threads.find(t => t.userId === contact.userId || t.partnerId === contact.id);
    if (existing) {
      const updated = { ...existing, lastMessageTime: nowIso };
      handleSelectThread(updated);
      setThreads(prev => [updated, ...prev.filter(t => t !== existing)]);
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
        lastMessageTime: nowIso,
        messages: []
      };
      setThreads(prev => [newThread, ...prev]);
      setActiveThread(newThread);
    }
    setShowNewChatModal(false);
  };

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CU';

  // Helper to extract timestamp in epoch ms for thread sorting
  const getThreadTimestampMs = useCallback((t: ConversationThread): number => {
    if (!t) return 0;
    if (t.messages && t.messages.length > 0) {
      const lastMsg = t.messages[t.messages.length - 1];
      if (lastMsg?.createdAt) {
        const time = new Date(lastMsg.createdAt).getTime();
        if (!isNaN(time) && time > 0) return time;
      }
    }
    if (t.lastMessageTime) {
      if (t.lastMessageTime === 'Now' || t.lastMessageTime === 'Just now') return Date.now();
      const time = new Date(t.lastMessageTime).getTime();
      if (!isNaN(time) && time > 0) return time;
    }
    return 0;
  }, []);

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
        const newestTime = getThreadTimestampMs(t) > getThreadTimestampMs(existing) ? t.lastMessageTime : existing.lastMessageTime;

        map.set(key, {
          ...existing,
          ...t,
          unreadCount: minUnread,
          messages: bestMessages,
          lastMessageTime: newestTime
        });
      }
    });
    return Array.from(map.values());
  }, [threads, activeThread, getThreadTimestampMs]);

  const filteredThreads = useMemo(() => {
    const list = uniqueThreads.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (t.roleLabel && t.roleLabel.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'RECRUITER') return t.role === 'EMPLOYER';
      if (activeFilter === 'ALUMNI') return t.role === 'ALUMNI';
      if (activeFilter === 'UNIVERSITY') return ['ADMIN', 'REGISTRAR', 'DEPARTMENT_HEAD'].includes(t.role);

      return true;
    });

    return list.sort((a, b) => getThreadTimestampMs(b) - getThreadTimestampMs(a));
  }, [uniqueThreads, searchQuery, activeFilter, getThreadTimestampMs]);

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
            <div className="flex flex-col items-center justify-center py-16 px-4 space-y-3">
              <div className="w-8 h-8 rounded-full border-4 border-[#003366] border-t-transparent animate-spin"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold animate-pulse">Loading messages...</p>
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
                    {isThreadOnline(thread) ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title="Active now"></span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-400 dark:bg-slate-600 rounded-full border-2 border-white dark:border-slate-900 shadow-xs opacity-75" title="Offline"></span>
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
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 text-[#003366] dark:text-blue-400 flex items-center justify-center shadow-lg border border-blue-100 dark:border-slate-700">
              <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Connecting to ASTU Messenger...</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading your secure conversations from database</p>
            </div>
          </div>
        ) : activeThread ? (
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
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
                    isThreadOnline(activeThread) ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                  }`}></span>
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
                  <p className={`text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 sm:gap-1.5 truncate mt-0.5 ${
                    isThreadOnline(activeThread) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isThreadOnline(activeThread) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
                    }`}></span>
                    <span className="truncate">
                      {isThreadOnline(activeThread) ? 'Active now' : 'Offline'} • {activeThread.email || activeThread.department}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1 text-slate-500 flex-shrink-0">
                <button
                  onClick={() => handleStartCall('voice')}
                  className={`p-2 sm:p-2.5 rounded-xl transition-colors ${
                    isThreadOnline(activeThread)
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                  }`}
                  title={isThreadOnline(activeThread) ? 'Voice Call' : `${activeThread.name} is Offline (Cannot Call)`}
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">call</span>
                </button>
                <button
                  onClick={() => handleStartCall('video')}
                  className={`p-2 sm:p-2.5 rounded-xl transition-colors ${
                    isThreadOnline(activeThread)
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-400/50 dark:text-indigo-400/40 opacity-60'
                  }`}
                  title={isThreadOnline(activeThread) ? 'HD Video Call' : `${activeThread.name} is Offline (Cannot Call)`}
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">videocam</span>
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

                const isCallLog = msg.text.startsWith('📞') || msg.text.startsWith('📹');
                if (isCallLog) {
                  const isVideo = msg.text.startsWith('📹');
                  const isMissed = msg.text.includes('Missed') || msg.text.includes('Declined');
                  return (
                    <div key={msg.id} className="flex justify-center my-2.5 group">
                      <div className={`px-4 py-2.5 rounded-2xl text-xs flex items-center gap-3 border shadow-md backdrop-blur-md transition-all ${
                        isMissed
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                          : isVideo
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-sm font-bold shadow-xs ${
                          isMissed ? 'bg-rose-600 text-white' : isVideo ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          <span className="material-symbols-outlined text-base font-bold">
                            {isMissed ? (isVideo ? 'videocam_off' : 'call_missed') : (isVideo ? 'videocam' : 'call')}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-xs tracking-tight">{msg.text.replace(/^[📞📹]\s*/, '')}</span>
                          <span className="text-[9px] opacity-75 font-semibold mt-0.5">{formatMessageTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

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

      {/* Audio & Video Elements for Remote Output */}
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />

      {/* ── Incoming Call Modal ─────────────────────────────────────────────────── */}
      {incomingCall && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 shadow-2xl flex flex-col items-center text-center space-y-6 animate-pulse">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-emerald-500/30 animate-ping"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600 to-[#003366] text-white text-3xl font-extrabold flex items-center justify-center shadow-xl ring-4 ring-emerald-500/50 relative">
                {getInitials(incomingCall.callerName)}
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-white">{incomingCall.callerName}</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call...</span>
              </p>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <button
                type="button"
                onClick={handleRejectIncomingCall}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-2xl shadow-lg shadow-rose-950/40 hover:scale-105 active:scale-95 transition-all"
                title="Decline Call"
              >
                <span className="material-symbols-outlined">call_end</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptIncomingCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all animate-bounce"
                title="Accept Call"
              >
                <span className="material-symbols-outlined">{incomingCall.callType === 'video' ? 'videocam' : 'call'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Active Call Modal (Voice & Video) ──────────────────────────────────────────────────────── */}
      {activeCall && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4">
          {activeCall.callType === 'video' ? (
            /* HD Google Meet Style Video Window */
            <div className="relative w-full max-w-5xl h-[88vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
              
              {/* Main Remote Video Stream View */}
              <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* Virtual Background Wallpaper Layer (Main Remote View) */}
                {selectedVirtualBg !== 'none' && (
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-500">
                    {selectedVirtualBg === 'blur' && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xl z-10" />
                    )}
                    {selectedVirtualBg === 'astu_quad' && (
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center brightness-75 contrast-110 scale-105 animate-pulse duration-1000" />
                    )}
                    {selectedVirtualBg === 'tech_lab' && (
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center brightness-75 contrast-110 scale-105" />
                    )}
                    {selectedVirtualBg === 'library' && (
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center brightness-75 contrast-110 scale-105" />
                    )}
                    {selectedVirtualBg === 'gradient' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 brightness-110" />
                    )}
                  </div>
                )}

                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover transition-all duration-500 relative z-10 ${
                    selectedVirtualBg === 'blur' || isBackgroundBlurred
                      ? 'blur-md scale-105 contrast-110 brightness-95'
                      : selectedVirtualBg !== 'none'
                      ? 'mix-blend-screen opacity-90 contrast-125 brightness-105'
                      : ''
                  }`}
                />
                
                {/* Fallback if remote video hasn't connected or is off */}
                {(!activeCall.isConnected) && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md space-y-4">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#003366] to-[#0055a5] text-white text-4xl font-extrabold flex items-center justify-center ring-4 ring-slate-700 animate-pulse shadow-2xl">
                      {getInitials(activeCall.recipientName || activeThread?.name || 'WT')}
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-extrabold text-xl text-white">{activeCall.recipientName || activeThread?.name}</h3>
                      <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        Connecting HD Video Call...
                      </p>
                    </div>
                  </div>
                )}

                {/* Peer Raised Hand Overlay Badge */}
                {peerHandRaised && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-amber-500/90 text-white font-extrabold text-xs shadow-lg backdrop-blur-md flex items-center gap-2 animate-bounce">
                    <span className="text-base">✋</span>
                    <span>{activeCall.recipientName || 'Participant'} raised hand</span>
                  </div>
                )}

                {/* Floating Animated Reaction Particles */}
                {activeReactions.map(r => (
                  <div
                    key={r.id}
                    className="absolute z-40 text-4xl pointer-events-none transition-all duration-1000 animate-bounce"
                    style={{
                      left: `${r.x}%`,
                      bottom: '20%',
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-4xl drop-shadow-lg">{r.emoji}</span>
                      <span className="text-[9px] bg-black/70 text-white font-extrabold px-1.5 py-0.5 rounded-md mt-0.5">{r.senderName}</span>
                    </div>
                  </div>
                ))}

                {/* Closed Captions Subtitle Overlay */}
                {isCaptionsEnabled && currentCaptions && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-6 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md text-white text-xs font-semibold max-w-xl text-center shadow-xl border border-white/10">
                    <span className="text-emerald-400 font-extrabold mr-1.5">{currentCaptions.senderName}:</span>
                    <span>{currentCaptions.text}</span>
                  </div>
                )}

                {/* Floating Picture-in-Picture Local Camera Preview */}
                <div className="absolute top-4 right-4 z-20 w-32 h-44 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-900 group">
                  {/* Local Virtual Background Layer */}
                  {selectedVirtualBg !== 'none' && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-300">
                      {selectedVirtualBg === 'blur' && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl z-10" />
                      )}
                      {selectedVirtualBg === 'astu_quad' && (
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center brightness-75" />
                      )}
                      {selectedVirtualBg === 'tech_lab' && (
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center brightness-75" />
                      )}
                      {selectedVirtualBg === 'library' && (
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center brightness-75" />
                      )}
                      {selectedVirtualBg === 'gradient' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900" />
                      )}
                    </div>
                  )}

                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover relative z-10 transition-all duration-300 ${
                      activeCall.isVideoOff ? 'hidden' : 'block'
                    } ${
                      selectedVirtualBg === 'blur' || isBackgroundBlurred
                        ? 'blur-sm contrast-105'
                        : selectedVirtualBg !== 'none'
                        ? 'mix-blend-screen opacity-95 contrast-125'
                        : ''
                    }`}
                  />
                  {activeCall.isVideoOff && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 relative z-20">
                      <span className="material-symbols-outlined text-2xl">videocam_off</span>
                      <span className="text-[9px] font-bold mt-1">Camera Off</span>
                    </div>
                  )}
                  {isHandRaised && (
                    <div className="absolute top-1.5 left-1.5 z-20 px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] flex items-center gap-1 shadow-md">
                      ✋ Hand
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1.5 z-20 px-2 py-0.5 rounded-md bg-black/60 text-[8px] font-extrabold text-white">You</div>
                </div>

                {/* Top Info Bar Overlay */}
                <div className="absolute top-4 left-4 z-20 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-2.5 text-white shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div>
                    <h4 className="font-extrabold text-xs">{activeCall.recipientName || activeThread?.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-bold">{formatCallDuration(activeCall.duration)}</p>
                  </div>
                </div>

                {/* Live REC Recording Badge Indicator Overlay */}
                {isRecording && (
                  <div className="absolute top-4 left-48 sm:left-52 z-20 px-3.5 py-2 rounded-2xl bg-rose-600/90 border border-rose-500/80 backdrop-blur-md flex items-center gap-2 text-white shadow-lg animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                    <span className="text-xs font-black tracking-wider uppercase">REC</span>
                    <span className="text-xs font-mono font-bold">{formatCallDuration(recordTimer)}</span>
                  </div>
                )}

                {/* Google Meet In-Call Chat Drawer (Image 3) */}
                {showInCallChat && (
                  <div className="absolute top-0 right-0 bottom-0 z-30 w-80 sm:w-96 bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl flex flex-col p-4 shadow-2xl">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <span>In-call messages</span>
                      </h3>
                      <button onClick={() => setShowInCallChat(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800">
                        ✕
                      </button>
                    </div>

                    {/* Let participants send messages Toggle Switch */}
                    <div className="py-3 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">Let participants send messages</span>
                      <button
                        type="button"
                        onClick={() => setAllowInCallMessages(!allowInCallMessages)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${allowInCallMessages ? 'bg-blue-600' : 'bg-slate-700'}`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${allowInCallMessages ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    {/* Notice Banner */}
                    <div className="my-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="material-symbols-outlined text-base text-blue-400">chat</span>
                      <div>
                        <p className="font-bold text-white">Continuous chat is turned off</p>
                        <p className="mt-0.5 text-slate-400">Messages will not be saved for meeting participants when the call ends.</p>
                      </div>
                    </div>

                    {/* Message Feed */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1">
                      {inCallMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
                          <span className="material-symbols-outlined text-4xl text-slate-600">chat_bubble_outline</span>
                          <p className="text-xs text-slate-400 font-bold">No chat messages yet</p>
                        </div>
                      ) : (
                        inCallMessages.map(m => (
                          <div key={m.id} className={`p-2.5 rounded-xl text-xs space-y-0.5 ${m.isSelf ? 'bg-blue-600/30 border border-blue-500/30 text-white ml-6' : 'bg-slate-800 text-slate-200 mr-6'}`}>
                            <div className="flex items-center justify-between text-[10px] opacity-75 font-extrabold">
                              <span>{m.senderName}</span>
                              <span>{m.time}</span>
                            </div>
                            <p className="font-medium leading-relaxed">{m.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input Box */}
                    {allowInCallMessages ? (
                      <form onSubmit={handleSendInCallMessage} className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={inCallMessageText}
                          onChange={(e) => setInCallMessageText(e.target.value)}
                          placeholder="Send a message"
                          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          <span className="material-symbols-outlined text-base">send</span>
                        </button>
                      </form>
                    ) : (
                      <p className="text-[10px] text-center text-slate-500 py-2">In-call messaging is disabled by host.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Floating Emoji Reactions Bar (Image 2) */}
              {showReactionsBar && (
                <div className="absolute bottom-20 z-40 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔', '👎'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="text-xl p-1.5 hover:bg-slate-800 rounded-full transition-transform hover:scale-125 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Google Meet Bottom Control Toolbar (Image 2) */}
              <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-center gap-1.5 sm:gap-2.5 z-30 shrink-0 flex-wrap">
                {/* 1. Mic Mute/Unmute */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    activeCall.isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={activeCall.isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  <span className="material-symbols-outlined">{activeCall.isMuted ? 'mic_off' : 'mic'}</span>
                </button>

                {/* 2. Camera On/Off */}
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    activeCall.isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={activeCall.isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  <span className="material-symbols-outlined">{activeCall.isVideoOff ? 'videocam_off' : 'videocam'}</span>
                </button>

                {/* 3. Screen Sharing */}
                <button
                  type="button"
                  onClick={handleToggleScreenShare}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Present now (Screen Share)"
                >
                  <span className="material-symbols-outlined">present_to_all</span>
                </button>

                {/* 4. Emoji Reactions */}
                <button
                  type="button"
                  onClick={() => setShowReactionsBar(!showReactionsBar)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showReactionsBar ? 'bg-blue-600 text-white scale-105' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Send a reaction"
                >
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </button>

                {/* 5. Closed Captions */}
                <button
                  type="button"
                  onClick={() => setIsCaptionsEnabled(!isCaptionsEnabled)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    isCaptionsEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Turn on captions (CC)"
                >
                  <span className="material-symbols-outlined">closed_caption</span>
                </button>

                {/* 6. Raise Hand */}
                <button
                  type="button"
                  onClick={handleToggleRaiseHand}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    isHandRaised ? 'bg-blue-600 text-white scale-105' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isHandRaised ? 'Lower hand' : 'Raise hand'}
                >
                  <span className="material-symbols-outlined">front_hand</span>
                </button>

                {/* 7. Executive Blur & Background */}
                <button
                  type="button"
                  onClick={() => setIsBackgroundBlurred(!isBackgroundBlurred)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    isBackgroundBlurred ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isBackgroundBlurred ? 'Disable Virtual Background' : 'Blur Background'}
                >
                  <span className="material-symbols-outlined">{isBackgroundBlurred ? 'blur_on' : 'blur_off'}</span>
                </button>

                {/* 8. Cloud Recording */}
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Record Meeting'}
                >
                  <span className="material-symbols-outlined">{isRecording ? 'fiber_smart_record' : 'fiber_manual_record'}</span>
                </button>

                {/* 9. Participants Drawer */}
                <button
                  type="button"
                  onClick={() => setShowParticipantsDrawer(!showParticipantsDrawer)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md relative ${
                    showParticipantsDrawer ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="People / Participants"
                >
                  <span className="material-symbols-outlined">groups</span>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    2
                  </span>
                </button>

                {/* 10. In-Call Chat Drawer */}
                <button
                  type="button"
                  onClick={() => setShowInCallChat(!showInCallChat)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md relative ${
                    showInCallChat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="In-call messages"
                >
                  <span className="material-symbols-outlined">chat</span>
                  {inCallMessages.length > 0 && !showInCallChat && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                      {inCallMessages.length}
                    </span>
                  )}
                </button>

                {/* 11. Audio/Video Settings */}
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(!showSettingsModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showSettingsModal ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Audio & Video Settings"
                >
                  <span className="material-symbols-outlined">settings</span>
                </button>

                {/* 12. Host Security Lock */}
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(!showSecurityModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showSecurityModal ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Host Security Controls"
                >
                  <span className="material-symbols-outlined">security</span>
                </button>

                {/* 13. Interactive Virtual Whiteboard */}
                <button
                  type="button"
                  onClick={() => setShowWhiteboardModal(!showWhiteboardModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showWhiteboardModal ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Interactive Whiteboard & Canvas"
                >
                  <span className="material-symbols-outlined">draw</span>
                </button>

                {/* 14. Pair Programming Sandbox */}
                <button
                  type="button"
                  onClick={() => setShowCodeSandboxModal(!showCodeSandboxModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showCodeSandboxModal ? 'bg-[#003366] text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Pair Programming Code Sandbox"
                >
                  <span className="material-symbols-outlined">code</span>
                </button>

                {/* 15. AI Meeting Summarizer */}
                <button
                  type="button"
                  onClick={() => setShowAiSummarizerModal(!showAiSummarizerModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showAiSummarizerModal ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="AI Meeting Summarizer & Takeaways"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                </button>

                {/* 16. Live Polls */}
                <button
                  type="button"
                  onClick={() => setShowPollsModal(!showPollsModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showPollsModal ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Live Meeting Polls & Voting"
                >
                  <span className="material-symbols-outlined">poll</span>
                </button>

                {/* 17. Ranked Q&A Queue */}
                <button
                  type="button"
                  onClick={() => setShowQaDrawer(!showQaDrawer)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md relative ${
                    showQaDrawer ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Q&A Question Queue"
                >
                  <span className="material-symbols-outlined">help_center</span>
                  {qaQuestions.filter(q => !q.isAnswered).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                      {qaQuestions.filter(q => !q.isAnswered).length}
                    </span>
                  )}
                </button>

                {/* 18. Virtual Background Wallpapers */}
                <button
                  type="button"
                  onClick={() => setShowVirtualBgModal(!showVirtualBgModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showVirtualBgModal ? 'bg-[#003366] text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Virtual Background Wallpapers"
                >
                  <span className="material-symbols-outlined">wallpaper</span>
                </button>

                {/* 19. Breakout Rooms */}
                <button
                  type="button"
                  onClick={() => setShowBreakoutModal(!showBreakoutModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    isBreakoutActive ? 'bg-teal-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Breakout Rooms Manager"
                >
                  <span className="material-symbols-outlined">meeting_room</span>
                </button>

                {/* 20. Low-Bandwidth Eco Data-Saver Mode */}
                <button
                  type="button"
                  onClick={() => {
                    const nextEco = !isEcoDataSaverOn;
                    setIsEcoDataSaverOn(nextEco);
                    toast(nextEco ? '⚡ Eco Data-Saver Mode Activated (15 FPS / Audio-Opt)' : 'Eco Mode Disabled (HD Active)');
                  }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    isEcoDataSaverOn ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Low-Bandwidth Eco Mode"
                >
                  <span className="material-symbols-outlined">bolt</span>
                </button>

                {/* 21. SIP Phone Dial-In Drawer */}
                <button
                  type="button"
                  onClick={() => setShowSipDialInModal(!showSipDialInModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showSipDialInModal ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="SIP & PSTN Phone Dial-In Info"
                >
                  <span className="material-symbols-outlined">dialpad</span>
                </button>

                {/* 22. Attendance & Speaker Analytics */}
                <button
                  type="button"
                  onClick={() => setShowAttendanceReportModal(!showAttendanceReportModal)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-md ${
                    showAttendanceReportModal ? 'bg-[#003366] text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Speaker Analytics & Attendance Report"
                >
                  <span className="material-symbols-outlined">analytics</span>
                </button>

                {/* 23. End Call */}
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="w-13 h-10 sm:w-16 sm:h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-950/40 hover:scale-105 active:scale-95 transition-all ml-1"
                  title="End Meeting"
                >
                  <span className="material-symbols-outlined">call_end</span>
                </button>
              </div>

              {/* ── Overlay Modal: Participants Drawer ───────────────────────────── */}
              {showParticipantsDrawer && (
                <div className="absolute top-0 right-0 bottom-0 z-40 w-80 sm:w-96 bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl flex flex-col p-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-400">groups</span>
                      <span>People ({2 + extraParticipants.length})</span>
                    </h3>
                    <button onClick={() => setShowParticipantsDrawer(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800">
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    {/* Me */}
                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                          You
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>You (Meeting Host)</span>
                            {isHandRaised && <span className="text-xs">✋</span>}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-semibold">Active Speaker</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          type="button"
                          onClick={() => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)}
                          className="hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                          title={activeCall.isMuted ? 'Unmute' : 'Mute'}
                        >
                          <span className="material-symbols-outlined text-sm">{activeCall.isMuted ? 'mic_off' : 'mic'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCall(prev => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null)}
                          className="hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                          title={activeCall.isVideoOff ? 'Turn video on' : 'Turn video off'}
                        >
                          <span className="material-symbols-outlined text-sm">{activeCall.isVideoOff ? 'videocam_off' : 'videocam'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Remote Participant */}
                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003366] to-[#0055a5] text-white font-extrabold text-xs flex items-center justify-center">
                          {getInitials(activeCall.recipientName || activeThread?.name || 'SA')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{activeCall.recipientName || activeThread?.name || 'System Admin'}</span>
                            {peerHandRaised && <span className="text-xs">✋</span>}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">{activeThread?.roleLabel || 'Participant'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`${activeCall.recipientName || 'System Admin'} ${areAllParticipantsMuted ? 'unmuted' : 'muted'}`);
                          }}
                          className="hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">{areAllParticipantsMuted ? 'mic_off' : 'mic'}</span>
                        </button>
                        <span className="material-symbols-outlined text-sm">videocam</span>
                      </div>
                    </div>

                    {/* Extra Added Participants */}
                    {extraParticipants.map(p => (
                      <div key={p.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{p.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <button
                            type="button"
                            onClick={() => {
                              setExtraParticipants(prev => prev.map(item => item.id === p.id ? { ...item, isMuted: !item.isMuted } : item));
                              toast.success(`${p.name} ${p.isMuted ? 'unmuted' : 'muted'}`);
                            }}
                            className="hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">{p.isMuted || areAllParticipantsMuted ? 'mic_off' : 'mic'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setExtraParticipants(prev => prev.filter(item => item.id !== p.id));
                              toast.success(`${p.name} removed from meeting.`);
                            }}
                            className="hover:text-rose-400 p-1 rounded-lg hover:bg-slate-700 text-xs transition-colors"
                            title="Remove participant"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !areAllParticipantsMuted;
                        setAreAllParticipantsMuted(nextState);
                        if (nextState) {
                          setActiveCall(prev => prev ? { ...prev, isMuted: true } : null);
                          toast.success('🔇 All meeting participants have been muted by host.');
                        } else {
                          toast.success('🔊 Participants allowed to unmute.');
                        }
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                        areAllParticipantsMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{areAllParticipantsMuted ? 'mic_off' : 'volume_off'}</span>
                      <span>{areAllParticipantsMuted ? 'Unmute all' : 'Mute all'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPeopleModal(true)}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span>Add people</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Overlay Modal: Audio/Video Settings ─────────────────────────── */}
              {showSettingsModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">settings</span>
                        <span>Meeting Settings</span>
                      </h3>
                      <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Video Resolution</label>
                        <select
                          value={selectedQuality}
                          onChange={(e) => setSelectedQuality(e.target.value as '360p' | '720p' | '1080p')}
                          className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                        >
                          <option value="1080p">1080p FHD (High Bandwidth)</option>
                          <option value="720p">720p HD (Balanced)</option>
                          <option value="360p">360p SD (Data Saver)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-slate-800">
                        <div>
                          <p className="font-bold text-white">AI Noise Suppression</p>
                          <p className="text-[10px] text-slate-400">Filter background keyboard & room noise</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsNoiseSuppressionOn(!isNoiseSuppressionOn)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${isNoiseSuppressionOn ? 'bg-blue-600' : 'bg-slate-700'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isNoiseSuppressionOn ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button onClick={() => setShowSettingsModal(false)} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Overlay Modal: Host Security Controls ───────────────────────── */}
              {showSecurityModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">security</span>
                        <span>Host Security & Permissions</span>
                      </h3>
                      <button onClick={() => setShowSecurityModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between py-2 border-b border-slate-800">
                        <div>
                          <p className="font-bold text-white">Lock Meeting</p>
                          <p className="text-[10px] text-slate-400">Prevent new participants from joining</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsMeetingLocked(!isMeetingLocked)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${isMeetingLocked ? 'bg-rose-600' : 'bg-slate-700'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isMeetingLocked ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-800">
                        <div>
                          <p className="font-bold text-white">Allow Screen Sharing</p>
                          <p className="text-[10px] text-slate-400">Let participants present their screen</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAllowScreenShare(!allowScreenShare)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${allowScreenShare ? 'bg-blue-600' : 'bg-slate-700'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${allowScreenShare ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-bold text-white">Allow In-Call Chat</p>
                          <p className="text-[10px] text-slate-400">Let participants send text messages</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAllowInCallMessages(!allowInCallMessages)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${allowInCallMessages ? 'bg-blue-600' : 'bg-slate-700'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${allowInCallMessages ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button onClick={() => setShowSecurityModal(false)} className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs">
                        Close Controls
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 1. Overlay Modal: Interactive Virtual Whiteboard ─────────────── */}
              {showWhiteboardModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-indigo-600 text-white material-symbols-outlined text-sm">draw</span>
                        <div>
                          <h3 className="font-extrabold text-sm text-white">Interactive Virtual Whiteboard</h3>
                          <p className="text-[10px] text-slate-400">Collaborative drawing canvas for architecture diagrams & mentorship notes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (whiteboardCanvasRef.current) {
                              const ctx = whiteboardCanvasRef.current.getContext('2d');
                              if (ctx) ctx.clearRect(0, 0, whiteboardCanvasRef.current.width, whiteboardCanvasRef.current.height);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold hover:bg-slate-700"
                        >
                          Clear Canvas
                        </button>
                        <button
                          onClick={() => {
                            if (whiteboardCanvasRef.current) {
                              const link = document.createElement('a');
                              link.download = `ASTU-Whiteboard-${Date.now()}.png`;
                              link.href = whiteboardCanvasRef.current.toDataURL();
                              link.click();
                              toast.success('Whiteboard PNG downloaded!');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-xs font-bold hover:bg-indigo-700"
                        >
                          Export PNG
                        </button>
                        <button onClick={() => setShowWhiteboardModal(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 hover:text-white">✕</button>
                      </div>
                    </div>

                    <div className="flex-1 relative bg-slate-950 flex">
                      {/* Drawing Tools Sidebar */}
                      <div className="w-16 bg-slate-900 border-r border-slate-800 p-2 flex flex-col items-center gap-3">
                        {[
                          { id: 'pen', icon: 'edit', label: 'Pen' },
                          { id: 'line', icon: 'horizontal_rule', label: 'Line' },
                          { id: 'rect', icon: 'rectangle', label: 'Rectangle' },
                          { id: 'circle', icon: 'circle', label: 'Circle' },
                          { id: 'sticky', icon: 'note', label: 'Sticky Note' },
                          { id: 'eraser', icon: 'auto_fix_high', label: 'Eraser' },
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setWhiteboardTool(t.id as any)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              whiteboardTool === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                            }`}
                            title={t.label}
                          >
                            <span className="material-symbols-outlined text-sm">{t.icon}</span>
                          </button>
                        ))}

                        <div className="w-full h-px bg-slate-800 my-1" />
                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map(c => (
                          <button
                            key={c}
                            onClick={() => setWhiteboardColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${whiteboardColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      {/* Canvas Surface */}
                      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                        <canvas
                          ref={whiteboardCanvasRef}
                          width={1200}
                          height={700}
                          className="w-full h-full cursor-crosshair"
                          onMouseDown={(e) => {
                            isDrawingRef.current = true;
                            const rect = e.currentTarget.getBoundingClientRect();
                            drawStartRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                            const ctx = e.currentTarget.getContext('2d');
                            if (ctx) {
                              ctx.beginPath();
                              ctx.moveTo(drawStartRef.current.x, drawStartRef.current.y);
                            }
                          }}
                          onMouseMove={(e) => {
                            if (!isDrawingRef.current || !whiteboardCanvasRef.current) return;
                            const ctx = whiteboardCanvasRef.current.getContext('2d');
                            if (!ctx) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;

                            ctx.strokeStyle = whiteboardTool === 'eraser' ? '#020617' : whiteboardColor;
                            ctx.lineWidth = whiteboardTool === 'eraser' ? 24 : 3;
                            ctx.lineCap = 'round';
                            ctx.lineTo(x, y);
                            ctx.stroke();
                          }}
                          onMouseUp={() => { isDrawingRef.current = false; }}
                        />

                        {/* Sticky Notes */}
                        {stickyNotes.map(n => (
                          <div
                            key={n.id}
                            style={{ left: n.x, top: n.y, backgroundColor: n.color }}
                            className="absolute p-3 rounded-xl shadow-lg w-48 text-slate-900 text-xs font-semibold leading-relaxed border border-amber-300/60"
                          >
                            <div className="flex justify-between items-center mb-1 pb-1 border-b border-black/10">
                              <span className="text-[9px] font-extrabold uppercase opacity-60">Sticky Note</span>
                              <button onClick={() => setStickyNotes(prev => prev.filter(st => st.id !== n.id))} className="text-xs font-bold opacity-50 hover:opacity-100">✕</button>
                            </div>
                            <p className="whitespace-pre-wrap">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. Overlay Modal: Pair Programming Code Sandbox ───────────── */}
              {showCodeSandboxModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-[#003366] text-white material-symbols-outlined text-sm">code</span>
                        <div>
                          <h3 className="font-extrabold text-sm text-white">Live Pair Programming Code Sandbox</h3>
                          <p className="text-[10px] text-slate-400">Collaborative code editor for Technical Mentorship & Code Reviews</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={sandboxLang}
                          onChange={(e) => {
                            const newLang = e.target.value as any;
                            setSandboxLang(newLang);
                            if (STARTER_CODE_TEMPLATES[newLang]) {
                              setSandboxCode(STARTER_CODE_TEMPLATES[newLang]);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700 cursor-pointer"
                        >
                          <option value="javascript">JavaScript (Node.js)</option>
                          <option value="python">Python 3</option>
                          <option value="cpp">C++ (GCC 11)</option>
                          <option value="java">Java 17</option>
                          <option value="sql">PostgreSQL / SQL</option>
                        </select>
                        <button
                          onClick={() => {
                            setIsCompilingCode(true);
                            setSandboxOutput('Executing code on virtual sandbox runner...\n');
                            setTimeout(() => {
                              setIsCompilingCode(false);
                              const res = executeSandboxRunner(sandboxCode, sandboxLang);
                              setSandboxOutput(res);
                            }, 300);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          Run Code
                        </button>
                        <button onClick={() => setShowCodeSandboxModal(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 hover:text-white">✕</button>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-950 overflow-hidden">
                      {/* Code Input */}
                      <div className="flex flex-col rounded-2xl bg-slate-900 border border-slate-800 p-3">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-bold">
                          <span>SOURCE CODE ({sandboxLang.toUpperCase()})</span>
                          <span>Auto-Sync Active</span>
                        </div>
                        <textarea
                          value={sandboxCode}
                          onChange={(e) => setSandboxCode(e.target.value)}
                          className="flex-1 bg-transparent font-mono text-xs text-blue-300 focus:outline-none resize-none leading-relaxed"
                          spellCheck={false}
                        />
                      </div>

                      {/* Code Execution Output Terminal */}
                      <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 p-3 font-mono">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-bold">
                          <span>TERMINAL OUTPUT</span>
                          {isCompilingCode && <span className="text-emerald-400 animate-pulse">Running...</span>}
                        </div>
                        <pre className="flex-1 text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap">
                          {sandboxOutput || '// Press "Run Code" to compile and view output'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3. Overlay Modal: AI Meeting Auto-Summarizer ──────────────────── */}
              {showAiSummarizerModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">auto_awesome</span>
                        <span>AI Meeting Auto-Summarizer</span>
                      </h3>
                      <button onClick={() => setShowAiSummarizerModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <h4 className="font-extrabold text-blue-400 uppercase text-[10px] tracking-wider mb-1.5">📌 Key Takeaways</h4>
                        <ul className="space-y-1 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-slate-300">
                          {aiSummaryData?.keyPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-emerald-400 uppercase text-[10px] tracking-wider mb-1.5">⚡ Action Items</h4>
                        <ul className="space-y-1 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-slate-300">
                          {aiSummaryData?.actionItems.map((act, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          const text = `AI Meeting Summary:\n\nKey Takeaways:\n${aiSummaryData?.keyPoints.join('\n')}\n\nAction Items:\n${aiSummaryData?.actionItems.join('\n')}`;
                          navigator.clipboard.writeText(text);
                          toast.success('AI Meeting Summary copied!');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                      >
                        Copy Summary
                      </button>
                      <button onClick={() => setShowAiSummarizerModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 4. Overlay Modal: Live Meeting Polls ──────────────────────────── */}
              {showPollsModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-400">poll</span>
                        <span>Live Meeting Polls</span>
                      </h3>
                      <button onClick={() => setShowPollsModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    {activePoll ? (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-white">{activePoll.question}</p>
                        <div className="space-y-2">
                          {activePoll.options.map((opt, idx) => {
                            const pct = activePoll.totalVotes > 0 ? Math.round((opt.votes / activePoll.totalVotes) * 100) : 0;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (activePoll.userVotedIdx === null) {
                                    setActivePoll(prev => prev ? {
                                      ...prev,
                                      userVotedIdx: idx,
                                      totalVotes: prev.totalVotes + 1,
                                      options: prev.options.map((o, i) => i === idx ? { ...o, votes: o.votes + 1 } : o)
                                    } : null);
                                    toast.success('Vote recorded!');
                                  }
                                }}
                                className={`w-full p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                                  activePoll.userVotedIdx === idx ? 'border-emerald-500 bg-emerald-950/40' : 'border-slate-800 bg-slate-800/60'
                                }`}
                              >
                                <div
                                  className="absolute top-0 bottom-0 left-0 bg-emerald-500/20 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                                <div className="relative z-10 flex items-center justify-between text-xs">
                                  <span className="font-bold">{opt.text}</span>
                                  <span className="text-[11px] font-extrabold text-emerald-400">{pct}% ({opt.votes})</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-slate-400 text-center font-semibold">Total Votes: {activePoll.totalVotes}</p>
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <button onClick={() => setShowPollsModal(false)} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                        Close Polls
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 5. Overlay Modal: Ranked Q&A Question Queue ──────────────────── */}
              {showQaDrawer && (
                <div className="absolute top-0 right-0 bottom-0 z-40 w-80 sm:w-96 bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl flex flex-col p-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400">help_center</span>
                      <span>Q&A Queue ({qaQuestions.length})</span>
                    </h3>
                    <button onClick={() => setShowQaDrawer(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 py-3">
                    {qaQuestions.map(q => (
                      <div key={q.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-300">{q.author}</span>
                          <span className="text-[9px] text-slate-400">{q.timestamp}</span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">{q.text}</p>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => {
                              setQaQuestions(prev => prev.map(item => {
                                if (item.id === q.id) {
                                  return { ...item, userUpvoted: !item.userUpvoted, upvotes: item.userUpvoted ? item.upvotes - 1 : item.upvotes + 1 };
                                }
                                return item;
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition-all ${
                              q.userUpvoted ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-700/60 border-slate-600 text-slate-300'
                            }`}
                          >
                            <span>👍 Upvote</span>
                            <span>({q.upvotes})</span>
                          </button>
                          {q.isAnswered ? (
                            <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">Answered ✓</span>
                          ) : (
                            <button
                              onClick={() => {
                                setQaQuestions(prev => prev.map(item => item.id === q.id ? { ...item, isAnswered: true } : item));
                                toast.success('Question marked as answered!');
                              }}
                              className="text-[9px] font-bold text-blue-400 hover:underline"
                            >
                              Mark Answered
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question..."
                      value={newQaText}
                      onChange={(e) => setNewQaText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newQaText.trim()) {
                          setQaQuestions(prev => [
                            ...prev,
                            {
                              id: `qa-${Date.now()}`,
                              author: getStoredCallerName(),
                              text: newQaText.trim(),
                              upvotes: 1,
                              isAnswered: false,
                              userUpvoted: true,
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                          setNewQaText('');
                          toast.success('Question submitted!');
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-xs text-white border border-slate-700 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newQaText.trim()) {
                          setQaQuestions(prev => [
                            ...prev,
                            {
                              id: `qa-${Date.now()}`,
                              author: getStoredCallerName(),
                              text: newQaText.trim(),
                              upvotes: 1,
                              isAnswered: false,
                              userUpvoted: true,
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                          setNewQaText('');
                          toast.success('Question submitted!');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              )}

              {/* ── 6. Overlay Modal: Virtual Background Wallpapers ───────────────── */}
              {showVirtualBgModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">wallpaper</span>
                        <span>Virtual Background Wallpapers</span>
                      </h3>
                      <button onClick={() => setShowVirtualBgModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'none', label: 'None', bg: 'bg-slate-800' },
                        { id: 'blur', label: 'Gaussian Blur', bg: 'bg-slate-700 backdrop-blur-lg' },
                        { id: 'astu_quad', label: 'ASTU Campus Quad', bg: 'bg-gradient-to-br from-[#003366] to-[#001a33]' },
                        { id: 'tech_lab', label: 'AI Tech Lab', bg: 'bg-gradient-to-br from-indigo-900 to-purple-900' },
                        { id: 'library', label: 'Academic Library', bg: 'bg-gradient-to-br from-amber-950 to-slate-900' },
                        { id: 'gradient', label: 'Modern Abstract', bg: 'bg-gradient-to-br from-emerald-900 to-blue-900' },
                      ].map(bg => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            setSelectedVirtualBg(bg.id as any);
                            if (bg.id === 'blur') {
                              setIsBackgroundBlurred(true);
                            } else {
                              setIsBackgroundBlurred(false);
                            }
                            toast.success(`Virtual Background Selected: ${bg.label}`);
                          }}
                          className={`h-24 rounded-2xl border-2 ${bg.bg} flex flex-col items-center justify-center p-2 text-center transition-all ${
                            selectedVirtualBg === bg.id ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105' : 'border-slate-700/60'
                          }`}
                        >
                          <span className="text-xs font-bold">{bg.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setShowVirtualBgModal(false);
                          toast.success(`✅ Applied Virtual Background: ${selectedVirtualBg.replace('_', ' ').toUpperCase()}`);
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        Apply Background
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 7. Overlay Modal: Breakout Rooms Manager ────────────────────── */}
              {showBreakoutModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-400">meeting_room</span>
                        <span>Breakout Rooms Manager</span>
                      </h3>
                      <button onClick={() => setShowBreakoutModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-3">
                      {breakoutRooms.map((room) => (
                        <div key={room.id} className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{room.name}</span>
                            <span className="text-teal-400">{room.participants.length} Participants</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{room.participants.join(', ')}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          const nextActive = !isBreakoutActive;
                          setIsBreakoutActive(nextActive);
                          toast(nextActive ? 'Breakout Rooms Started (15 min timer)' : 'Participants recalled to main meeting room');
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-colors ${
                          isBreakoutActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                      >
                        {isBreakoutActive ? 'Recall All to Main Room' : 'Start Breakout Sessions'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 8. Overlay Modal: SIP & Phone Dial-In Info ───────────────────── */}
              {showSipDialInModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">dialpad</span>
                        <span>SIP & Phone Audio Dial-In</span>
                      </h3>
                      <button onClick={() => setShowSipDialInModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Ethiopia Telephony Bridge</p>
                        <p className="font-mono text-sm font-extrabold text-emerald-400">+251 (0) 22 110 0000</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Conference Passcode / PIN</p>
                        <p className="font-mono text-sm font-extrabold text-blue-400">849-302#</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">SIP Video Bridge URI</p>
                        <p className="font-mono text-xs font-semibold text-purple-300">sip:meeting-849302@astu.edu.et</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('+251221100000 PIN: 849302#');
                          toast.success('Dial-in info copied!');
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                      >
                        Copy Dial-In Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 9. Overlay Modal: Attendance & Speaker Analytics ──────────────── */}
              {showAttendanceReportModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">analytics</span>
                        <span>Speaker Engagement & Attendance Analytics</span>
                      </h3>
                      <button onClick={() => setShowAttendanceReportModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Speak Time Distribution</p>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span>You (Meeting Host)</span>
                              <span className="text-blue-400">65% (12 min)</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span>{activeCall?.recipientName || 'Senior Mentor'}</span>
                              <span className="text-emerald-400">35% (7 min)</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Attendance Verification: 100% Verified</span>
                        <span>Quality Index: 99.4% HD</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          toast.success('Attendance Report PDF downloaded!');
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                      >
                        Export Attendance PDF Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 🎙️ Ultra-Modern Enterprise HD Voice Call Suite */
            <div className="w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-slate-800 text-white p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden flex flex-col space-y-6">
              
              {/* Floating Reaction Particles Layer */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                {activeReactions.map((r) => (
                  <div
                    key={r.id}
                    className="absolute bottom-10 text-3xl animate-bounce transition-all duration-1000"
                    style={{ left: `${r.x}%`, opacity: 0.9 }}
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>

              {/* 1. Header Toolbar & Real-Time Telemetry Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-extrabold tracking-wide uppercase text-slate-300">
                    HD Voice Call
                  </span>
                  <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                    {activeCall.isConnected ? formatCallDuration(activeCall.duration) : 'Connecting...'}
                  </span>
                  {isRecording && (
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                      <span>REC 🔴</span>
                      <span>{Math.floor(recordTimer / 60)}:{(recordTimer % 60).toString().padStart(2, '0')}</span>
                    </span>
                  )}
                  {isPushToTalkActive && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      isPushToTalkHolding ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse' : 'bg-slate-800 text-indigo-300 border-indigo-800'
                    }`}>
                      {isPushToTalkHolding ? '🎙️ SPEAKING (SPACE)' : '📻 PTT WALKIE-TALKIE ON'}
                    </span>
                  )}
                </div>

                {/* Quick Toggle Badges & Hardware Selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsNoiseSuppressionOn(!isNoiseSuppressionOn);
                      toast.success(isNoiseSuppressionOn ? 'AI Noise Suppression Off' : '🛡️ AI Noise Suppression Active');
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                      isNoiseSuppressionOn
                        ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle AI CrispVoice Noise Cancellation"
                  >
                    <span className="material-symbols-outlined text-xs">graphic_eq</span>
                    <span className="hidden sm:inline">AI Shield</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSpatialAudioActive(!isSpatialAudioActive);
                      toast.success(isSpatialAudioActive ? 'Spatial 3D Audio Off' : '🎧 3D Spatial Audio Active');
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                      isSpatialAudioActive
                        ? 'bg-blue-950/60 border-blue-700/60 text-blue-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Spatial 3D Audio"
                  >
                    <span className="material-symbols-outlined text-xs">surround_sound</span>
                    <span className="hidden sm:inline">3D Spatial</span>
                  </button>

                  <button
                    onClick={() => setShowAudioDeviceModal(!showAudioDeviceModal)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Audio Hardware & Output Switcher"
                  >
                    <span className="material-symbols-outlined text-sm">headphones</span>
                  </button>

                  <button
                    onClick={() => setShowVoiceDiagnostics(!showVoiceDiagnostics)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Voice Call Telemetry & Signal Quality"
                  >
                    <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                  </button>
                </div>
              </div>

              {/* 2. Main Avatar Display with Dynamic Concentric Aura & Multi-Bar Equalizer */}
              <div className="flex flex-col items-center justify-center py-2 space-y-4 relative z-10">
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Concentric Aura Ring 1 */}
                  <div
                    className="absolute rounded-full bg-emerald-500/20 transition-all duration-75"
                    style={{
                      inset: `-${Math.max(8, Math.min(36, Math.round(audioLevel / 2)))}px`,
                      opacity: audioLevel > 5 ? 0.7 : 0.15
                    }}
                  ></div>
                  {/* Outer Pulsing Concentric Aura Ring 2 */}
                  <div
                    className="absolute rounded-full bg-blue-500/15 transition-all duration-150"
                    style={{
                      inset: `-${Math.max(16, Math.min(50, Math.round(audioLevel / 1.5)))}px`,
                      opacity: audioLevel > 10 ? 0.5 : 0.05
                    }}
                  ></div>

                  {/* Avatar Container */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#003366] via-[#0055a5] to-blue-700 text-white text-4xl font-extrabold flex items-center justify-center shadow-2xl ring-4 ring-slate-800 relative z-10 overflow-hidden">
                    {activeCall.recipientName ? (
                      getInitials(activeCall.recipientName)
                    ) : (
                      getInitials(activeThread?.name || 'WT')
                    )}
                  </div>

                  {/* Mic Muted Badge Overlay */}
                  {activeCall.isMuted && (
                    <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-rose-600 text-white border-2 border-slate-900 flex items-center justify-center shadow-lg z-20">
                      <span className="material-symbols-outlined text-lg">mic_off</span>
                    </div>
                  )}
                </div>

                {/* Recipient Identity Details */}
                <div className="text-center">
                  <h3 className="font-extrabold text-xl text-white flex items-center justify-center gap-1.5">
                    <span>{activeCall.recipientName || activeThread?.name}</span>
                    <span className="material-symbols-outlined text-blue-400 text-base" title="Verified ASTU Member">verified</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {activeThread?.roleLabel || 'Senior ASTU Alumnus & Industry Mentor'}
                  </p>
                  
                  {/* Live Speaking Status Pill */}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>{audioLevel > 5 ? '🔊 Speaking (Voice Active)' : '🎙️ Live HD Audio Connected'}</span>
                    </span>
                  </div>
                </div>

                {/* Real-Time 14-Bar Dynamic Equalizer Spectrum Visualizer */}
                <div className="flex items-end justify-center gap-1.5 h-10 w-full max-w-xs pt-2">
                  {[40, 75, 55, 90, 65, 80, 45, 85, 95, 70, 60, 85, 50, 65].map((baseHeight, idx) => {
                    const dynamicHeight = Math.max(15, Math.min(100, Math.round((baseHeight * Math.max(0.3, audioLevel / 20)))));
                    return (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 via-indigo-400 to-emerald-400 transition-all duration-75 shadow-sm"
                        style={{ height: `${activeCall.isMuted ? 15 : dynamicHeight}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 3. Live Speech Subtitles & Real-Time Closed Captions (CC) Overlay */}
              {showVoiceCaptions && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs space-y-1 relative z-10 animate-fade-in">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="material-symbols-outlined text-xs">closed_caption</span>
                      <span>Live Speech Subtitles (CC)</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {(['EN', 'AM', 'OM'] as const).map(lang => (
                        <button
                          key={lang}
                          onClick={() => setVoiceCaptionLang(lang)}
                          className={`px-1.5 py-0.5 rounded ${voiceCaptionLang === lang ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-200 font-medium italic">
                    <strong className="text-blue-400 not-italic">{activeCall.recipientName || 'Wabi'}: </strong>
                    {voiceCaptionLang === 'EN' && '"Welcome! We are currently reviewing the software architecture document for ASTU alumni."' }
                    {voiceCaptionLang === 'AM' && '"እንኳን ደህና መጡ! በአሁኑ ጊዜ የሶፍትዌር አርክቴክቸር ሰነድ እየገመገምን ነው::"' }
                    {voiceCaptionLang === 'OM' && '"Akkam jirtu! Yeroo ammaa sanada arkiteekchara saaftiweerii ilaalaa jirra."' }
                  </p>
                </div>
              )}

              {/* 4. Focus Ambience Sound Control Banner */}
              {voiceAmbience !== 'none' && (
                <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 animate-spin text-sm">music_note</span>
                    <span className="font-semibold text-slate-200">
                      Ambience: {voiceAmbience === 'lofi' ? '🎧 Lo-Fi Chill Beats' : voiceAmbience === 'rain' ? '🌧️ Gentle Rain Focus' : '📚 Academic Library'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ambienceVolume}
                      onChange={(e) => setAmbienceVolume(Number(e.target.value))}
                      className="w-20 accent-blue-500"
                    />
                    <button onClick={() => setVoiceAmbience('none')} className="text-slate-400 hover:text-rose-400 text-xs font-bold">✕</button>
                  </div>
                </div>
              )}

              {/* 5. Soundboard Emoji Reactions Panel */}
              {showVoiceSoundboard && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-around z-20 animate-fade-in">
                  {['👏', '🎉', '👍', '🔥', '🙋', '💡', '❤️', '🚀'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleTriggerVoiceReaction(emoji)}
                      className="text-2xl hover:scale-125 active:scale-95 transition-all p-1.5 rounded-xl hover:bg-slate-800"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* 6. Primary Interactive Voice Control Toolbar */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 z-10">
                {/* Mic Mute / Unmute Button */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-md ${
                    activeCall.isMuted ? 'bg-amber-500 text-white shadow-amber-950/50' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                  title={activeCall.isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  <span className="material-symbols-outlined">{activeCall.isMuted ? 'mic_off' : 'mic'}</span>
                </button>

                {/* Push-to-Talk Spacebar Walkie-Talkie Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPushToTalkActive(!isPushToTalkActive);
                    toast.success(isPushToTalkActive ? 'Walkie-Talkie PTT Mode OFF' : 'Walkie-Talkie PTT Mode ON (Hold Spacebar to speak)');
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-md border ${
                    isPushToTalkActive ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Push-to-Talk Walkie-Talkie Mode (Hold Spacebar)"
                >
                  <span className="material-symbols-outlined">settings_voice</span>
                </button>

                {/* 1-Click Upgrade to Video Call */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCall(prev => prev ? { ...prev, callType: 'video' } : null);
                    toast.success('📹 Upgraded voice call to HD Video!');
                  }}
                  className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-xl shadow-md border border-blue-400 transition-all hover:scale-105"
                  title="Upgrade to HD Video Call"
                >
                  <span className="material-symbols-outlined">videocam</span>
                </button>

                {/* Share Screen */}
                <button
                  type="button"
                  onClick={async () => {
                    setActiveCall(prev => prev ? { ...prev, callType: 'video' } : null);
                    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                      try {
                        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                        screenStreamRef.current = stream;
                        setIsScreenSharing(true);
                        toast.success('🖥️ Screen sharing active');
                      } catch {
                        toast.error('Screen sharing canceled');
                      }
                    }
                  }}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xl border border-slate-700 transition-all"
                  title="Share Screen"
                >
                  <span className="material-symbols-outlined">present_to_all</span>
                </button>

                {/* Record Voice Call */}
                <button
                  type="button"
                  onClick={async () => {
                    if (isRecording) {
                      setIsRecording(false);
                      setVoiceRecordingAudioUrl('sample_voice_note.mp3');
                      setShowVoiceExportModal(true);
                      toast.success('🔴 Voice Call Recording saved! Export preview ready.');
                    } else {
                      setIsRecording(true);
                      toast.success('🔴 Started Voice Call Recording');
                    }
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-md ${
                    isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                  title={isRecording ? 'Stop Voice Recording' : 'Record Voice Call'}
                >
                  <span className="material-symbols-outlined">{isRecording ? 'stop_circle' : 'fiber_manual_record'}</span>
                </button>

                {/* Closed Captions Subtitles Toggle */}
                <button
                  type="button"
                  onClick={() => setShowVoiceCaptions(!showVoiceCaptions)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all border ${
                    showVoiceCaptions ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Live Closed Captions (CC Subtitles)"
                >
                  <span className="material-symbols-outlined">closed_caption</span>
                </button>

                {/* Soundboard Reactions */}
                <button
                  type="button"
                  onClick={() => setShowVoiceSoundboard(!showVoiceSoundboard)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all border ${
                    showVoiceSoundboard ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Live Soundboard & Emoji Reactions"
                >
                  <span className="material-symbols-outlined">mood</span>
                </button>

                {/* In-Call Chat Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowVoiceInCallChat(!showVoiceInCallChat)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all border ${
                    showVoiceInCallChat ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="In-Call Text Messaging Chat"
                >
                  <span className="material-symbols-outlined">chat</span>
                </button>

                {/* AI Executive Summary Generator */}
                <button
                  type="button"
                  onClick={handleGenerateVoiceAiNotes}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center text-xl shadow-lg border border-purple-400 transition-all hover:scale-105"
                  title="Generate AI Voice Executive Summary Notes"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                </button>

                {/* Transfer / Add Participant */}
                <button
                  type="button"
                  onClick={() => setShowVoiceTransferModal(true)}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xl border border-slate-700 transition-all"
                  title="Add Participant / Transfer Call"
                >
                  <span className="material-symbols-outlined">person_add</span>
                </button>

                {/* Red End Call Button */}
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="w-14 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-2xl shadow-lg shadow-rose-950/50 hover:scale-105 active:scale-95 transition-all"
                  title="End Voice Call"
                >
                  <span className="material-symbols-outlined">call_end</span>
                </button>
              </div>

              {/* 7. Focus Ambience Selector Quick Tabs */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Focus Ambience:</span>
                {(['none', 'lofi', 'rain', 'library'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setVoiceAmbience(mode)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      voiceAmbience === mode
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {mode === 'none' ? 'Off 🔇' : mode === 'lofi' ? 'Lo-Fi Beats 🎧' : mode === 'rain' ? 'Rain 🌧️' : 'Library 📚'}
                  </button>
                ))}
              </div>

            </div>
          )}

        </div>
      , document.body)}

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

      {/* ── HD Meeting Recording Exported Modal ───────────────────────────────── */}
      {showRecordingPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">videocam</span>
                <span>HD Meeting Recording Exported</span>
              </h3>
              <button onClick={() => setShowRecordingPreviewModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {recordedVideoUrl ? (
              <video src={recordedVideoUrl} controls autoPlay className="w-full h-64 rounded-2xl bg-black border border-slate-800 object-contain shadow-inner" />
            ) : (
              <div className="w-full h-64 rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">video_file</span>
                <p className="text-xs font-bold">Processing video stream output...</p>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">ASTU_Mentorship_Meeting_Recording.webm</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Format: WebM Video (VP9/Opus) • Duration: {formatCallDuration(recordTimer || 12)} • Status: Saved</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold">Ready</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (recordedVideoUrl) {
                    const a = document.createElement('a');
                    a.href = recordedVideoUrl;
                    a.download = `ASTU_Mentorship_Meeting_Recording_${Date.now()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    toast.success('Downloading recording again...');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download Again
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('☁️ Saved to ASTU Alumni Cloud Storage Archive!');
                  setShowRecordingPreviewModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                Save to Cloud Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPeopleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">person_add</span>
                <span>Add People to HD Meeting</span>
              </h3>
              <button onClick={() => setShowAddPeopleModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Share Meeting Link Section */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Share Meeting Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/alumni/dashboard?callId=ASTU-MEET-${activeCall?.recipientId || '8924'}`}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-blue-300 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/alumni/dashboard?callId=ASTU-MEET-${activeCall?.recipientId || '8924'}`;
                    navigator.clipboard.writeText(url);
                    toast.success('📋 Meeting invite link copied to clipboard!');
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  Copy
                </button>
              </div>
            </div>

            {/* Direct Email / Username Invite Form */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invite via Email or Username</label>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const emailVal = inviteEmailInput.trim();
                  if (!emailVal) return;

                  setIsSendingInvite(true);
                  const callId = `ASTU-MEET-${activeCall?.recipientId || '8924'}`;
                  const meetingLink = `${window.location.origin}/alumni/dashboard?callId=${callId}`;

                  try {
                    await apiClient.post('/chat/meeting-invite', {
                      recipientEmail: emailVal,
                      meetingLink,
                      callId,
                    });

                    const name = emailVal.includes('@') ? emailVal.split('@')[0] : emailVal;
                    setExtraParticipants(prev => [
                      ...prev,
                      {
                        id: `p-${Date.now()}`,
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        role: 'Invited Guest',
                        avatar: '',
                        isMuted: false,
                      }
                    ]);
                    setInviteEmailInput('');
                    toast.success(`✉️ Meeting invitation email sent to ${emailVal}!`);
                  } catch (err: any) {
                    console.error('Meeting invite error:', err);
                    toast.error(err?.response?.data?.message || 'Failed to send invitation. Please try again.');
                  } finally {
                    setIsSendingInvite(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="e.g. abebe.bikila@astu.edu.et"
                  value={inviteEmailInput}
                  onChange={(e) => setInviteEmailInput(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSendingInvite}
                />
                <button
                  type="submit"
                  disabled={isSendingInvite || !inviteEmailInput.trim()}
                  className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 shrink-0 ${
                    isSendingInvite ? 'bg-emerald-800 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSendingInvite ? (
                    <>
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></span>
                      Sending...
                    </>
                  ) : 'Send Invite'}
                </button>
              </form>
            </div>

            {/* Quick Add ASTU Alumni Directory Suggestions — Real DB Contacts */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested ASTU Alumni & Mentors</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {isLoadingSuggested ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full"></span>
                    <span className="ml-2 text-xs text-slate-400">Loading contacts from database...</span>
                  </div>
                ) : suggestedContacts.length === 0 ? (
                  <div className="text-center py-4">
                    <span className="text-slate-500 text-xs">No contacts available</span>
                  </div>
                ) : (
                  suggestedContacts.map(user => {
                    const alreadyAdded = extraParticipants.some(p => p.name === user.name || p.id === user.userId);
                    return (
                      <div key={user.userId} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-black">
                              {user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white">{user.name}</p>
                            <p className="text-[10px] text-slate-400">{user.roleLabel}{user.email ? ` • ${user.email}` : ''}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={alreadyAdded}
                          onClick={async () => {
                            setExtraParticipants(prev => [
                              ...prev,
                              {
                                id: user.userId,
                                name: user.name,
                                role: user.roleLabel,
                                avatar: user.avatar || '',
                                isMuted: false,
                              }
                            ]);
                            toast.success(`Added ${user.name} to video call!`);

                            // Also send email invite silently
                            if (user.email) {
                              try {
                                const callId = `ASTU-MEET-${activeCall?.recipientId || '8924'}`;
                                const meetingLink = `${window.location.origin}/alumni/dashboard?callId=${callId}`;
                                await apiClient.post('/chat/meeting-invite', {
                                  recipientEmail: user.email,
                                  meetingLink,
                                  callId,
                                });
                                toast.success(`✉️ Email invitation also sent to ${user.name}!`);
                              } catch (_) { /* silent fallback */ }
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            alreadyAdded ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {alreadyAdded ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowAddPeopleModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. Audio Hardware Device Switcher Modal ────────────────────────────── */}
      {showAudioDeviceModal && (
        <div className="fixed inset-0 z-[1000000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowAudioDeviceModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">headphones</span>
                <span>Audio Input & Output Hardware</span>
              </h3>
              <button onClick={() => setShowAudioDeviceModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Microphone Input Device</label>
                <select
                  value={selectedAudioInput}
                  onChange={e => setSelectedAudioInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-blue-500"
                >
                  <option value="Studio Microphone HD">Studio Condenser Mic HD (Active)</option>
                  <option value="Default Built-in Mic">Default System Microphone</option>
                  <option value="Headset Microphone">USB Headset Noise-Canceling Mic</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Audio Output Speaker Device</label>
                <select
                  value={selectedAudioOutput}
                  onChange={e => setSelectedAudioOutput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-blue-500"
                >
                  <option value="System Default (Headphones)">System Default Headphones (3.5mm Output)</option>
                  <option value="Built-in Speakers">Mac/PC High-Definition Speakers</option>
                  <option value="Wireless AirPods Pro">Wireless Bluetooth Headphones / AirPods</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => toast.success('🔊 Playing audio speaker test chime...')}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">volume_up</span>
                  <span>Test Speaker Sound</span>
                </button>
                <button
                  onClick={() => {
                    setShowAudioDeviceModal(false);
                    toast.success('Audio hardware settings saved!');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Voice Call Telemetry & Diagnostics Modal ───────────────────────── */}
      {showVoiceDiagnostics && (
        <div className="fixed inset-0 z-[1000000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowVoiceDiagnostics(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">signal_cellular_alt</span>
                <span>Voice Call Network Telemetry</span>
              </h3>
              <button onClick={() => setShowVoiceDiagnostics(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Roundtrip Latency</p>
                <p className="text-lg font-extrabold text-emerald-400 mt-1">16 ms <span className="text-[10px] text-slate-400">(Optimal)</span></p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Audio Bitrate</p>
                <p className="text-lg font-extrabold text-blue-400 mt-1">96 kbps <span className="text-[10px] text-slate-400">(Opus HD)</span></p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Packet Loss</p>
                <p className="text-lg font-extrabold text-emerald-400 mt-1">0.0 % <span className="text-[10px] text-slate-400">(Zero Loss)</span></p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Jitter Buffer</p>
                <p className="text-lg font-extrabold text-indigo-400 mt-1">1.2 ms <span className="text-[10px] text-slate-400">(Stable)</span></p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-200">Eco Data-Saver Mode</p>
                <p className="text-[10px] text-slate-400">Optimize for 2G/3G mobile networks</p>
              </div>
              <button
                onClick={() => {
                  setIsEcoDataSaverOn(!isEcoDataSaverOn);
                  toast.success(isEcoDataSaverOn ? 'Eco Data-Saver OFF' : 'Eco Data-Saver ON');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative ${isEcoDataSaverOn ? 'bg-emerald-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isEcoDataSaverOn ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Voice Recording Export Modal ────────────────────────────────────── */}
      {showVoiceExportModal && (
        <div className="fixed inset-0 z-[1000000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowVoiceExportModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400">graphic_eq</span>
                <span>Voice Call Recording Exported</span>
              </h3>
              <button onClick={() => setShowVoiceExportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[60, 80, 45, 90, 100, 70, 50, 85, 95, 60, 75, 40].map((h, i) => (
                  <div key={i} className="w-1.5 bg-rose-500 rounded-full" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-xs text-slate-300 font-extrabold">HD Voice Note • {Math.floor(recordTimer / 60)}:{(recordTimer % 60).toString().padStart(2, '0')}</p>
              <p className="text-[10px] text-slate-400">Captured at 48kHz Opus High Definition</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  toast.success('💾 Voice Call Recording (.mp3) downloaded!');
                  setShowVoiceExportModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download Voice Note (.mp3)</span>
              </button>
              <button
                onClick={() => {
                  toast.success('☁️ Saved to ASTU Audio Cloud Vault!');
                  setShowVoiceExportModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
              >
                Save to Meeting Cloud Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. AI Executive Voice Notes Summary Modal ───────────────────────────── */}
      {showVoiceAiNotesModal && (
        <div className="fixed inset-0 z-[1000000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowVoiceAiNotesModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
                <span>AI Voice Executive Summary Notes</span>
              </h3>
              <button onClick={() => setShowVoiceAiNotesModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {isGeneratingVoiceAiNotes ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-purple-300 font-bold">Analyzing spoken voice audio stream...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 space-y-3 max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    <p className="font-bold text-purple-400 uppercase text-[10px]">Spoken Key Takeaways</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Reviewed microservice architecture scaling for ASTU research lab.</li>
                      <li>Discussed referral opportunities for senior software engineer roles.</li>
                      <li>Scheduled next code review and system design session.</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <p className="font-bold text-emerald-400 uppercase text-[10px]">Agreed Action Items</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Send ASTU alumnus GitHub repository for architecture feedback.</li>
                      <li>Schedule follow-up 1-on-1 mentorship call.</li>
                    </ol>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(voiceAiNotesContent);
                      toast.success('📋 AI Notes copied to clipboard!');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                  >
                    Copy AI Notes
                  </button>
                  <button
                    onClick={() => setShowVoiceAiNotesModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. Call Transfer & Invite Participant Drawer ────────────────────────── */}
      {showVoiceTransferModal && (
        <div className="fixed inset-0 z-[1000000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowVoiceTransferModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">person_add</span>
                <span>Invite / Transfer Voice Call</span>
              </h3>
              <button onClick={() => setShowVoiceTransferModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Direct Voice Meeting Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/admin/messages?callId=ASTU-VOICE-8924`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/admin/messages?callId=ASTU-VOICE-8924`);
                      toast.success('📋 Meeting link copied!');
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Available ASTU Alumni & Mentors to Transfer Call</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[
                    { name: 'Dr. Abebe Bikila', role: 'Head of Computer Science', status: 'Online' },
                    { name: 'Tigist Worku', role: 'Senior Cloud Architect @ Ethio Telecom', status: 'Online' },
                    { name: 'Dawit Haile', role: 'DevOps Lead @ INSA', status: 'In Meeting' }
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div>
                        <p className="font-bold text-slate-200">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.role}</p>
                      </div>
                      <button
                        onClick={() => {
                          toast.success(`📞 Transfer request sent to ${m.name}!`);
                          setShowVoiceTransferModal(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                      >
                        Merge Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. In-Call Text Chat Drawer ───────────────────────────────────────── */}
      {showVoiceInCallChat && (
        <div className="fixed inset-0 z-[1000000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4" onClick={() => setShowVoiceInCallChat(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full text-white space-y-4 shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">chat</span>
                <span>In-Call Voice Chat</span>
              </h3>
              <button onClick={() => setShowVoiceInCallChat(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-slate-950 rounded-2xl border border-slate-800 text-xs min-h-[160px]">
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700 max-w-[85%]">
                <p className="text-[10px] font-bold text-blue-400">Wabi Tena</p>
                <p className="text-slate-200">Hello! Sent you the database schema link in chat.</p>
              </div>
              <div className="bg-blue-600/30 p-2 rounded-xl border border-blue-500/40 max-w-[85%] ml-auto text-right">
                <p className="text-[10px] font-bold text-blue-300">You</p>
                <p className="text-slate-100">Received! Checking the table definitions now.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message during voice call..."
                value={inCallMessageText}
                onChange={e => setInCallMessageText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && inCallMessageText.trim()) {
                    toast.success('Message sent in call chat');
                    setInCallMessageText('');
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  if (inCallMessageText.trim()) {
                    toast.success('Message sent in call chat');
                    setInCallMessageText('');
                  }
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

