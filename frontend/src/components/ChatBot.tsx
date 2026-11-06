import { useState, useRef, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  X,
  Sparkles,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";
import config from "../config";

function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  });
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return { darkMode };
}

type MessageSender = "user" | "bot";

export interface ChatCitation {
  id?: string | number;
  title: string;
  source?: string;
  snippet?: string;
  category?: string;
  section?: string;
  pageNumber?: number;
  similarity?: number;
  url?: string;
}

export interface ChatAction {
  label: string;
  route: string;
}

type ChatMessage = {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: string;
  isAI: boolean;
  isStreaming?: boolean;
  citations?: ChatCitation[];
  actions?: ChatAction[];
};

/** Align with ASTU design tokens (tailwind astu-*). */
const COLORS = {
  navy: "#0759A6",
  navyLight: "#0A6BC4",
  navyDark: "#0B1428",
  green: "#006B3C",
  greenLight: "#008B4C",
  gold: "#C8962A",
  goldLight: "#E8B84A",
  red: "#E31E24",
  redLight: "#F0444A",
};

const SUGGESTED_PROMPTS = [
  { label: "Request transcript", query: "How do I request my academic transcript?" },
  { label: "Find jobs", query: "How do I find jobs and career opportunities?" },
  { label: "Register on portal", query: "How do I register as an alumnus or partner employer?" },
  { label: "Employment stats", query: "What are the ASTU graduate employment and salary statistics?" },
  { label: "Official notices", query: "What are the latest announcements and circulars?" },
  { label: "Campus location", query: "Where is ASTU located and what are the main campus facilities?" },
];

const WELCOME_TEXT =
  "Hello! I am the ASTU-AMS assistant.\n\nI can answer questions about Adama Science and Technology University and guide you through alumni, employer, and portal services. How can I help you today?";

const SYSTEM_MANUAL_RESPONSES: Record<string, string> = {
  "update my profile":
    "How to update your profile:\n1. Sign in and open Dashboard → Profile.\n2. Update education, work experience, skills, and portfolio links.\n3. Save changes to keep your career profile current.",
  "find job":
    "How to find jobs and apply:\n1. Sign in to the Alumni Portal.\n2. Open Career Center / Jobs.\n3. Filter by department, location, or employer.\n4. Submit your application from the listing page.",
  "tracer survey":
    "How to complete the graduate tracer survey:\n1. Sign in to your Alumni Dashboard.\n2. Open the Surveys tab.\n3. Select the active tracer study.\n4. Answer the questions about employment status and feedback.\n5. Submit the survey.",
  "request transcript":
    "How to request academic documents:\n1. Sign in to your Alumni Dashboard.\n2. Go to Document Services → Request Document.\n3. Select Official Transcript, Degree Certificate, or related document.\n4. Submit the request for Registrar processing (24–48h SLA).\n5. Track status under My Document Requests.",
  mentor:
    "How to connect with alumni mentors:\n1. Sign in and open the Mentorship tab.\n2. Browse mentors by industry or department.\n3. Send a guidance request from a mentor profile.",
  register:
    "How to register on ASTU-AMS:\n1. Click Register in the top navigation.\n2. Choose Alumni or Partner Employer.\n3. Complete the required details.\n4. Create a password and submit.\n5. Verify your email to activate the account.",
  employer:
    "How employers partner and post jobs:\n1. Open Partner registration from the Partners page.\n2. Enter organisation and contact details for verification.\n3. After approval, sign in to the Employer Portal.\n4. Publish vacancies from the employer dashboard.",
  "where is astu":
    "ASTU Campus Location:\n• City: Adama (Nazret), Oromia Region, Ethiopia (~100km southeast of Addis Ababa along the expressway).\n• Main Campus: Central administration, academic faculties, and student services.\n• Research Complex: Advanced robotics, computing, and engineering labs.\n• Convocation Hall: Graduation ceremonies, career fairs, and innovation symposiums.",
  location:
    "ASTU Campus Location:\n• City: Adama (Nazret), Oromia Region, Ethiopia (~100km southeast of Addis Ababa).\n• Main Campus: Central administration, academic faculties, and student services.\n• Research Complex: Advanced robotics, computing, and engineering labs.",
  announcement:
    "Recent ASTU Official Notices:\n• ASTU Engineering Innovation Summit 2026\n• Semester Break: Campus Safety Notice & Lab Guidelines\n• DAAD Alumni Workshop on Sustainable Water Supply\n• Annual Alumni & Career Fair Registrations Open\n\nVisit the Announcements section on the homepage or open /announcements for full articles.",
  notices:
    "Recent ASTU Official Notices:\n• ASTU Engineering Innovation Summit 2026\n• Semester Break: Campus Safety Notice & Lab Guidelines\n• DAAD Alumni Workshop on Sustainable Water Supply\n• Annual Alumni & Career Fair Registrations Open\n\nVisit the Announcements section on the homepage or open /announcements.",
  event:
    "Upcoming ASTU Events & Workshops:\n• ASTU Alumni Carnival 2026 (Main Campus)\n• AI for Engineering Research Workshop (120 seats)\n• CV Builder and Interview Lab (Career Center)\n• Startup Finance for Alumni Innovators\n\nRSVP or register directly from the Events & Workshops section on the homepage.",
  workshop:
    "Upcoming ASTU Events & Workshops:\n• ASTU Alumni Carnival 2026 (Main Campus)\n• AI for Engineering Research Workshop (120 seats)\n• CV Builder and Interview Lab (Career Center)\n• Startup Finance for Alumni\n\nRSVP or register directly from the Events & Workshops section on the homepage.",
  admission:
    "ASTU Admissions & Entry:\n• Undergraduate admissions are administered through the Ministry of Education (MoE) entrance examinations and national university placement for top STEM students.\n• Postgraduate (MSc/PhD) admissions are coordinated directly by the ASTU Graduate Studies Directorate.",
  tuition:
    "Tuition & Fees Information:\n• Regular Ethiopian Government-sponsored undergraduate students are admitted under the national university cost-sharing scheme.\n• Digital services on ASTU-AMS (profile creation, job search, tracer surveys, mentorship) are 100% free of charge for verified alumni and employers.",
  login:
    "How to Sign In to ASTU-AMS:\n1. Click Login in the top navigation.\n2. Enter your registered email and password.\n3. If you forgot your password, click 'Forgot Password?' to receive an instant OTP recovery code.",
  "contact support":
    "How to contact support & campus offices:\n• Alumni Relations: alumni@astu.edu.et\n• Registrar Directorate: registrar@astu.edu.et\n• Campus Telephone: +251 22 110 0001\n• P.O. Box: 1888, Adama, Ethiopia\n• Or open a ticket from Help & Support after signing in.",
};

const SENSITIVE_KEYWORDS = [
  "password",
  "hash",
  "audit log",
  "database schema",
  "all user",
  "user emails",
  "api key",
  "secret token",
  "db dump",
  "delete user",
  "suspend user",
  "reset password for",
];

function getFallback(input: string) {
  const key = (input || "").toLowerCase();

  if (SENSITIVE_KEYWORDS.some((kw) => key.includes(kw))) {
    return "Security notice:\nThis public assistant cannot share private accounts, credentials, audit logs, or internal administrative data.\n\nPlease sign in with an authorised account to access your dashboard.";
  }

  if (
    key.includes("who are") ||
    key.includes("who r") ||
    key.includes("your name") ||
    key.includes("ur name") ||
    key.includes("what are you")
  ) {
    return "I am the ASTU-AMS assistant for Adama Science and Technology University.\n\nI can help with portal navigation, registration, document requests, jobs, tracer surveys, and mentorship guidance.";
  }

  if (
    key.includes("can u") ||
    key.includes("can you") ||
    key.includes("what do you") ||
    key.includes("what do u") ||
    key.includes("what u do") ||
    key.includes("what can u") ||
    key.includes("what can you") ||
    key.includes("help") ||
    key.includes("feature") ||
    key.includes("capability") ||
    key.includes("options")
  ) {
    return "I can help with:\n• Registration as alumni or employer\n• Academic transcript and document requests\n• Browsing and applying to job listings\n• Completing graduate tracer surveys\n• Connecting with alumni mentors";
  }

  if (key.includes("about astu") || key.includes("what is astu") || key.includes("adama science")) {
    return "About Adama Science and Technology University (ASTU):\nASTU is a science and technology university in Adama, Ethiopia, focused on STEM education and research across Computer Science, Electrical Engineering, Mechanical Engineering, Civil Engineering, and related fields.";
  }

  if (key.includes("salary") || key.includes("salaries") || key.includes("pay") || key.includes("income")) {
    return "Salary Telemetry (ASTU Graduates):\n• Average Starting Salary: ETB 19,185 / month\n• Top Earning Department: Software Engineering (Avg ETB 23,400 / month)\n• Computer Science & ECE: Avg ETB 22,000 / month\n\nFigures are drawn from verified ASTU-AMS tracer survey records.";
  }

  if (key.includes("employment") || key.includes("placement rate") || key.includes("hire rate")) {
    return "ASTU Employment & Placement Telemetry:\n• Overall Employment Rate: 55.0%\n• Electrical & Computer Engineering: 75.0%\n• Software Engineering: 63.0%\n• Average Time to Hire: 16.3 months\n• Top Employers: Safaricom Ethiopia, Ethio Telecom, Sunshine Construction, INSA, Wabi Tena.";
  }

  for (const [pattern, response] of Object.entries(SYSTEM_MANUAL_RESPONSES)) {
    if (key.includes(pattern)) return response;
  }

  return "ASTU-AMS Assistant:\nI can help with portal navigation, transcript requests, job applications, tracer surveys, and university information.\n\nTry asking:\n• \"What can you do?\"\n• \"How do I request my transcript?\"\n• \"How do I register?\"\n• \"Where is ASTU located?\"\n• \"What are the latest announcements?\"";
}

async function streamAssistantMessage(
  userMessage: string,
  onDelta: (delta: string) => void,
  onDone: (meta: { citations: ChatCitation[]; actions: ChatAction[] }) => void,
  onError: () => void
) {
  const streamUrl = `${config.apiUrl}/ai/public-chat-stream`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(streamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok || !response.body) {
      onError();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalCitations: ChatCitation[] = [];
    let finalActions: ChatAction[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.delta) {
              onDelta(data.delta);
            }
            if (data.done) {
              if (Array.isArray(data.citations)) finalCitations = data.citations;
              if (Array.isArray(data.actions)) finalActions = data.actions;
            }
          } catch {}
        }
      }
    }

    onDone({ citations: finalCitations, actions: finalActions });
  } catch {
    onError();
  }
}

async function askAssistantFallback(userMessage: string): Promise<{ text: string; citations: ChatCitation[]; actions: ChatAction[] }> {
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
        const citations = data.data?.citations || [];
        const actions = data.data?.actions || [];
        if (typeof reply === "string" && reply.trim()) {
          return {
            text: reply.replace(/\*\*/g, "").replace(/\*/g, "").trim(),
            citations,
            actions,
          };
        }
      }
    } catch {
      /* try next URL / fallback */
    }
  }

  return {
    text: getFallback(userMessage),
    citations: [],
    actions: [],
  };
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots({ isDark = false }: { isDark?: boolean }) {
  return (
    <div
      style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: isDark
              ? ["#60a5fa", "#4ade80", "#fbbf24"][i]
              : [COLORS.navy, COLORS.green, COLORS.gold][i],
            display: "inline-block",
            animation: `astuChatBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
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
          /^([A-Z\s]{4,}):?$/.test(trimmed);

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        const bulletMatch = trimmed.match(/^([•\-✓*])\s*(.*)$/);

        if (isHeader && !numMatch && !bulletMatch) {
          return (
            <div
              key={idx}
              style={{
                fontWeight: 700,
                fontSize: 13.5,
                marginTop: idx === 0 ? 0 : 4,
                marginBottom: 2,
                color: isUser ? "#fff" : isDark ? "#93c5fd" : COLORS.navy,
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
                    : isDark
                      ? "rgba(96,165,250,0.2)"
                      : "rgba(7,89,166,0.12)",
                  color: isUser ? "#fff" : isDark ? "#93c5fd" : COLORS.navy,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {numMatch[1]}
              </span>
              <span
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: isUser ? "#fff" : isDark ? "#f1f5f9" : "#1a1a2e",
                }}
              >
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
                  color: isUser ? "#fff" : isDark ? "#4ade80" : COLORS.green,
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {bulletMatch[1] === "✓" ? "✓" : "•"}
              </span>
              <span
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: isUser ? "#fff" : isDark ? "#f1f5f9" : "#1a1a2e",
                }}
              >
                {bulletMatch[2]}
              </span>
            </div>
          );
        }

        return (
          <div
            key={idx}
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              color: isUser ? "#fff" : isDark ? "#f1f5f9" : "#1a1a2e",
            }}
          >
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked */
    }
  };

  const actions: { label: string; route: string }[] = [];
  if (!isUser) {
    const textLower = msg.text.toLowerCase();
    if (
      textLower.includes("register") ||
      textLower.includes("sign up") ||
      textLower.includes("create account")
    ) {
      actions.push({ label: "Go to Register", route: "/register" });
    }
    if (textLower.includes("login") || textLower.includes("sign in") || textLower.includes("password")) {
      actions.push({ label: "Go to Login", route: "/login" });
    }
    if (
      textLower.includes("announcement") ||
      textLower.includes("notice") ||
      textLower.includes("/announcements")
    ) {
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
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        flexDirection: isUser ? "row-reverse" : "row",
        animation: "astuChatFadeIn 0.28s ease",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: isUser
            ? `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenLight})`
            : `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          color: "#fff",
          fontWeight: 700,
          boxShadow: `0 2px 8px ${isUser ? COLORS.green : COLORS.navy}35`,
        }}
        aria-hidden="true"
      >
        {isUser ? "You" : <Bot size={15} strokeWidth={2.25} />}
      </div>

      <div style={{
        maxWidth: "82%",
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
        {msg.isStreaming && !msg.text ? (
          <TypingDots isDark={isDark} />
        ) : (
          <div>
            {renderStructuredContent(msg.text, isUser, isDark)}
            {msg.isStreaming && (
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 14,
                  backgroundColor: isDark ? "#60a5fa" : COLORS.navy,
                  marginLeft: 4,
                  verticalAlign: "middle",
                  animation: "pulse 1s infinite",
                }}
              />
            )}
          </div>
        )}

        {/* Verified Citation Cards from Knowledge Base */}
        {!isUser && !msg.isStreaming && msg.citations && msg.citations.length > 0 && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: isDark ? "1px solid #334155" : "1px solid #edf0f8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <ShieldCheck size={13} style={{ color: isDark ? "#4ade80" : COLORS.green, flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                Verified Knowledge Sources
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {msg.citations.map((cite, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: isDark ? "rgba(15, 23, 42, 0.65)" : "#f8fafc",
                    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                    fontSize: 11,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: isDark ? "#93c5fd" : COLORS.navy }}>
                      📄 {cite.title}
                    </span>
                    {cite.category && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: isDark ? "rgba(96,165,250,0.15)" : "rgba(0,48,135,0.08)",
                          color: isDark ? "#93c5fd" : COLORS.navy,
                        }}
                      >
                        {cite.category}
                      </span>
                    )}
                  </div>
                  {cite.section && (
                    <div style={{ fontSize: 10, color: isDark ? "#94a3b8" : "#64748b", marginTop: 2 }}>
                      Section: {cite.section} {cite.pageNumber ? `(p. ${cite.pageNumber})` : ""}
                    </div>
                  )}
                  {cite.snippet && (
                    <div
                      style={{
                        fontSize: 10.5,
                        color: isDark ? "#cbd5e1" : "#475569",
                        marginTop: 3,
                        fontStyle: "italic",
                        lineHeight: 1.4,
                      }}
                    >
                      &ldquo;{cite.snippet.slice(0, 150)}{cite.snippet.length > 150 ? "..." : ""}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick action buttons if relevant */}
        {!isUser && !msg.isStreaming && (msg.actions?.length || actions.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, paddingTop: 6, borderTop: isDark ? "1px solid #334155" : "1px solid #edf0f8" }}>
            {(msg.actions && msg.actions.length > 0 ? msg.actions : actions).slice(0, 3).map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={() => onNavigate?.(act.route)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "5px 9px",
                  borderRadius: 8,
                  background: isDark ? "rgba(96,165,250,0.15)" : "rgba(7,89,166,0.08)",
                  color: isDark ? "#93c5fd" : COLORS.navy,
                  border: isDark
                    ? "1px solid rgba(96,165,250,0.3)"
                    : "1px solid rgba(7,89,166,0.2)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{act.label}</span>
                <ArrowUpRight size={11} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isUser ? "flex-end" : "space-between",
            marginTop: 6,
            paddingTop: 2,
          }}
        >
          {!isUser && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy answer"
              aria-label={copied ? "Copied" : "Copy answer"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 4px",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                color: copied
                  ? isDark
                    ? "#4ade80"
                    : COLORS.green
                  : isDark
                    ? "#94a3b8"
                    : "#9aa3b8",
                fontSize: 10,
                borderRadius: 4,
              }}
            >
              {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}

          <p
            style={{
              fontSize: 10.5,
              margin: 0,
              color: isUser ? "rgba(255,255,255,0.55)" : isDark ? "#94a3b8" : "#9aa3b8",
              textAlign: isUser ? "right" : "left",
            }}
          >
            {msg.timestamp}
            {msg.isAI && (
              <span
                style={{
                  marginLeft: 6,
                  opacity: isDark ? 0.9 : 0.75,
                  background: isUser
                    ? "rgba(255,255,255,0.15)"
                    : isDark
                      ? "rgba(200,150,42,0.25)"
                      : `${COLORS.gold}22`,
                  color: isUser ? "#fff" : isDark ? "#fbbf24" : COLORS.gold,
                  padding: "1px 6px",
                  borderRadius: 8,
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                AI
              </span>
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
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: WELCOME_TEXT,
      sender: "bot",
      timestamp: nowTime(),
      isAI: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
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
      const t = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setConfirmClear(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (confirmClear) {
          setConfirmClear(false);
          return;
        }
        setIsOpen(false);
        setIsMinimized(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, confirmClear]);

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

    const botMsgId = Date.now() + 1;
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      text: "",
      sender: "bot",
      timestamp: nowTime(),
      isAI: true,
      isStreaming: true,
      citations: [],
      actions: [],
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setInput("");
    setIsTyping(true);
    setConfirmClear(false);

    let accumulatedText = "";

    await streamAssistantMessage(
      trimmed,
      (delta) => {
        accumulatedText += delta;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? { ...m, text: accumulatedText }
              : m
          )
        );
      },
      (meta) => {
        const cleanText = accumulatedText.trim() || getFallback(trimmed);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: cleanText,
                  isStreaming: false,
                  citations: meta.citations,
                  actions: meta.actions,
                }
              : m
          )
        );
        setIsTyping(false);
        addUnreadIfClosed();
      },
      async () => {
        // Fallback when streaming encounters connection or parser issue
        const fallback = await askAssistantFallback(trimmed);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: fallback.text,
                  isStreaming: false,
                  citations: fallback.citations,
                  actions: fallback.actions,
                }
              : m
          )
        );
        setIsTyping(false);
        addUnreadIfClosed();
      }
    );
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: WELCOME_TEXT,
        sender: "bot",
        timestamp: nowTime(),
        isAI: true,
      },
    ]);
    setUnreadCount(0);
    setConfirmClear(false);
  };

  const handleNavigate = (route: string) => {
    if (route.startsWith("#")) {
      document.querySelector(route)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(route);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setConfirmClear(false);
  };

  return (
    <>
      <style>{`
        @keyframes astuChatBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-7px); }
        }
        @keyframes astuChatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes astuChatPopIn {
          from { transform: scale(0.94) translateY(16px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes astuChatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(7,89,166,0.45); }
          50%       { box-shadow: 0 0 0 12px rgba(7,89,166,0); }
        }
        .astu-chat-fab:hover { transform: scale(1.08); }
        .astu-chat-send:not(:disabled):hover {
          background: linear-gradient(135deg, ${COLORS.green}, ${COLORS.navy}) !important;
          transform: scale(1.04);
        }
        .astu-chat-input:focus {
          outline: none;
          border-color: ${COLORS.navy} !important;
          box-shadow: 0 0 0 3px rgba(7,89,166,0.18) !important;
        }
        .astu-chat-messages::-webkit-scrollbar { width: 5px; }
        .astu-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .astu-chat-messages::-webkit-scrollbar-thumb {
          background: ${COLORS.navy}55;
          border-radius: 6px;
        }
        .astu-chat-hint {
          opacity: 0;
          transform: translateX(6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }
        .astu-chat-fab-wrap:hover .astu-chat-hint {
          opacity: 1;
          transform: translateX(0);
        }
        @media (max-width: 640px) {
          .astu-chat-panel {
            right: 12px !important;
            left: 12px !important;
            bottom: 88px !important;
            width: auto !important;
            max-width: none !important;
            height: min(72vh, 560px) !important;
          }
          .astu-chat-hint { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .astu-chat-fab { animation: none !important; }
          .astu-chat-panel { animation: none !important; }
        }
      `}</style>

      <div
        className="astu-chat-fab-wrap"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 45,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {!isOpen && (
          <div
            className="astu-chat-hint hidden sm:flex"
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              background: darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.96)",
              color: darkMode ? "#f1f5f9" : COLORS.navy,
              boxShadow: "0 4px 18px rgba(11, 20, 40, 0.12)",
              border: darkMode
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(7, 89, 166, 0.12)",
              fontSize: 12,
              fontWeight: 700,
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(8px)",
            }}
          >
            <Sparkles size={13} color={COLORS.gold} aria-hidden="true" />
            <span>Need help? Ask ASTU</span>
          </div>
        )}

        <button
          type="button"
          className="astu-chat-fab"
          onClick={() => {
            if (isOpen) closeChat();
            else {
              setIsOpen(true);
              setIsMinimized(false);
            }
          }}
          aria-label={isOpen ? "Close chat" : "Open ASTU AI assistant"}
          aria-expanded={isOpen}
          aria-controls="astu-chat-panel"
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: isOpen
              ? `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redLight})`
              : `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyDark})`,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 24px ${isOpen ? COLORS.red : COLORS.navy}45`,
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s",
            animation: !isOpen ? "astuChatPulse 2.8s infinite" : "none",
            color: "#fff",
            position: "relative",
          }}
        >
          {isOpen ? (
            <X size={24} strokeWidth={2.25} aria-hidden="true" />
          ) : (
            <span style={{ position: "relative", display: "flex" }}>
              <Bot size={26} strokeWidth={2.2} aria-hidden="true" />
              <Sparkles
                size={11}
                color="#FFD700"
                style={{ position: "absolute", top: -5, right: -6 }}
                aria-hidden="true"
              />
            </span>
          )}
          {!isOpen && unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                minWidth: 20,
                height: 20,
                borderRadius: 999,
                background: COLORS.red,
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
                padding: "0 5px",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          id="astu-chat-panel"
          ref={panelRef}
          className="astu-chat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            zIndex: 45,
            width: 390,
            maxWidth: "calc(100vw - 48px)",
            height: isMinimized ? 64 : 540,
            maxHeight: "calc(100vh - 120px)",
            borderRadius: 20,
            background: darkMode ? "#0f172a" : "#fff",
            border: darkMode
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(7,89,166,0.12)",
            boxShadow: darkMode
              ? "0 16px 50px rgba(0,0,0,0.65)"
              : `0 16px 48px ${COLORS.navyDark}22, 0 4px 14px rgba(0,0,0,0.06)`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "astuChatPopIn 0.3s cubic-bezier(0.22,1,0.36,1)",
            transition: "height 0.28s ease",
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.navyDark}, ${COLORS.navy})`,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#fff",
              }}
              aria-hidden="true"
            >
              <Bot size={20} strokeWidth={2} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  id={titleId}
                  style={{ color: "#fff", fontSize: 14.5, fontWeight: 700, letterSpacing: "0.2px" }}
                >
                  ASTU Assistant
                </span>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                  }}
                  title="Online"
                  aria-hidden="true"
                />
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11.5, marginTop: 2 }}>
                Adama Science &amp; Technology University
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => setConfirmClear((v) => !v)}
                title="Clear chat"
                aria-label="Clear chat"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized((v) => !v)}
                title={isMinimized ? "Expand" : "Minimize"}
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isMinimized ? (
                  <ChevronUp size={14} aria-hidden="true" />
                ) : (
                  <ChevronDown size={14} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={closeChat}
                title="Close"
                aria-label="Close chat"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            style={{
              height: 3,
              flexShrink: 0,
              background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.green}, ${COLORS.gold}, ${COLORS.red})`,
            }}
            aria-hidden="true"
          />

          {!isMinimized && (
            <>
              {confirmClear && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "8px 12px",
                    background: darkMode ? "#1e293b" : "#fff7ed",
                    borderBottom: darkMode ? "1px solid #334155" : "1px solid #fed7aa",
                    fontSize: 12,
                    color: darkMode ? "#e2e8f0" : "#9a3412",
                  }}
                >
                  <span>Clear conversation?</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: darkMode ? "1px solid #475569" : "1px solid #fdba74",
                        background: "transparent",
                        cursor: "pointer",
                        color: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={clearChat}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "none",
                        background: COLORS.red,
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div
                className="astu-chat-messages"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: darkMode
                    ? "linear-gradient(180deg, #0b0f19 0%, #0f172a 100%)"
                    : "linear-gradient(180deg, #f4f8fc 0%, #f8fafc 100%)",
                }}
                aria-live="polite"
              >
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isDark={darkMode}
                    onNavigate={handleNavigate}
                  />
                ))}

                {messages.length === 1 && !isTyping && (
                  <div
                    style={{
                      marginTop: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      animation: "astuChatFadeIn 0.3s ease",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: darkMode ? "#94a3b8" : "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        paddingLeft: 2,
                      }}
                    >
                      Quick guides
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => sendMessage(p.query)}
                          style={{
                            fontSize: 12,
                            padding: "7px 11px",
                            borderRadius: 999,
                            background: darkMode ? "rgba(30,41,59,0.9)" : "#fff",
                            color: darkMode ? "#e2e8f0" : COLORS.navy,
                            border: darkMode
                              ? "1px solid rgba(255,255,255,0.12)"
                              : "1px solid rgba(7,89,166,0.16)",
                            cursor: "pointer",
                            textAlign: "left",
                            fontWeight: 600,
                            transition: "border-color 0.15s, transform 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = COLORS.gold;
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = darkMode
                              ? "rgba(255,255,255,0.12)"
                              : "rgba(7,89,166,0.16)";
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
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
                    aria-label="Assistant is typing"
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-hidden="true"
                    >
                      <Bot size={15} strokeWidth={2.25} />
                    </div>
                    <div
                      style={{
                        background: darkMode ? "#1e293b" : "#fff",
                        borderRadius: 16,
                        borderBottomLeftRadius: 4,
                        padding: "10px 14px",
                        border: darkMode ? "1px solid #334155" : "1px solid #e2e8f4",
                      }}
                    >
                      <TypingDots isDark={darkMode} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                style={{
                  padding: "10px 12px",
                  background: darkMode ? "#0f172a" : "#fff",
                  borderTop: darkMode ? "1px solid #1e293b" : "1px solid #edf0f8",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about ASTU, registration, transcripts…"
                  disabled={isTyping}
                  className="astu-chat-input"
                  aria-label="Message the ASTU assistant"
                  style={{
                    flex: 1,
                    fontSize: 13.5,
                    padding: "10px 13px",
                    borderRadius: 12,
                    border: darkMode ? "1.5px solid #334155" : "1.5px solid #dde3f0",
                    background: darkMode ? "#1e293b" : "#f4f7fc",
                    color: darkMode ? "#f8fafc" : "#1a1a2e",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="astu-chat-send"
                  aria-label="Send message"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
                    border: "none",
                    color: "#fff",
                    cursor: !input.trim() || isTyping ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                    opacity: !input.trim() || isTyping ? 0.4 : 1,
                  }}
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </form>

              <div
                style={{
                  textAlign: "center",
                  padding: "5px 12px 9px",
                  background: darkMode ? "#0f172a" : "#fff",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    color: darkMode ? "#64748b" : "#94a3b8",
                  }}
                >
                  ASTU-AMS · Portal guidance · Press Esc to close
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
