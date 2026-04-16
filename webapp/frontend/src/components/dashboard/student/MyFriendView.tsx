'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'friend' | 'kid';
  text: string;
  timestamp: string;
}

export const MyFriendView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'friend',
      text: "Hi Alex! I'm your Focus Friend. How are you feeling today?",
      timestamp: '10:00 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'kid',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Placeholder response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'friend',
        text: "That's good to hear! Remember, I'm here to help you stay focused on your Daily Quest.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-[calc(100vh-160px)] flex flex-col"
    >
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="space-y-2">
          <h2 className="font-headline text-5xl font-bold text-primary italic leading-tight">My Friend</h2>
          <p className="text-on-surface-variant opacity-70">Your AI companion for focus and calm.</p>
        </div>
        <div className="flex items-center gap-4 bg-sky-100 px-6 py-3 rounded-2xl border border-sky-200">
           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sky-600 shadow-sm">
              <span className="material-symbols-outlined filled-icon">smart_toy</span>
           </div>
           <div>
              <p className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-widest">Status</p>
              <p className="text-sm font-bold text-sky-800">Ready to chat</p>
           </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/10 shadow-inner flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 precision-grid opacity-20 pointer-events-none" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10 scrollbar-hide">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "flex items-end gap-3",
                  msg.sender === 'kid' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  msg.sender === 'friend' ? "bg-sky-500 text-white" : "bg-primary text-white"
                )}>
                  <span className="material-symbols-outlined text-sm">
                    {msg.sender === 'friend' ? 'smart_toy' : 'person'}
                  </span>
                </div>
                
                <div className={cn(
                  "max-w-[70%] p-5 rounded-3xl text-sm font-medium shadow-sm",
                  msg.sender === 'friend' 
                    ? "bg-white text-primary rounded-bl-none border border-outline-variant/10" 
                    : "bg-primary text-white rounded-br-none"
                )}>
                  {msg.text}
                  <p className={cn(
                    "text-[8px] mt-2 font-mono uppercase tracking-widest",
                    msg.sender === 'friend' ? "text-slate-400 text-left" : "text-white/50 text-right"
                  )}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-8 shrink-0 relative z-10">
          <div className="flex gap-4 items-center bg-white p-2 rounded-2xl shadow-xl border border-outline-variant/10 group focus-within:ring-4 focus-within:ring-sky-100 transition-all">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm font-medium text-primary outline-none py-3"
            />
            <button 
              onClick={handleSend}
              className="bg-primary text-white p-3 rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center justify-center group-hover:bg-sky-600 focus:bg-sky-600"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-mono uppercase tracking-widest">
            Always supervised by Dr. Vance for clinical safety
          </p>
        </div>
      </div>
    </motion.div>
  );
};
