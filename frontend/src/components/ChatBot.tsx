import { useState, useRef, useEffect } from "react";

type MessageSender = "user" | "bot";

type ChatMessage = {
  id: number;
  text: string;
  sender: MessageSender;
  timestamp: string;
  isAI: boolean;
};

type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
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

const QUICK_REPLIES = [
  { label: "Update Profile",      icon: "👤", q: "How do I update my profile?" },
  { label: "Find Jobs",           icon: "💼", q: "How do I find job opportunities?" },
  { label: "Tracer Survey",       icon: "📋", q: "What is the tracer survey deadline?" },
  { label: "Request Transcript",  icon: "📄", q: "How do I request an official transcript?" },
  { label: "Find a Mentor",       icon: "🤝", q: "How do I connect with a mentor?" },
  { label: "Alumni Network",      icon: "🌐", q: "How do I join the alumni network?" },
  { label: "Career Events",       icon: "🗓️", q: "What career events are coming up?" },
  { label: "Contact Support",     icon: "🎧", q: "How do I contact alumni support?" },
];

const FALLBACK_RESPONSES: Record<string, string> = {
  "update my profile":
    "Go to your Dashboard → Profile tab to update your education, work experience, and skills. A complete profile increases your job match rate by up to 40%!",
  "find job":
    "Navigate to the Career Center or Jobs tab in your dashboard. Filter by location, salary range, and department. Listings are posted directly by verified employer partners.",
  "tracer survey":
    "The 6-Month Post-Graduation Tracer Study is required for alumni verification. Check your Surveys tab — responses typically close within 30 days of the deadline.",
  "request transcript":
    "Go to Document Services → Request Document. Select 'Official Transcript' and submit. Processing takes 2–3 business days.",
  "connect with a mentor":
    "Visit the Mentorship tab to browse available mentors. Filter by industry, department, or expertise. Send a connection request directly from their profile.",
  "alumni network":
    "Join via the Alumni Network tab on your dashboard. You can search by graduation year, department, or industry to find fellow ASTU graduates.",
  "career events":
    "Check the Events tab on your dashboard for upcoming career fairs, workshops, and networking sessions. We host 20+ events per semester.",
  "contact support":
    "Reach alumni support via the Help Center in your dashboard, or email alumni@astu.edu.et. Our team responds within 1 business day.",
};

function getFallback(input: string) {
  const key = input.toLowerCase();
  for (const [pattern, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (key.includes(pattern)) return response;
  }
  return "I can help with profile updates, job searches, tracer surveys, transcripts, mentorship, alumni networking, and career events. Try one of the quick action buttons below!";
}

async function askAssistant(userMessage: string, history: ChatMessage[]) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const messages: ChatApiMessage[] = [
    ...history.map((m) => ({
      role: m.sender === "user" ? "user" as const : "assistant" as const,
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch(`${apiBaseUrl}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage, messages }),
  });

  if (!response.ok) throw new Error("Chat API error");
  const data = await response.json();
  const reply = data.data?.response;
  return typeof reply === "string" && reply.trim()
    ? reply
    : getFallback(userMessage);
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: [COLORS.navy, COLORS.green, COLORS.gold][i],
            display: "inline-block",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            boxShadow: `0 0 6px ${[COLORS.navy, COLORS.green, COLORS.gold][i]}60`,
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.sender === "user";
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
        {isUser ? "You" : "🤖"}
      </div>

      <div style={{
        maxWidth: "75%",
        background: isUser
          ? `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`
          : "#fff",
        color: isUser ? "#fff" : "#1a1a2e",
        borderRadius: 16,
        borderBottomLeftRadius: isUser ? 16 : 4,
        borderBottomRightRadius: isUser ? 4 : 16,
        padding: "12px 16px",
        border: isUser ? "none" : "1px solid #e2e8f4",
        boxShadow: isUser
          ? `0 4px 12px ${COLORS.navy}30`
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
        <p style={{
          fontSize: 11, marginTop: 6, marginBottom: 0,
          color: isUser ? "rgba(255,255,255,0.55)" : "#9aa3b8",
          textAlign: isUser ? "right" : "left",
        }}>
          {msg.timestamp}
          {msg.isAI && (
            <span style={{
              marginLeft: 6, opacity: 0.7,
              background: isUser ? "rgba(255,255,255,0.15)" : COLORS.gold + "20",
              color: isUser ? "#fff" : COLORS.gold,
              padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 600,
            }}>AI</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function ASTUCareerCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm your ASTU Career Copilot 👋\n\nI'm powered by AI to help you with jobs, mentorship, documents, tracer surveys, and more. How can I assist you today?",
      sender: "bot",
      timestamp: nowTime(),
      isAI: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
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
    setShowQuickReplies(false);

    try {
      const history = messages.slice(-6);
      const responseText = await askAssistant(trimmed, history);
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
      text: "Hello! I'm your ASTU Career Copilot 👋\n\nI'm powered by AI to help you with jobs, mentorship, documents, tracer surveys, and more. How can I assist you today?",
      sender: "bot",
      timestamp: nowTime(),
      isAI: true,
    }]);
    setShowQuickReplies(true);
    setUnreadCount(0);
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
        .qr-btn {
          transition: all 0.2s ease;
          border: 1.5px solid ${COLORS.navy};
          background: linear-gradient(135deg, #eef3fa, #e8edf8);
        }
        .qr-btn:hover {
          background: linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight}) !important;
          color: #fff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${COLORS.navy}40;
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

      {/* Floating Action Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        aria-label={isOpen ? "Close chat" : "Open ASTU Career Copilot"}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
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
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <div style={{
          position: "absolute", inset: -3, borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight}, ${COLORS.green})`,
          opacity: 0.3, animation: "floatSlow 3s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 26, lineHeight: 1, position: "relative", zIndex: 1 }}>
          {isOpen ? "✕" : "💬"}
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

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 100, right: 24, zIndex: 9998,
            width: 400, maxWidth: "calc(100vw - 48px)",
            height: isMinimized ? 68 : 580,
            maxHeight: "calc(100vh - 130px)",
            borderRadius: 24,
            background: "#fff",
            border: "1px solid rgba(200,150,42,0.15)",
            boxShadow: `0 12px 60px ${COLORS.navy}25, 0 4px 16px rgba(0,0,0,0.08)`,
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
              fontSize: 22, flexShrink: 0,
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}>🤖</div>

            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#fff", fontSize:15, fontWeight:700, letterSpacing:"0.3px" }}>
                  ASTU Career Copilot
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
                { icon:"🗑️", title:"Clear chat", action: clearChat },
                { icon: isMinimized ? "⬆️" : "⬇️", title: isMinimized ? "Expand" : "Minimize", action: () => setIsMinimized(!isMinimized) },
              ].map(({ icon, title, action }) => (
                <button key={title} onClick={action} title={title} className="action-btn"
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background:"rgba(255,255,255,0.10)",
                    border:"0.5px solid rgba(255,255,255,0.18)",
                    color:"#fff", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, transition:"all 0.15s",
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
                background: "linear-gradient(180deg, #f0f4fe 0%, #f4f7fc 50%, #f8faff 100%)",
              }} className="chatbot-messages">
                {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

                {isTyping && (
                  <div style={{
                    display:"flex", gap:10, alignItems:"flex-end",
                    animation:"fadeSlideIn 0.3s ease",
                  }}>
                    <div style={{
                      width:34, height:34, borderRadius:"50%", flexShrink:0,
                      background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
                      fontSize:15, color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow: `0 2px 8px ${COLORS.navy}40`,
                    }}>🤖</div>
                    <div style={{
                      background:"#fff", borderRadius:16, borderBottomLeftRadius:4,
                      padding:"10px 16px", border:"1px solid #e2e8f4",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {showQuickReplies && (
                <div style={{
                  padding:"10px 14px", background:"#fff",
                  borderTop:"1px solid #edf0f8",
                  display:"flex", flexWrap:"wrap", gap:6,
                }}>
                  <div style={{
                    width:"100%", fontSize:11, color:"#8a94b0",
                    marginBottom:4, fontWeight:600, letterSpacing:"0.5px",
                    textTransform: "uppercase",
                  }}>
                    Quick actions:
                  </div>
                  {QUICK_REPLIES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => sendMessage(r.q)}
                      className="qr-btn"
                      disabled={isTyping}
                      style={{
                        fontSize:12, padding:"6px 12px", borderRadius:22,
                        color: COLORS.navy,
                        cursor:"pointer",
                        display:"flex", alignItems:"center", gap:5,
                        whiteSpace:"nowrap", fontWeight:600,
                        opacity: isTyping ? 0.5 : 1,
                      }}
                    >
                      <span>{r.icon}</span> {r.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div style={{
                padding:"12px 14px", background:"#fff",
                borderTop:"1px solid #edf0f8",
                display:"flex", gap:8, alignItems:"center", flexShrink:0,
              }}>
                {!showQuickReplies && (
                  <button
                    onClick={() => setShowQuickReplies(true)}
                    title="Show quick actions"
                    style={{
                      width:36, height:36, borderRadius:12,
                      background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                      border:"none",
                      color:"#fff", cursor:"pointer",
                      fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                      boxShadow: `0 2px 8px ${COLORS.gold}40`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  >⚡</button>
                )}

                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask about jobs, surveys, mentors…"
                  disabled={isTyping}
                  className="chat-input"
                  style={{
                    flex:1, fontSize:14, padding:"10px 14px",
                    borderRadius:12, border:"1.5px solid #dde3f0",
                    background:"#f4f7fc", color:"#1a1a2e",
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
                >➤</button>
              </div>

              {/* Powered by footer */}
              <div style={{
                textAlign:"center", padding:"6px 14px 10px",
                background: `linear-gradient(180deg, #fff, #f8faff)`,
                borderTop:"1px solid #f0f3fa", flexShrink:0,
              }}>
                <span style={{
                  fontSize:11, color:"#9aa3b8", fontWeight:500,
                  background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.green})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  ASTU Alumni Portal Assistant
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
