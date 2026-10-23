import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronDown, ChevronUp, MessageCircle, Send, Trash2, X, Sparkles, Copy, Check, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import config from "../config";

type MessageSender = "user" | "bot";

type ChatMessage = {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: string;
  isAI: boolean;
};

const COLORS = {
  navy: "#003087",
  navyLight: "#0A3E9E",
  navyDark: "#002060",
  green: "#006B3C",
  greenLight: "#008B4C",
  gold: "#C8962A",
  goldLight: "#E8B84A",
  red: "#C0392B",
  redLight: "#E74C3C",
};

const SUGGESTED_PROMPTS = [
  { label: "📄 Request Transcript", query: "How do I request my academic transcript?" },
  { label: "💼 Find Jobs", query: "How do I find jobs and career opportunities?" },
  { label: "📋 Register on Portal", query: "How do I register as an alumnus or partner employer?" },
  { label: "📊 Employment Stats", query: "What are the ASTU graduate employment and salary statistics?" },
  { label: "📢 Official Notices", query: "What are the latest announcements and circulars?" },
  { label: "📍 Campus Location", query: "Where is ASTU located and what are the main campus facilities?" },
];

const SYSTEM_MANUAL_RESPONSES: Record<string, string> = {
  "update my profile":
    "How to update your profile:\n1. Sign in and open Dashboard → Profile.\n2. Update education, work experience, skills, and portfolio links.\n3. Save changes to keep your career profile current.",
  "find job":
    "How to find jobs and apply:\n1. Sign in to the Alumni Portal.\n2. Open Career Center / Jobs.\n3. Filter by department, location, or employer.\n4. Submit your application from the listing page.",
  "tracer survey":
    "How to complete the graduate tracer survey:\n1. Sign in to your Alumni Dashboard.\n2. Open the Surveys tab.\n3. Select the active tracer study.\n4. Answer the questions about employment status and feedback.\n5. Submit the survey.",
  "request transcript":
    "How to request academic documents:\n1. Sign in to your Alumni Dashboard.\n2. Go to Document Services → Request Document.\n3. Select Official Transcript, Degree Certificate, or related document.\n4. Submit the request for Registrar processing (24–48h SLA).\n5. Track status under My Document Requests.",
  "mentor":
    "How to connect with alumni mentors:\n1. Sign in and open the Mentorship tab.\n2. Browse mentors by industry or department.\n3. Send a guidance request from a mentor profile.",
  "register":
    "How to register on ASTU-AMS:\n1. Click Register in the top navigation.\n2. Choose Alumni or Partner Employer.\n3. Complete the required details.\n4. Create a password and submit.\n5. Verify your email to activate the account.",
  "employer":
    "How employers partner and post jobs:\n1. Open Partner registration from the Partners page.\n2. Enter organisation and contact details for verification.\n3. After approval, sign in to the Employer Portal.\n4. Publish vacancies from the employer dashboard.",
  "where is astu":
    "ASTU Campus Location:\n• City: Adama (Nazret), Oromia Region, Ethiopia (~100km southeast of Addis Ababa along the expressway).\n• Main Campus: Central administration, academic faculties, and student services.\n• Research Complex: Advanced robotics, computing, and engineering labs.\n• Convocation Hall: Graduation ceremonies, career fairs, and innovation symposiums.",
  "location":
    "ASTU Campus Location:\n• City: Adama (Nazret), Oromia Region, Ethiopia (~100km southeast of Addis Ababa).\n• Main Campus: Central administration, academic faculties, and student services.\n• Research Complex: Advanced robotics, computing, and engineering labs.",
  "announcement":
    "Recent ASTU Official Notices:\n• ASTU Engineering Innovation Summit 2026\n• Semester Break: Campus Safety Notice & Lab Guidelines\n• DAAD Alumni Workshop on Sustainable Water Supply\n• Annual Alumni & Career Fair Registrations Open\n\nVisit the Announcements section on the homepage or open /announcements for full articles.",
  "notices":
    "Recent ASTU Official Notices:\n• ASTU Engineering Innovation Summit 2026\n• Semester Break: Campus Safety Notice & Lab Guidelines\n• DAAD Alumni Workshop on Sustainable Water Supply\n• Annual Alumni & Career Fair Registrations Open\n\nVisit the Announcements section on the homepage or open /announcements.",
  "event":
    "Upcoming ASTU Events & Workshops:\n• ASTU Alumni Carnival 2026 (Main Campus)\n• AI for Engineering Research Workshop (120 seats)\n• CV Builder and Interview Lab (Career Center)\n• Startup Finance for Alumni Innovators\n\nRSVP or register directly from the Events & Workshops section on the homepage.",
  "workshop":
    "Upcoming ASTU Events & Workshops:\n• ASTU Alumni Carnival 2026 (Main Campus)\n• AI for Engineering Research Workshop (120 seats)\n• CV Builder and Interview Lab (Career Center)\n• Startup Finance for Alumni\n\nRSVP or register directly from the Events & Workshops section on the homepage.",
  "admission":
    "ASTU Admissions & Entry:\n• Undergraduate admissions are administered through the Ministry of Education (MoE) entrance examinations and national university placement for top STEM students.\n• Postgraduate (MSc/PhD) admissions are coordinated directly by the ASTU Graduate Studies Directorate.",
  "tuition":
    "Tuition & Fees Information:\n• Regular Ethiopian Government-sponsored undergraduate students are admitted under the national university cost-sharing scheme.\n• Digital services on ASTU-AMS (profile creation, job search, tracer surveys, mentorship) are 100% free of charge for verified alumni and employers.",
  "login":
    "How to Sign In to ASTU-AMS:\n1. Click Login in the top navigation.\n2. Enter your registered email and password.\n3. If you forgot your password, click 'Forgot Password?' to receive an instant OTP recovery code.",
  "contact support":
    "How to contact support & campus offices:\n• Alumni Relations: alumni@astu.edu.et\n• Registrar Directorate: registrar@astu.edu.et\n• Campus Telephone: +251 22 110 0001\n• P.O. Box: 1888, Adama, Ethiopia\n• Or open a ticket from Help & Support after signing in.",
};

const SENSITIVE_KEYWORDS = [
  'password', 'hash', 'audit log', 'database schema', 'all user', 'user emails', 'api key', 'secret token', 'db dump', 'delete user', 'suspend user', 'reset password for'
];

function getFallback(input: string) {
  const key = (input || '').toLowerCase();

  if (SENSITIVE_KEYWORDS.some((kw) => key.includes(kw))) {
    return "Security notice:\nThis public assistant cannot share private accounts, credentials, audit logs, or internal administrative data.\n\nPlease sign in with an authorised account to access your dashboard.";
  }

  if (key.includes('who are') || key.includes('who r') || key.includes('your name') || key.includes('ur name') || key.includes('what are you')) {
    return "I am the ASTU-AMS assistant for Adama Science and Technology University.\n\nI can help with portal navigation, registration, document requests, jobs, tracer surveys, and mentorship guidance.";
  }

  if (key.includes('can u') || key.includes('can you') || key.includes('what do you') || key.includes('what do u') || key.includes('what u do') || key.includes('what can u') || key.includes('what can you') || key.includes('help') || key.includes('feature') || key.includes('capability') || key.includes('options')) {
    return "I can help with:\n• Registration as alumni or employer\n• Academic transcript and document requests\n• Browsing and applying to job listings\n• Completing graduate tracer surveys\n• Connecting with alumni mentors";
  }

  if (key.includes('about astu') || key.includes('what is astu') || key.includes('adama science')) {
    return "About Adama Science and Technology University (ASTU):\nASTU is a science and technology university in Adama, Ethiopia, focused on STEM education and research across Computer Science, Electrical Engineering, Mechanical Engineering, Civil Engineering, and related fields.";
  }

  if (key.includes('salary') || key.includes('salaries') || key.includes('pay') || key.includes('income')) {
    return "Salary Telemetry (ASTU Graduates):\n• Average Starting Salary: ETB 19,185 / month\n• Top Earning Department: Software Engineering (Avg ETB 23,400 / month)\n• Computer Science & ECE: Avg ETB 22,000 / month\n\nFigures are drawn from verified ASTU-AMS tracer survey records.";
  }

  if (key.includes('employment') || key.includes('placement rate') || key.includes('hire rate')) {
    return "ASTU Employment & Placement Telemetry:\n• Overall Employment Rate: 55.0%\n• Electrical & Computer Engineering: 75.0%\n• Software Engineering: 63.0%\n• Average Time to Hire: 16.3 months\n• Top Employers: Safaricom Ethiopia, Ethio Telecom, Sunshine Construction, INSA, Wabi Tena.";
  }

  for (const [pattern, response] of Object.entries(SYSTEM_MANUAL_RESPONSES)) {
    if (key.includes(pattern)) return response;
  }

  return "ASTU-AMS Assistant:\nI can help with portal navigation, transcript requests, job applications, tracer surveys, and university information.\n\nTry asking:\n• \"What can you do?\"\n• \"How do I request my transcript?\"\n• \"How do I register?\"\n• \"Where is ASTU located?\"\n• \"What are the latest announcements?\"";
}

async function askAssistant(userMessage: string) {
  const candidateUrls = [
    `${config.apiUrl}/ai/public-chat`,
    "http://localhost:5000/api/ai/public-chat",
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const reply = data.data?.response;
        if (typeof reply === "string" && reply.trim()) {
          return reply.replace(/\*\*/g, "").replace(/\*/g, "").trim();
        }
      }
    } catch (_) {}
  }

  return getFallback(userMessage);
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots({ isDark = false }: { isDark?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isDark
              ? ["#60a5fa", "#4ade80", "#fbbf24"][i]
              : [COLORS.navy, COLORS.green, COLORS.gold][i],
            display: "inline-block",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            boxShadow: `0 0 6px ${isDark ? ["#60a5fa", "#4ade80", "#fbbf24"][i] : [COLORS.navy, COLORS.green, COLORS.gold][i]}60`,
          }}
        />
      ))}
    </div>
  );
}

function renderStructuredContent(rawText: string, isUser: boolean, isDark = false) {
  const cleanedText = rawText
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/"\s*"/g, '"');

  const lines = cleanedText.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const isHeader =
          (trimmed.endsWith(":") && trimmed.length < 65) ||
          /^[🎓🏛️💼📋📄🤝🏢📊🎧💡👤🔒💰]/.test(trimmed) ||
          /^([A-Z\s]{4,}):?$/.test(trimmed);

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        const bulletMatch = trimmed.match(/^([•\-✓\*])\s*(.*)$/);

        if (isHeader && !numMatch && !bulletMatch) {
          return (
            <div
              key={idx}
              style={{
                fontWeight: 700,
                fontSize: 13.5,
                marginTop: idx === 0 ? 0 : 4,
                marginBottom: 2,
                color: isUser ? "#fff" : (isDark ? "#93c5fd" : COLORS.navy),
                lineHeight: 1.4,
              }}
            >
              {trimmed}
            </div>
          );
        }

        if (numMatch) {
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                paddingLeft: 2,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  minWidth: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: isUser
                    ? "rgba(255,255,255,0.2)"
                    : (isDark ? "rgba(96,165,250,0.2)" : "rgba(0,48,135,0.12)"),
                  color: isUser ? "#fff" : (isDark ? "#93c5fd" : COLORS.navy),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {numMatch[1]}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.55, color: isUser ? "#fff" : (isDark ? "#f1f5f9" : "#1a1a2e") }}>
                {numMatch[2]}
              </span>
            </div>
          );
        }

        if (bulletMatch) {
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                paddingLeft: 2,
              }}
            >
              <span
                style={{
                  color: isUser ? "#fff" : (isDark ? "#4ade80" : COLORS.green),
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {bulletMatch[1] === "✓" ? "✓" : "•"}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.55, color: isUser ? "#fff" : (isDark ? "#f1f5f9" : "#1a1a2e") }}>
                {bulletMatch[2]}
              </span>
            </div>
          );
        }

        return (
          <div key={idx} style={{ fontSize: 13, lineHeight: 1.55, color: isUser ? "#fff" : (isDark ? "#f1f5f9" : "#1a1a2e") }}>
            {trimmed}
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({
  msg,
  isDark = false,
  onNavigate,
}: {
  msg: ChatMessage;
  isDark?: boolean;
  onNavigate?: (route: string) => void;
}) {
  const isUser = msg.sender === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Quick action shortcuts
  const actions: { label: string; route: string }[] = [];
  if (!isUser) {
    const textLower = msg.text.toLowerCase();
    if (textLower.includes("register") || textLower.includes("sign up") || textLower.includes("create account")) {
      actions.push({ label: "Go to Register", route: "/register" });
    }
    if (textLower.includes("login") || textLower.includes("sign in") || textLower.includes("password")) {
      actions.push({ label: "Go to Login", route: "/login" });
    }
    if (textLower.includes("announcement") || textLower.includes("notice") || textLower.includes("/announcements")) {
      actions.push({ label: "View Notices", route: "/announcements" });
    }
    if (textLower.includes("job") || textLower.includes("career") || textLower.includes("vacanc")) {
      actions.push({ label: "Career Portal", route: "/login" });
    }
    if (textLower.includes("transcript") || textLower.includes("document")) {
      actions.push({ label: "Document Services", route: "/login" });
    }
  }

  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-end",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "fadeSlideIn 0.3s ease",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: isUser
          ? `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenLight})`
          : `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, color: "#fff", fontWeight: 700,
        boxShadow: `0 2px 8px ${isUser ? COLORS.green : COLORS.navy}40`,
      }}>
        {isUser ? "You" : <Bot size={16} strokeWidth={2.25} />}
      </div>

      <div style={{
        maxWidth: "80%",
        background: isUser
          ? `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`
          : (isDark ? "#1e293b" : "#fff"),
        color: isUser ? "#fff" : (isDark ? "#f1f5f9" : "#1a1a2e"),
        borderRadius: 16,
        borderBottomLeftRadius: isUser ? 16 : 4,
        borderBottomRightRadius: isUser ? 4 : 16,
        padding: "12px 16px",
        border: isUser ? "none" : (isDark ? "1px solid #334155" : "1px solid #e2e8f4"),
        boxShadow: isUser
          ? `0 4px 12px ${COLORS.navy}30`
          : (isDark ? "0 4px 14px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)"),
      }}>
        {renderStructuredContent(msg.text, isUser, isDark)}

        {/* Quick action buttons if relevant */}
        {!isUser && actions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, paddingTop: 6, borderTop: isDark ? "1px solid #334155" : "1px solid #edf0f8" }}>
            {actions.slice(0, 2).map((act) => (
              <button
                key={act.label}
                onClick={() => onNavigate && onNavigate(act.route)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: isDark ? "rgba(96,165,250,0.15)" : "rgba(0,48,135,0.08)",
                  color: isDark ? "#93c5fd" : COLORS.navy,
                  border: isDark ? "1px solid rgba(96,165,250,0.3)" : "1px solid rgba(0,48,135,0.2)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{act.label}</span>
                <ArrowUpRight size={11} />
              </button>
            ))}
          </div>
        )}

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isUser ? "flex-end" : "space-between",
          marginTop: 6,
          paddingTop: 2,
        }}>
          {!isUser && (
            <button
              onClick={handleCopy}
              title="Copy answer"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "2px 4px", display: "inline-flex", alignItems: "center", gap: 3,
                color: copied ? (isDark ? "#4ade80" : COLORS.green) : (isDark ? "#94a3b8" : "#9aa3b8"),
                fontSize: 10,
                borderRadius: 4,
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}

          <p style={{
            fontSize: 10.5, margin: 0,
            color: isUser ? "rgba(255,255,255,0.55)" : (isDark ? "#94a3b8" : "#9aa3b8"),
            textAlign: isUser ? "right" : "left",
          }}>
            {msg.timestamp}
            {msg.isAI && (
              <span style={{
                marginLeft: 6, opacity: isDark ? 0.9 : 0.7,
                background: isUser ? "rgba(255,255,255,0.15)" : (isDark ? "rgba(200,150,42,0.25)" : COLORS.gold + "20"),
                color: isUser ? "#fff" : (isDark ? "#fbbf24" : COLORS.gold),
                padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 600,
              }}>AI</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ASTUCareerCopilot() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I am the ASTU-AMS assistant.\n\nI can answer questions about Adama Science and Technology University and guide you through alumni, employer, and portal services. How can I help you today?",
      sender: "bot",
      timestamp: nowTime(),
      isAI: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("openChatbot", handleOpenChatbot);
    return () => window.removeEventListener("openChatbot", handleOpenChatbot);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const addUnreadIfClosed = () => {
    if (!isOpenRef.current) setUnreadCount((count) => count + 1);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text?.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
      timestamp: nowTime(),
      isAI: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const responseText = await askAssistant(trimmed);
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: "bot",
        timestamp: nowTime(),
        isAI: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      addUnreadIfClosed();
    } catch {
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        text: getFallback(trimmed),
        sender: "bot",
        timestamp: nowTime(),
        isAI: false,
      };
      setMessages((prev) => [...prev, botMsg]);
      addUnreadIfClosed();
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      text: "Hello! I am the ASTU-AMS assistant.\n\nI can answer questions about Adama Science and Technology University and guide you through alumni, employer, and portal services. How can I help you today?",
      sender: "bot",
      timestamp: nowTime(),
      isAI: true,
    }]);
    setUnreadCount(0);
  };

  const handleNavigate = (route: string) => {
    if (route.startsWith("#")) {
      const el = document.querySelector(route);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(route);
    }
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.8) translateY(20px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,150,42,0.5); }
          50%       { box-shadow: 0 0 0 14px rgba(200,150,42,0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        .action-btn:hover { opacity: 0.85; transform: scale(1.05); }
        .send-btn:not(:disabled):hover {
          background: linear-gradient(135deg, ${COLORS.green}, ${COLORS.gold}) !important;
          transform: scale(1.05);
          box-shadow: 0 4px 12px ${COLORS.green}50;
        }
        .chat-input:focus {
          outline: none;
          border-color: ${COLORS.gold} !important;
          box-shadow: 0 0 0 4px rgba(200,150,42,0.15) !important;
        }
        .chatbot-messages::-webkit-scrollbar { width: 5px; }
        .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${COLORS.navy}40, ${COLORS.gold}40);
          border-radius: 6px;
        }
      `}</style>

      {/* Floating Action Button with AI Badge */}
      <div
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 8,
        }}
        className="group"
      >
        {/* Hover Tooltip / Floating Label */}
        {!isOpen && (
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
              color: darkMode ? "#f1f5f9" : "#003087",
              boxShadow: "0 4px 20px rgba(0, 48, 135, 0.15)",
              border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 48, 135, 0.12)",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(8px)",
              pointerEvents: "none",
              transition: "all 0.25s ease",
              opacity: 0,
              transform: "translateX(8px)",
            }}
            className="group-hover:opacity-100 group-hover:translate-x-0 hidden sm:flex"
          >
            <Sparkles size={13} color="#C8962A" />
            <span>ASTU AI Assistant</span>
          </div>
        )}

        <button
          onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
          aria-label={isOpen ? "Close chat" : "Open ASTU AI assistant"}
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: isOpen
              ? `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redLight})`
              : `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyDark})`,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 24px ${isOpen ? COLORS.red : COLORS.navy}50`,
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            transform: "scale(1)",
            animation: !isOpen ? "pulse 2.5s infinite" : "none",
            color: "#fff",
            position: "relative",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.10)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <div style={{
            position: "absolute", inset: -3, borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight}, ${COLORS.green})`,
            opacity: 0.3, animation: "floatSlow 3s ease-in-out infinite",
          }} />
          <span style={{ lineHeight: 1, position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isOpen ? (
              <X size={26} strokeWidth={2.25} />
            ) : (
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={27} strokeWidth={2.2} />
                <Sparkles
                  size={12}
                  color="#FFD700"
                  style={{ position: "absolute", top: -4, right: -4, filter: "drop-shadow(0 0 4px #FFD700)" }}
                />
              </div>
            )}
          </span>
          {!isOpen && unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 0, right: 0,
              width: 22, height: 22, borderRadius: "50%",
              background: COLORS.red,
              color: "#fff",
              fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 100, right: 24, zIndex: 9998,
            width: 400, maxWidth: "calc(100vw - 48px)",
            height: isMinimized ? 68 : 560,
            maxHeight: "calc(100vh - 130px)",
            borderRadius: 24,
            background: darkMode ? "#0f172a" : "#fff",
            border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(200,150,42,0.15)",
            boxShadow: darkMode
              ? "0 16px 60px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5)"
              : `0 12px 60px ${COLORS.navy}25, 0 4px 16px rgba(0,0,0,0.08)`,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            transition: "height 0.3s ease",
          }}
        >
          {/* Header with animated gradient */}
          <div style={{
            background: `linear-gradient(-45deg, ${COLORS.navyDark}, ${COLORS.navy}, ${COLORS.navyLight}, ${COLORS.navyDark})`,
            backgroundSize: "300% 300%",
            animation: "gradientShift 6s ease infinite",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position:"absolute", top:-24, right:-24, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
            <div style={{ position:"absolute", bottom:-32, right:40, width:80, height:80, borderRadius:"50%", background:"rgba(200,150,42,0.08)" }} />
            <div style={{ position:"absolute", top:10, left:"40%", width:40, height:40, borderRadius:"50%", background:"rgba(0,107,60,0.06)" }} />

            {/* Bot avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              color: "#fff",
            }}><Bot size={22} strokeWidth={2} /></div>

            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#fff", fontSize:15, fontWeight:700, letterSpacing:"0.3px" }}>
                  ASTU Assistant
                </span>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }} />
              </div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:3 }}>
                Adama Science &amp; Technology University
              </div>
            </div>

            <div style={{ display:"flex", gap:6, zIndex:1 }}>
              {[
                { icon: <Trash2 size={14} />, title:"Clear chat", action: clearChat },
                { icon: isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />, title: isMinimized ? "Expand" : "Minimize", action: () => setIsMinimized(!isMinimized) },
              ].map(({ icon, title, action }) => (
                <button key={title} onClick={action} title={title} className="action-btn"
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background:"rgba(255,255,255,0.10)",
                    border:"0.5px solid rgba(255,255,255,0.18)",
                    color:"#fff", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.15s",
                    backdropFilter: "blur(4px)",
                  }}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* ASTU tricolor stripe with glow */}
          <div style={{
            height: 4, flexShrink: 0,
            background: `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.green} 33%, ${COLORS.gold} 66%, ${COLORS.red} 100%)`,
            boxShadow: `0 2px 8px ${COLORS.gold}30`,
          }} />

          {!isMinimized && (
            <>
              {/* Messages area */}
              <div style={{
                flex: 1, overflowY:"auto", padding:"16px",
                display:"flex", flexDirection:"column", gap:12,
                background: darkMode
                  ? "linear-gradient(180deg, #0b0f19 0%, #0f172a 100%)"
                  : "linear-gradient(180deg, #f0f4fe 0%, #f4f7fc 50%, #f8faff 100%)",
              }} className="chatbot-messages">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isDark={darkMode}
                    onNavigate={handleNavigate}
                  />
                ))}

                {messages.length === 1 && (
                  <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 6, animation: "fadeSlideIn 0.3s ease" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: darkMode ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 4 }}>
                      Popular Topics &amp; Quick Guides
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => sendMessage(p.query)}
                          style={{
                            fontSize: 11.5,
                            padding: "6px 10px",
                            borderRadius: 10,
                            background: darkMode ? "rgba(30,41,59,0.85)" : "rgba(255,255,255,0.9)",
                            color: darkMode ? "#e2e8f0" : COLORS.navy,
                            border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,48,135,0.15)",
                            cursor: "pointer",
                            textAlign: "left",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = COLORS.gold;
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,48,135,0.15)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div style={{
                    display:"flex", gap:10, alignItems:"flex-end",
                    animation:"fadeSlideIn 0.3s ease",
                  }}>
                    <div style={{
                      width:34, height:34, borderRadius:"50%", flexShrink:0,
                      background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
                      color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow: `0 2px 8px ${COLORS.navy}40`,
                    }}><Bot size={16} strokeWidth={2.25} /></div>
                    <div style={{
                      background: darkMode ? "#1e293b" : "#fff",
                      borderRadius:16, borderBottomLeftRadius:4,
                      padding:"10px 16px",
                      border: darkMode ? "1px solid #334155" : "1px solid #e2e8f4",
                      boxShadow: darkMode ? "0 4px 16px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.04)",
                    }}>
                      <TypingDots isDark={darkMode} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div style={{
                padding:"12px 14px",
                background: darkMode ? "#0f172a" : "#fff",
                borderTop: darkMode ? "1px solid #1e293b" : "1px solid #edf0f8",
                display:"flex", gap:8, alignItems:"center", flexShrink:0,
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask about ASTU, how to register, or request transcripts…"
                  disabled={isTyping}
                  className="chat-input"
                  style={{
                    flex:1, fontSize:13.5, padding:"10px 14px",
                    borderRadius:12,
                    border: darkMode ? "1.5px solid #334155" : "1.5px solid #dde3f0",
                    background: darkMode ? "#1e293b" : "#f4f7fc",
                    color: darkMode ? "#f8fafc" : "#1a1a2e",
                    transition:"border-color 0.2s, box-shadow 0.2s",
                  }}
                />

                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="send-btn"
                  style={{
                    width:38, height:38, borderRadius:12,
                    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
                    border:"none",
                    color:"#fff", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:18, flexShrink:0, transition:"all 0.2s",
                    opacity: (!input.trim() || isTyping) ? 0.4 : 1,
                    boxShadow: `0 2px 8px ${COLORS.navy}30`,
                  }}
                ><Send size={16} /></button>
              </div>

              {/* Powered by footer */}
              <div style={{
                textAlign:"center", padding:"6px 14px 10px",
                background: darkMode
                  ? "linear-gradient(180deg, #0f172a, #0b0f19)"
                  : "linear-gradient(180deg, #fff, #f8faff)",
                borderTop: darkMode ? "1px solid #1e293b" : "1px solid #f0f3fa",
                flexShrink:0,
              }}>
                <span style={{
                  fontSize:11, fontWeight:500,
                  background: darkMode
                    ? `linear-gradient(90deg, #60a5fa, #4ade80)`
                    : `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.green})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  ASTU-AMS Assistant • Portal guidance and institutional support
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
