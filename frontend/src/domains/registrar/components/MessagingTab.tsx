import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, BellRing, CheckCircle2, Filter, Megaphone, MessageSquare, Search, Send, ShieldCheck, Users } from 'lucide-react';

interface RegistrarMessage {
  id: number;
  recipient: string;
  subject: string;
  text: string;
  timestamp: string;
  isBroadcast: boolean;
  channel: 'Portal' | 'Email' | 'SMS' | 'Portal + Email';
  priority: 'Normal' | 'High' | 'Urgent';
  status: 'Queued' | 'Delivered' | 'Read';
}

interface MessagingTabProps {
  darkMode: boolean;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode }) => {
  const [messages, setMessages] = useState<RegistrarMessage[]>([]);

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [channel, setChannel] = useState<RegistrarMessage['channel']>('Portal + Email');
  const [priority, setPriority] = useState<RegistrarMessage['priority']>('Normal');
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Broadcast' | 'Direct'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const templates = [
    { label: 'Tracer Reminder', subject: 'Tracer Survey Action Required', text: 'Please submit your current employment, salary range, and location update for ASTU accreditation reporting.', priority: 'High' as const },
    { label: 'Document Ready', subject: 'Digital Document Ready', text: 'Your requested transcript/certificate has been verified, digitally signed, and is ready for download.', priority: 'Normal' as const },
    { label: 'Exit Survey', subject: 'Graduation Exit Survey', text: 'Complete the mandatory exit survey to activate alumni services, job board access, and document requests.', priority: 'High' as const },
  ];

  const filteredMessages = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return messages.filter((msg) => {
      const matchesType =
        historyFilter === 'All' ||
        (historyFilter === 'Broadcast' && msg.isBroadcast) ||
        (historyFilter === 'Direct' && !msg.isBroadcast);
      const matchesSearch =
        !normalized ||
        `${msg.recipient} ${msg.subject} ${msg.text} ${msg.channel} ${msg.priority} ${msg.status}`.toLowerCase().includes(normalized);

      return matchesType && matchesSearch;
    });
  }, [historyFilter, messages, searchQuery]);

  const deliveryStats = [
    { label: 'Queued', value: messages.filter((msg) => msg.status === 'Queued').length.toString(), icon: BellRing },
    { label: 'Delivered', value: `${Math.round((messages.filter((msg) => msg.status !== 'Queued').length / messages.length) * 100)}%`, icon: CheckCircle2 },
    { label: 'Broadcasts', value: messages.filter((msg) => msg.isBroadcast).length.toString(), icon: Megaphone },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !text.trim()) {
      toast.error('Recipient and message content are required.');
      return;
    }

    const newMsg: RegistrarMessage = {
      id: Date.now(),
      recipient: recipient.trim(),
      subject: subject.trim() || (isBroadcast ? 'Broadcast Alert' : 'Verification Update'),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBroadcast,
      channel,
      priority,
      status: channel === 'SMS' ? 'Queued' : 'Delivered'
    };

    setMessages(prev => [newMsg, ...prev]);
    toast.success(isBroadcast ? 'Broadcast announcement published successfully!' : 'Direct message sent to graduate.');

    setRecipient('');
    setSubject('');
    setText('');
  };

  const priorityClass = (value: RegistrarMessage['priority']) => {
    if (value === 'Urgent') return 'bg-red-100 text-red-700 border-red-200';
    if (value === 'High') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="space-y-4">
      <section className={`overflow-hidden rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="border-b border-[var(--border-color)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-astu-navy/10 text-astu-navy">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Internal Messaging Center</h3>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">
                  Send targeted registrar notices to graduates, departments, and alumni batches with clear delivery tracking.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {deliveryStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`rounded-[8px] border px-3 py-2 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
                    <Icon className="mx-auto mb-1 h-4 w-4 text-astu-navy" />
                    <p className="text-sm font-bold text-[var(--text-primary)]">{item.value}</p>
                    <p className="text-[10px] font-semibold text-[var(--text-secondary)]">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSend} className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: 'Direct Message', helper: 'One graduate or staff member', icon: Users, broadcast: false },
                { label: 'Broadcast', helper: 'Batch, department, or all alumni', icon: Megaphone, broadcast: true },
              ].map((option) => {
                const Icon = option.icon;
                const selected = isBroadcast === option.broadcast;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      setIsBroadcast(option.broadcast);
                      setRecipient(option.broadcast ? 'All Alumni Database' : '');
                    }}
                    className={`rounded-[8px] border p-3 text-left transition-all ${
                      selected
                        ? 'border-astu-navy bg-astu-navy/5 ring-2 ring-astu-navy/10'
                        : darkMode
                          ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                          : 'border-gray-200 bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-astu-navy" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">{option.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)]">{option.helper}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  Recipient / Target Group
                </label>
                <input
                  type="text"
                  placeholder={isBroadcast ? 'All graduates' : 'Enter Student ID or full name'}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className={`w-full rounded-[8px] border p-3 text-xs text-[var(--text-primary)] outline-none transition-all focus:ring-2 focus:ring-astu-navy/20 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200 focus:bg-white'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Message subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full rounded-[8px] border p-3 text-xs text-[var(--text-primary)] outline-none transition-all focus:ring-2 focus:ring-astu-navy/20 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                Message Content
              </label>
              <textarea
                rows={6}
                placeholder="Type announcement or message details"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full resize-none rounded-[8px] border p-3 text-xs leading-5 text-[var(--text-primary)] outline-none transition-all focus:ring-2 focus:ring-astu-navy/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200 focus:bg-white'
                }`}
                required
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-semibold text-[var(--text-secondary)]">
                <span>{text.length}/500 characters</span>
                <span className={text.length > 420 ? 'text-amber-600' : ''}>Keep official notices concise and auditable.</span>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className={`rounded-[8px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
              <h4 className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                <ShieldCheck className="h-4 w-4 text-astu-green" />
                Delivery Settings
              </h4>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as RegistrarMessage['channel'])}
                    className={`w-full rounded-[8px] border p-2.5 text-xs outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                      darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    <option>Portal + Email</option>
                    <option>Portal</option>
                    <option>Email</option>
                    <option>SMS</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RegistrarMessage['priority'])}
                    className={`w-full rounded-[8px] border p-2.5 text-xs outline-none focus:ring-2 focus:ring-astu-navy/20 ${
                      darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`rounded-[8px] border p-4 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Quick Templates</h4>
              <div className="mt-3 space-y-2">
                {templates.map(template => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => {
                      setSubject(template.subject);
                      setText(template.text);
                      setPriority(template.priority);
                      toast.success(`${template.label} template loaded.`);
                    }}
                    className={`w-full rounded-[8px] border px-3 py-2 text-left text-[11px] font-bold transition-all ${
                      darkMode ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-gray-200 bg-white text-gray-700 hover:border-astu-navy/30'
                    }`}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-astu-navy px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-astu-navy/90 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!recipient.trim() || !text.trim()}
            >
              <Send className="h-4 w-4" />
              {isBroadcast ? 'Publish Broadcast Alert' : 'Send Message'}
            </button>
          </aside>
        </form>
      </section>

      <div className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Outbox & Broadcast History</h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Review sent notices, queued messages, and recipient groups.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className={`flex h-9 items-center gap-2 rounded-[8px] border px-3 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
              <Search className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history"
                className="w-44 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
              />
            </label>
            <label className={`flex h-9 items-center gap-2 rounded-[8px] border px-3 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-200 bg-gray-50'}`}>
              <Filter className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as 'All' | 'Broadcast' | 'Direct')}
                className="bg-transparent text-xs font-semibold text-[var(--text-primary)] outline-none"
              >
                <option>All</option>
                <option>Broadcast</option>
                <option>Direct</option>
              </select>
            </label>
          </div>
        </div>
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`flex flex-col items-start justify-between gap-4 rounded-[10px] border p-4 md:flex-row md:items-center ${
              darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-gray-50/50 border-gray-150'
            }`}>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    msg.isBroadcast ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {msg.isBroadcast ? 'Broadcast' : 'Direct Message'}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${priorityClass(msg.priority)}`}>
                    {msg.priority}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">{msg.channel}</span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">To: {msg.recipient}</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{msg.subject}</h4>
                <p className="max-w-3xl text-xs leading-5 text-[var(--text-secondary)]">{msg.text}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                  msg.status === 'Queued' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {msg.status === 'Queued' ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {msg.status}
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)]">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className={`rounded-[10px] border border-dashed p-8 text-center ${darkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              <p className="text-sm font-semibold text-[var(--text-primary)]">No messages match this view.</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Try a different search term or filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
