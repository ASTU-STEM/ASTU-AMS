import React, { useState } from 'react';

interface AlumniMessage {
  id: number;
  sender: 'Alumni' | 'Recruiter' | 'System';
  senderName: string;
  text: string;
  timestamp: string;
}

interface MessagingTabProps {
  darkMode: boolean;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode }) => {
  const [activeThread, setActiveThread] = useState('recruiter');
  const [messages, setMessages] = useState<AlumniMessage[]>([
    { id: 1, sender: 'Recruiter', senderName: 'Hilina Sileshi (HR Manager)', text: 'Hello! We reviewed your profile and matches for the Senior developer opening. Are you available for a brief introductory call tomorrow?', timestamp: '09:30 AM' },
    { id: 2, sender: 'Alumni', senderName: 'You', text: 'Hi Hilina! Yes, absolutely. I am available anytime after 2:00 PM.', timestamp: '10:05 AM' },
    { id: 3, sender: 'Recruiter', senderName: 'Hilina Sileshi (HR Manager)', text: 'Excellent! Let\'s schedule it for 2:30 PM. I\'ll send over a calendar invite soon.', timestamp: '10:15 AM' }
  ]);
  const [typedMessage, setTypedMessage] = useState('');
  const threads = [
    { id: 'recruiter', label: 'Recruiter', desc: 'Job interview and placement follow-up', initials: 'HS' },
    { id: 'registrar', label: 'Registrar', desc: 'Transcript and verification updates', initials: 'RG' },
    { id: 'mentor', label: 'Mentor', desc: 'Career guidance and booking notes', initials: 'MN' },
  ];

  const quickReplies = ['I am available after 2:00 PM.', 'Please send the document checklist.', 'Can we schedule a mentorship session?'];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg: AlumniMessage = {
      id: Date.now(),
      sender: 'Alumni',
      senderName: 'You',
      text: typedMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setTypedMessage('');

    // Mock quick reply
    setTimeout(() => {
      const automaticReply: AlumniMessage = {
        id: Date.now() + 1,
        sender: 'Recruiter',
        senderName: 'Hilina Sileshi (HR Manager)',
        text: 'Got it. Talk to you then!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, automaticReply]);
    }, 1500);
  };

  return (
    <div className={`grid min-h-[620px] grid-cols-1 overflow-hidden rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 lg:grid-cols-[280px_1fr] ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
    }`}>
      <aside className="border-b border-gray-150 bg-gray-50 p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Internal Messages</h3>
          <p className="mt-1 text-xs text-gray-500">Recruiter, registrar, mentor, and system conversations.</p>
        </div>
        <div className="space-y-2">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => {
                setActiveThread(thread.id);
                setMessages(prev => [
                  ...prev,
                  { id: Date.now(), sender: 'System', senderName: 'ASTU AMS', text: `Switched to ${thread.label} thread.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                ]);
              }}
              className={`w-full rounded-[10px] border p-3 text-left transition-all ${activeThread === thread.id ? 'border-astu-navy bg-white shadow-sm' : 'border-gray-200 bg-transparent hover:bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-astu-navy/10 text-xs font-bold text-astu-navy">{thread.initials}</span>
                <span>
                  <span className="block text-xs font-bold">{thread.label}</span>
                  <span className="block text-[10px] text-gray-500">{thread.desc}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <div className="flex min-h-[620px] flex-col">
      {/* Thread Header */}
      <div className="flex items-center justify-between border-b border-gray-150 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-astu-navy/15 flex items-center justify-center text-astu-navy font-bold shadow-sm">
            HS
          </div>
          <div>
            <h4 className="font-bold text-sm">Hilina Sileshi (HR Recruiter)</h4>
            <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Safir Technologies Recruiter</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender === 'Alumni';
          return (
            <div 
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md p-4 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed ${
                isMe 
                  ? 'bg-astu-navy text-white rounded-tr-none' 
                  : (darkMode ? 'bg-slate-800 border-slate-700 rounded-tl-none' : 'bg-gray-100 border-gray-200 rounded-tl-none')
              }`}>
                <p className="font-bold">{isMe ? 'You' : msg.senderName}</p>
                <p>{msg.text}</p>
                <span className={`text-[9px] block text-right font-semibold ${isMe ? 'text-slate-200' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input Form */}
      <form 
        onSubmit={handleSend}
        className="border-t border-gray-150 p-4"
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {quickReplies.map(reply => (
            <button
              key={reply}
              type="button"
              onClick={() => setTypedMessage(reply)}
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-white"
            >
              {reply}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Type message to HR manager..."
          className={`flex-1 text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}
          required
        />
        <button
          type="submit"
          className="px-5 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl font-bold flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-md">send</span>
        </button>
        </div>
      </form>
      </div>
    </div>
  );
};
