import React, { useState } from 'react';
import { Message } from '../types/employer.types';

interface MessagingTabProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  darkMode: boolean;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ messages, onSendMessage, darkMode }) => {
  const [typedMessage, setTypedMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendMessage(typedMessage.trim());
    setTypedMessage('');
  };

  return (
    <div className={`max-w-3xl mx-auto border rounded-3xl shadow-sm transition-all duration-300 flex flex-col h-[550px] overflow-hidden ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
    }`}>
      {/* Thread Header */}
      <div className="p-4 border-b border-gray-150 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-astu-navy/15 flex items-center justify-center text-astu-navy font-bold shadow-sm">
            AB
          </div>
          <div>
            <h4 className="font-bold text-sm">Contact</h4>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Online
        </span>
      </div>

      {/* Message Bubble scroll list */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender === 'Employer';
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
          placeholder="Type your message here..."
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
