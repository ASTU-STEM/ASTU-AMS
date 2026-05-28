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
  const [messages, setMessages] = useState<AlumniMessage[]>([
    { id: 1, sender: 'Recruiter', senderName: 'Hilina Sileshi (HR Manager)', text: 'Hello! We reviewed your profile and matches for the Senior developer opening. Are you available for a brief introductory call tomorrow?', timestamp: '09:30 AM' },
    { id: 2, sender: 'Alumni', senderName: 'You', text: 'Hi Hilina! Yes, absolutely. I am available anytime after 2:00 PM.', timestamp: '10:05 AM' },
    { id: 3, sender: 'Recruiter', senderName: 'Hilina Sileshi (HR Manager)', text: 'Excellent! Let\'s schedule it for 2:30 PM. I\'ll send over a calendar invite soon.', timestamp: '10:15 AM' }
  ]);
  const [typedMessage, setTypedMessage] = useState('');

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
    <div className={`max-w-3xl mx-auto border rounded-3xl shadow-sm transition-all duration-300 flex flex-col h-[550px] overflow-hidden ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
    }`}>
      {/* Thread Header */}
      <div className="p-4 border-b border-gray-150 flex items-center justify-between">
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
        className="p-4 border-t border-gray-150 flex gap-2"
      >
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
      </form>
    </div>
  );
};
