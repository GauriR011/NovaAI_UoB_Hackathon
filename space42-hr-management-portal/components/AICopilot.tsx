
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, ShieldCheck, Zap, MessageCircle, X, Rocket, Info } from 'lucide-react';
import { Message } from '../types';
import { getCoPilotResponse } from '../services/geminiService';

interface AICopilotProps {
  onClose?: () => void;
}

const AICopilot: React.FC<AICopilotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Space42 HR Co-pilot. I've analyzed our latest pool of candidates. Sarah Jenkins is a standout 98% match. Would you like me to draft an interview invite for her?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await getCoPilotResponse(messages, input);
    
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response || "I'm sorry, I couldn't process that request.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <Rocket className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight">AI Co-pilot</h2>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Core</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-500 hover:text-white border border-transparent hover:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex max-w-[90%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'assistant' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400'
              }`}>
                {msg.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' 
                  ? 'bg-white/[0.03] border border-white/10 text-gray-200 shadow-xl backdrop-blur-sm' 
                  : 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)]'
              }`}>
                {msg.content}
                <div className={`text-[10px] mt-2 font-medium ${msg.role === 'assistant' ? 'text-gray-500' : 'text-blue-200'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="bg-white/5 p-4 rounded-2xl flex space-x-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Actions */}
      <div className="px-6 py-3 border-t border-gray-800/50 bg-[#0a0f1e]/50 backdrop-blur-sm">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center space-x-2">
          <Info className="w-3 h-3" />
          <span>Quick Actions</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setInput("Summarize Sarah's technical background")}
            className="text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/30 px-3 py-2 rounded-xl transition-all flex items-center space-x-2 text-gray-300 hover:text-blue-400"
          >
            <Zap className="w-3 h-3" />
            <span>Tech Summary</span>
          </button>
          <button 
            onClick={() => setInput("Draft an interview invitation for Sarah Jenkins")}
            className="text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/30 px-3 py-2 rounded-xl transition-all flex items-center space-x-2 text-gray-300 hover:text-blue-400"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Draft Invite</span>
          </button>
          <button 
            onClick={() => setInput("Show matching score breakdown for Sarah")}
            className="text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/30 px-3 py-2 rounded-xl transition-all flex items-center space-x-2 text-gray-300 hover:text-blue-400"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Matching Analysis</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#0a0f1e]">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Query recruitment intelligence..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[110px] resize-none placeholder:text-gray-600 transition-all group-hover:bg-white/[0.05]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute bottom-4 right-4 p-2.5 bg-blue-600 rounded-xl text-white disabled:opacity-50 hover:bg-blue-500 transition-all shadow-[0_4px_15px_rgba(37,99,235,0.4)] disabled:shadow-none active:scale-95"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-4">
           <p className="text-[9px] text-gray-700 uppercase tracking-[0.3em] font-black">
            System Core: Gemini 3.0 Pro
          </p>
          <div className="flex items-center space-x-1">
             <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
             <div className="w-1 h-1 bg-blue-500 rounded-full opacity-50"></div>
             <div className="w-1 h-1 bg-blue-500 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;
