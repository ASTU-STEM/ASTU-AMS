import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { employerService } from '../services/employer.service';
import { io } from 'socket.io-client';
import { authService } from '../../auth/services/auth.service';

interface Conversation {
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  alumniPhoto: string | null;
  department: string;
  messages: {
    id: string;
    sender: string;
    text: string;
    isRead: boolean;
    createdAt: string;
  }[];
}

interface MessagingTabProps {
  darkMode: boolean;
}

export const MessagingTab: React.FC<MessagingTabProps> = ({ darkMode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr);
        if (currentUser && currentUser.id) {
          const socket = io('http://localhost:5000');
          socket.emit('register', currentUser.id);

          socket.on('newMessage', (msg) => {
            // We received a message. Reload conversations to reflect new state
            loadConversations();
          });

          return () => {
            socket.disconnect();
          };
        }
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await employerService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConvo) {
        setActiveConvo(data[0]);
      } else if (activeConvo) {
        const updated = data.find((c: Conversation) => c.alumniId === activeConvo.alumniId);
        if (updated) setActiveConvo(updated);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConvo) return;

    setIsSending(true);
    try {
      await employerService.sendDirectMessage(activeConvo.alumniId, typedMessage.trim());
      setTypedMessage('');
      await loadConversations();
    } catch (err: any) {
      toast.error('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const getLastMessage = (convo: Conversation) => convo.messages[convo.messages.length - 1];
  const unreadCount = (convo: Conversation) => convo.messages.filter(m => !m.isRead && m.sender !== 'EMPLOYER').length;

  return (
    <div className={`flex flex-col md:flex-row rounded-3xl border shadow-sm overflow-hidden h-[calc(100vh-160px)] md:h-[600px] ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
      }`}>

      {/* Conversation sidebar */}
      <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'} ${darkMode ? 'border-slate-800' : 'border-gray-200/60'}`}>
        <div className="p-4 border-b border-gray-150">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-astu-navy">forum</span>
            Conversations
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-astu-navy border-t-transparent"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">chat_bubble_outline</span>
              <p className="text-xs text-gray-500">No conversations yet.</p>
              <p className="text-[10px] text-gray-400 mt-1">Send a message from Talent Search to start a conversation.</p>
            </div>
          ) : (
            conversations.map(convo => {
              const last = getLastMessage(convo);
              const isActive = activeConvo?.alumniId === convo.alumniId;
              const unread = unreadCount(convo);
              return (
                <button
                  key={convo.alumniId}
                  onClick={() => setActiveConvo(convo)}
                  className={`w-full p-3 flex items-center gap-3 text-left transition-all hover:bg-gray-50 ${isActive ? (darkMode ? 'bg-slate-800' : 'bg-blue-50/60') : ''
                    } ${darkMode ? 'hover:bg-slate-800' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    {convo.alumniPhoto ? (
                      <img src={convo.alumniPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-astu-navy/15 flex items-center justify-center text-astu-navy font-bold text-xs">
                        {getInitials(convo.alumniName)}
                      </div>
                    )}
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{convo.alumniName}</p>
                    <p className={`text-[10px] truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {last ? last.text.slice(0, 50) : 'No messages yet'}
                    </p>
                  </div>
                  {last && (
                    <span className={`text-[9px] flex-shrink-0 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      {new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat pane */}
      <div className={`flex-1 flex flex-col ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
        {activeConvo ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConvo(null)} 
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Back to conversations"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-astu-navy/15 flex items-center justify-center text-astu-navy font-bold">
                  {getInitials(activeConvo.alumniName)}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{activeConvo.alumniName}</h4>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {activeConvo.department} • {activeConvo.alumniEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {activeConvo.messages.map((msg) => {
                const isMe = msg.sender === 'EMPLOYER';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-4 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed ${isMe
                        ? 'bg-astu-navy text-white rounded-tr-none'
                        : (darkMode ? 'bg-slate-800 border-slate-700 rounded-tl-none' : 'bg-gray-100 border-gray-200 rounded-tl-none')
                      }`}>
                      <p className="font-bold">{isMe ? 'You' : activeConvo.alumniName}</p>
                      <p>{msg.text}</p>
                      <span className={`text-[9px] block text-right font-semibold ${isMe ? 'text-slate-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-150 flex gap-2">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type your message here..."
                className={`flex-1 text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-astu-navy/20 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                required
              />
              <button
                type="submit"
                disabled={isSending}
                className="px-5 bg-astu-navy hover:bg-astu-navy/90 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-70"
              >
                {isSending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-md">send</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-gray-200 mb-4 block">mark_chat_unread</span>
              <p className="text-sm font-bold text-gray-400">Select a conversation</p>
              <p className="text-xs text-gray-400 mt-1">Or start one from the Talent Search tab</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
