import { useState, useRef, useEffect } from "react";

// ─── ASTU Color Palette ───────────────────────────────────────────────────────
// Navy:  #003087  Green: #006B3C  Gold: #C8962A  Red: #C0392B

const COLORS = {
  navy: "#003087",
  navyDark: "#002060",
  navyLight: "#0A3E9E",
  green: "#006B3C",
  greenLight: "#008B4C",
  gold: "#C8962A",
  goldLight: "#E0A830",
  red: "#C0392B",
};

// ─── Quick Reply Buttons ──────────────────────────────────────────────────────
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

// ─── Fallback responses (used when API is unavailable) ────────────────────────
const FALLBACK_RESPONSES = {
  "update my profile":
    "Go to your Dashboard → Profile tab to update your education, work experience, and skills. A complete profile increases your job match rate by up to 40%!",
  "find job":
    "Navigate to the Career Center or Jobs tab in your dashboard. Filter by location, salary range, and department. We update listings daily from 500+ partner organizations.",
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

function getFallback(input) {
  const key = input.toLowerCase();
  for (const [pattern, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (key.includes(pattern)) return response;
  }
  return "I can help with profile updates, job searches, tracer surveys, transcripts, mentorship, alumni networking, and career events. Try one of the quick action buttons below!";
}

// ─── Claude API call ──────────────────────────────────────────────────────────
async function askClaude(userMessage, history) {
  const systemPrompt = `You are the ASTU Career Copilot, an AI assistant for Adama Science and Technology University (ASTU) in Ethiopia. You help alumni and students with:
- Career opportunities and job searching
- Profile and dashboard navigation
- Tracer surveys (6-month post-graduation study)
- Document requests (transcripts, certificates)
- Mentorship programs
- Alumni network and events
- General university services

Keep responses concise (2-4 sentences), friendly, and action-oriented. Always guide users toward the specific dashboard tab or action they need. Use occasional relevant emojis. If asked something outside your scope, kindly redirect to alumni@astu.edu.et.`;

  const messages = [
    ...history.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) throw new Error("API error");
  const data = await response.json();
  return data.content?.[0]?.text || getFallback(userMessage);
}

// ─── Timestamp helper ─────────────────────────────────────────────────────────
function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: [COLORS.navy, COLORS.green, COLORS.gold][i],
            display: "inline-block",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.sender === "user";
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-end",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "fadeSlideIn 0.25s ease",
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: isUser ? COLORS.green : COLORS.navy,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: "#fff", fontWeight: 600,
        border: `2px solid ${isUser ? COLORS.greenLight : COLORS.navyLight}`,
      }}>
        {isUser ? "You" : "🤖"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "72%",
        background: isUser ? COLORS.navy : "#fff",
        color: isUser ? "#fff" : "#1a1a2e",
        borderRadius: 14,
        borderBottomLeftRadius: isUser ? 14 : 3,
        borderBottomRightRadius: isUser ? 3 : 14,
        padding: "10px 14px",
        border: isUser ? "none" : "1px solid #e2e8f4",
        boxShadow: isUser ? "0 2px 8px rgba(0,48,135,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
        <p style={{
          fontSize: 10, marginTop: 5, marginBottom: 0,
          color: isUser ? "rgba(255,255,255,0.55)" : "#9aa3b8", textAlign: isUser ? "right" : "left",
        }}>
          {msg.timestamp}
          {msg.isAI && <span style={{ marginLeft: 4, opacity: 0.7 }}>· AI</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────
export default function ASTUCareerCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Reset unread when opened
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { id: Date.now(), text: trimmed, sender: "user", timestamp: nowTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowQuickReplies(false);

    try {
      const history = messages.slice(-6); // Send last 6 messages for context
      const responseText = await askClaude(trimmed, history);
      const botMsg = {
        id: Date.now() + 1,
        text: responseText,
        sender: "bot",
        timestamp: nowTime(),
        isAI: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch {
      // Graceful fallback
      const botMsg = {
        id: Date.now() + 1,
        text: getFallback(trimmed),
        sender: "bot",
        timestamp: nowTime(),
        isAI: false,
      };
      setMessages((prev) => [...prev, botMsg]);
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
      {/* ── CSS keyframes injected globally ── */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,150,42,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(200,150,42,0); }
        }
        .qr-btn:hover { background: ${COLORS.navy} !important; color: #fff !important; }
        .action-btn:hover { opacity: 0.82; }
        .send-btn:not(:disabled):hover { background: ${COLORS.green} !important; }
        .chat-input:focus { outline: none; border-color: ${COLORS.navy} !important; box-shadow: 0 0 0 3px rgba(0,48,135,0.12); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,48,135,0.2); border-radius: 4px; }
      `}</style>

      {/* ── Floating Action Button ── */}
      <button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        aria-label={isOpen ? "Close chat" : "Open ASTU Career Copilot"}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 60, height: 60, borderRadius: "50%",
          background: isOpen ? COLORS.red : COLORS.navy,
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,48,135,0.35)",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          transform: "scale(1)",
          animation: !isOpen ? "pulse 2.5s infinite" : "none",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <span style={{ fontSize: 24, lineHeight: 1 }}>{isOpen ? "✕" : "💬"}</span>
        {!isOpen && unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            width: 18, height: 18, borderRadius: "50%",
            background: COLORS.red, color: "#fff",
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 96, right: 24, zIndex: 9998,
            width: 390, maxWidth: "calc(100vw - 48px)",
            height: isMinimized ? 64 : 560,
            maxHeight: "calc(100vh - 120px)",
            borderRadius: 20,
            background: "#fff",
            border: "1px solid #dde3f0",
            boxShadow: "0 8px 40px rgba(0,48,135,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            transition: "height 0.3s ease",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: COLORS.navy,
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            {/* Decorative circles */}
            <div style={{ position:"absolute", top:-20, right:-20, width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ position:"absolute", bottom:-28, right:30, width:70, height:70, borderRadius:"50%", background:"rgba(200,150,42,0.10)" }} />

            {/* Bot avatar */}
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>🤖</div>

            {/* Title */}
            <div style={{ flex: 1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ color:"#fff", fontSize:14, fontWeight:600 }}>ASTU Career Copilot</span>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
              </div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11, marginTop:2 }}>
                Adama Science &amp; Technology University
              </div>
            </div>

            {/* Header action buttons */}
            <div style={{ display:"flex", gap:5, zIndex:1 }}>
              {[
                { icon:"🗑️", title:"Clear chat", action: clearChat },
                { icon: isMinimized ? "⬆️" : "⬇️", title: isMinimized ? "Expand" : "Minimize", action: () => setIsMinimized(!isMinimized) },
              ].map(({ icon, title, action }) => (
                <button key={title} onClick={action} title={title} className="action-btn"
                  style={{
                    width:30, height:30, borderRadius:8,
                    background:"rgba(255,255,255,0.10)",
                    border:"0.5px solid rgba(255,255,255,0.20)",
                    color:"#fff", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, transition:"opacity 0.15s",
                  }}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* ── ASTU tricolor stripe ── */}
          <div style={{
            height: 3, flexShrink: 0,
            background: `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.green} 50%, ${COLORS.gold} 100%)`,
          }} />

          {!isMinimized && (
            <>
              {/* ── Messages area ── */}
              <div style={{
                flex: 1, overflowY:"auto", padding:"14px",
                display:"flex", flexDirection:"column", gap:10,
                background:"#f4f7fc",
              }}>
                {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

                {/* Typing indicator */}
                {isTyping && (
                  <div style={{ display:"flex", gap:8, alignItems:"flex-end", animation:"fadeSlideIn 0.25s ease" }}>
                    <div style={{
                      width:32, height:32, borderRadius:"50%", flexShrink:0,
                      background: COLORS.navy, fontSize:14, color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>🤖</div>
                    <div style={{
                      background:"#fff", borderRadius:14, borderBottomLeftRadius:3,
                      padding:"8px 14px", border:"1px solid #e2e8f4",
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Replies ── */}
              {showQuickReplies && (
                <div style={{
                  padding:"8px 12px", background:"#fff",
                  borderTop:"1px solid #edf0f8",
                  display:"flex", flexWrap:"wrap", gap:5,
                }}>
                  <div style={{ width:"100%", fontSize:11, color:"#8a94b0", marginBottom:3, fontWeight:500 }}>
                    Quick actions:
                  </div>
                  {QUICK_REPLIES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => sendMessage(r.q)}
                      className="qr-btn"
                      disabled={isTyping}
                      style={{
                        fontSize:11, padding:"5px 10px", borderRadius:20,
                        border:`1px solid ${COLORS.navy}`,
                        color: COLORS.navy, background:"#eef3fa",
                        cursor:"pointer", transition:"all 0.15s",
                        display:"flex", alignItems:"center", gap:4,
                        whiteSpace:"nowrap", fontWeight:500,
                        opacity: isTyping ? 0.5 : 1,
                      }}
                    >
                      <span>{r.icon}</span> {r.label}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input bar ── */}
              <div style={{
                padding:"10px 12px", background:"#fff",
                borderTop:"1px solid #edf0f8",
                display:"flex", gap:8, alignItems:"center", flexShrink:0,
              }}>
                {/* Show quick replies toggle */}
                {!showQuickReplies && (
                  <button
                    onClick={() => setShowQuickReplies(true)}
                    title="Show quick actions"
                    style={{
                      width:34, height:34, borderRadius:10, border:`1px solid ${COLORS.navy}`,
                      background:"#eef3fa", color:COLORS.navy, cursor:"pointer",
                      fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                    }}
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
                    flex:1, fontSize:13, padding:"9px 12px",
                    borderRadius:10, border:"1px solid #dde3f0",
                    background:"#f4f7fc", color:"#1a1a2e",
                    transition:"border-color 0.2s, box-shadow 0.2s",
                  }}
                />

                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="send-btn"
                  style={{
                    width:36, height:36, borderRadius:10,
                    background: COLORS.navy, border:"none",
                    color:"#fff", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16, flexShrink:0, transition:"background 0.2s",
                    opacity: (!input.trim() || isTyping) ? 0.4 : 1,
                  }}
                >➤</button>
              </div>

              {/* ── Powered by footer ── */}
              <div style={{
                textAlign:"center", padding:"5px 12px 8px",
                fontSize:10, color:"#9aa3b8", background:"#fff",
                borderTop:"1px solid #f0f3fa", flexShrink:0,
              }}>
                Powered by Claude AI · ASTU Alumni Portal
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}