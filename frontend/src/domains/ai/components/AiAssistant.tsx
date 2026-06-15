import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader2, Sparkles } from 'lucide-react';
import { aiService } from '../services/ai.service';
import toast from 'react-hot-toast';

interface AiAssistantProps {
  role: 'alumni' | 'employer' | 'registrar';
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ role, isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set a role-specific welcome message on first open
    if (messages.length === 0) {
      let welcomeMsg = 'Hello! I am the ASTU Intelligence Platform. How can I assist you today?';
      if (role === 'alumni') {
        welcomeMsg = 'Welcome, Alumni! I can help you with job matching, finding mentors, or viewing tracer surveys. How can I assist you today?';
      } else if (role === 'employer') {
        welcomeMsg = 'Welcome, Employer! I can assist you with finding graduates, analyzing candidate skills, or posting jobs. How can I help you today?';
      } else if (role === 'registrar') {
        welcomeMsg = 'Welcome, Registrar! I can help analyze tracer study data, verify alumni, and generate placement reports. What would you like to know?';
      }
      setMessages([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, [role, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // In a real implementation, we might pass the role/context to the aiService as well.
      const response = await aiService.chat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      toast.error('Failed to communicate with AI server.');
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Unable to connect to AI.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 w-full md:w-[450px]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] to-indigo-600 p-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">ASTU AI Copilot</h3>
              <p className="text-xs text-indigo-100 opacity-90 capitalize">{role} Mode</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#003366] text-white shadow-sm' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-br-sm' 
                    : 'bg-[#003366] text-white rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2 max-w-[85%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl shadow-sm text-sm bg-[#003366] text-white rounded-bl-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="relative flex items-end shadow-sm border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full max-h-32 min-h-[50px] p-3 pr-12 resize-none outline-none text-sm text-slate-800 bg-transparent"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-[#003366] text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-400">
            ASTU AI can make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </>
  );
};
