import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PREBUILT_QUESTIONS = [
  'What jobs match my profile?',
  'Show me employment trends for my department',
  'What skills are in highest demand?',
  'Which companies hire ASTU graduates most?',
  'How can I improve my profile visibility?',
  'What tracer surveys are pending for me?',
];

const RESPONSES: Record<string, string> = {
  'what jobs match my profile': 'Based on your profile as a Junior Fullstack Engineer with skills in React, TypeScript, Node.js, and Docker, I found 4 job matches. The top match is a Senior Software Engineer role at Ethio Telecom Innovation Lab with a 92% match score. Consider applying to DataCon Africa for an AI Specialist role (89% match).',
  'show me employment trends for my department': 'For Computer Science and Engineering (graduating class of 2024): Employment rate is 87%, average time-to-hire is 3.2 months, top hiring industries are FinTech (34%), Telecom (22%), and Consulting (18%). Average starting salary: 25,000-40,000 ETB/month.',
  'what skills are in highest demand': 'Top 5 skills requested by employers hiring ASTU graduates: 1. React/Next.js — 68% of job listings, 2. Node.js/Express — 54%, 3. Python/ML — 47%, 4. Cloud/AWS — 41%, 5. Docker/Kubernetes — 35%. Consider adding cloud skills to increase your match score.',
  'which companies hire astu graduates most': 'Top hiring companies for ASTU graduates: 1. Ethio Telecom — 120+ alumni, 2. Safaricom Ethiopia — 85+ alumni, 3. Commercial Bank of Ethiopia — 62 alumni, 4. Chapa Financial — 48 alumni, 5. INSA (Information Network Security Administration) — 41 alumni.',
  'how can i improve my profile visibility': 'Your current profile completion is 81%. To reach 100% and become fully visible to employers: Add your Twitter/X profile, upload a professional profile picture, list 3+ certifications, add 2+ projects with GitHub links, and ensure your salary range is set. Complete profiles get 3x more employer views.',
  'what tracer surveys are pending for me': 'You have 2 pending tracer surveys: 1. "ASTU 12-Month Longitudinal Career Tracer Study" — deadline March 15, 2026 (urgent). 2. "ASTU 24-Month Industry Curriculum Feedback Tracer" — deadline September 30, 2026. Completing these helps your department track employment outcomes for accreditation.',
};

const getResponse = (message: string): string => {
  const lower = message.toLowerCase().trim();
  for (const [key, response] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  if (lower.includes('hello') || lower.includes('hi ') || lower === 'hi') {
    return 'Hello! I am the ASTU-AMS AI Assistant. I can help you with job matches, employment trends, skill analysis, tracer surveys, and more. Try asking me about your profile or available opportunities!';
  }
  return 'I can help answer questions about: job matches, employment trends by department, in-demand skills, top hiring companies, profile improvement tips, and tracer survey status. Please try one of the suggested questions above.';
};

export const AIAssistantTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I am the ASTU-AMS AI Assistant. Ask me anything about your alumni data, job matches, employment trends, or system features. Select a suggested question or type your own!',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: getResponse(text.trim()),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#003580,#0f4f86,#1d9e75)] p-5 text-white md:p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-5 left-[10%] w-2 h-2 rounded-full bg-white/20 animate-pulse" />
          <div className="absolute top-20 right-[30%] w-1.5 h-1.5 rounded-full bg-[#FFD700]/30 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">AI Assistant</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">ASTU-AMS AI Chatbot</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
            Ask natural language questions about employment data, job matches, skill gaps, and alumni trends.
            Powered by RAG (Retrieval Augmented Generation) over the university database.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat Area */}
        <div className="rounded-[16px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="border-b border-[var(--border-color)] px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">AI Career Assistant</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Online</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#003580] text-white rounded-br-md'
                        : 'bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[9px] text-[var(--text-secondary)] mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-[#003580] flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-white text-sm">person</span>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
                <div className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[var(--border-color)] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
                placeholder="Ask a question about your alumni data..."
                className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003580]/20"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className="rounded-xl bg-[#003580] px-4 py-2.5 text-white text-sm font-semibold hover:bg-[#002a55] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="rounded-[16px] border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#003580] text-lg">lightbulb</span>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Suggested Questions</h3>
          </div>
          <div className="space-y-2">
            {PREBUILT_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isTyping}
                className="w-full text-left rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2.5 text-xs text-[var(--text-primary)] hover:border-[#003580]/30 hover:bg-[#003580]/5 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-[10px] font-bold text-amber-800 uppercase">AI Capabilities</p>
            <ul className="mt-2 space-y-1">
              {['Job match analysis', 'Employment trends', 'Skill gap insights', 'Tracer survey status', 'Profile optimization tips', 'Hiring company data'].map((cap, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] text-amber-700">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-3">
            <p className="text-[10px] font-bold text-blue-800 uppercase">Module Reference</p>
            <code className="text-[10px] font-mono text-blue-700">POST /api/ai/chat</code>
            <p className="text-[10px] text-blue-600 mt-1">Admin, Registrar, Dept Head access</p>
          </div>
        </div>
      </div>
    </div>
  );
};
