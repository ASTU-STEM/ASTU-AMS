import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface RegistrarMessage {
  id: number;
  recipient: string;
  subject: string;
  text: string;
  timestamp: string;
  isBroadcast: boolean;
}

interface MessagingTabProps {
  darkMode: boolean;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode }) => {
  const [messages, setMessages] = useState<RegistrarMessage[]>([
    { id: 1, recipient: 'Computer Science Batch of 2025', subject: 'Tracer Survey Launch Alert', text: 'All graduates please check your tracer portal and submit your 6-month career statuses.', timestamp: '10:00 AM', isBroadcast: true },
    { id: 2, recipient: 'Abebe Bikila (Student ID: UG/12839/14)', subject: 'Transcript Verification Approved', text: 'Your transcript document request has been processed and digitally signed by the Registrar Dean.', timestamp: 'Yesterday', isBroadcast: false }
  ]);

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const templates = [
    { label: 'Tracer Reminder', subject: 'Tracer Survey Action Required', text: 'Please submit your current employment, salary range, and location update for ASTU accreditation reporting.' },
    { label: 'Document Ready', subject: 'Digital Document Ready', text: 'Your requested transcript/certificate has been verified, digitally signed, and is ready for download.' },
    { label: 'Exit Survey', subject: 'Graduation Exit Survey', text: 'Complete the mandatory exit survey to activate alumni services, job board access, and document requests.' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !text.trim()) return;

    const newMsg: RegistrarMessage = {
      id: Date.now(),
      recipient: recipient.trim(),
      subject: subject.trim() || (isBroadcast ? 'Broadcast Alert' : 'Verification Update'),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBroadcast
    };

    setMessages(prev => [newMsg, ...prev]);
    toast.success(isBroadcast ? 'Broadcast announcement published successfully!' : 'Direct message sent to graduate.');

    setRecipient('');
    setSubject('');
    setText('');
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Broadcast & Direct Messaging</h3>
            <p className="mt-1 text-xs text-slate-400">Send tracer reminders, document notices, and accreditation communications.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Queued', value: '18' },
              { label: 'Delivered', value: '94%' },
              { label: 'SMS Ready', value: 'On' },
            ].map(item => (
              <div key={item.label} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-sm font-bold text-gray-900">{item.value}</p>
                <p className="text-[10px] font-semibold text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSend} className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 border-b border-gray-150 pb-3">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="radio"
                checked={!isBroadcast}
                onChange={() => {
                  setIsBroadcast(false);
                  setRecipient('');
                }}
                className="text-astu-navy focus:ring-astu-navy"
              />
              Direct Message to Graduate
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="radio"
                checked={isBroadcast}
                onChange={() => {
                  setIsBroadcast(true);
                  setRecipient('All Alumni Database');
                }}
                className="text-astu-navy focus:ring-astu-navy"
              />
              Global Broadcast Announcement
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {templates.map(template => (
              <button
                key={template.label}
                type="button"
                onClick={() => {
                  setSubject(template.subject);
                  setText(template.text);
                  toast.success(`${template.label} template loaded.`);
                }}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-white"
              >
                {template.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Recipient / Target Group
              </label>
              <input
                type="text"
                placeholder={isBroadcast ? 'All graduates' : 'Enter Student ID or Full Name...'}
                value={recipient}
                onChange={(e) => !isBroadcast && setRecipient(e.target.value)}
                disabled={isBroadcast}
                className={`w-full text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Message subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              placeholder="Type announcement or message details..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
              }`}
              required
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-astu-navy hover:bg-astu-navy/90 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              {isBroadcast ? 'Publish Broadcast Alert' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      <div className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <h3 className="mb-4 text-sm font-semibold">Outbox & Broadcast History</h3>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col items-start justify-between gap-4 rounded-[10px] border p-4 md:flex-row md:items-center ${
              darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50/50 border-gray-150'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    msg.isBroadcast ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {msg.isBroadcast ? 'Broadcast' : 'Direct Message'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">To: {msg.recipient}</span>
                </div>
                <h4 className="text-xs font-bold">{msg.subject}</h4>
                <p className="text-xs text-slate-400 max-w-2xl">{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold shrink-0">{msg.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
