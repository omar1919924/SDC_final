'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Message {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  text: string;
  time: string;
  isRead: boolean;
  type: 'encouragement' | 'instruction' | 'achievement';
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Dr. Vance',
    role: 'Clinical Lead',
    avatar: 'https://i.pravatar.cc/100?u=vance',
    text: "Great job on that 15-minute focus streak yesterday, Alex! Today's labyrinth is tricky, but I know you can stay centered.",
    time: '08:45 AM',
    isRead: false,
    type: 'encouragement',
  },
  {
    id: '2',
    sender: 'Nurse Joy',
    role: 'Care Coordinator',
    avatar: 'https://i.pravatar.cc/100?u=joy',
    text: "Remember to breathe slowly if you get stuck on level 4. You're doing great!",
    time: 'Yesterday',
    isRead: true,
    type: 'instruction',
  },
  {
    id: '3',
    sender: 'System Admin',
    role: 'Security Node',
    avatar: 'https://i.pravatar.cc/100?u=system',
    text: "Your focus profile #NF-88219 has been successfully synchronized with the central hive.",
    time: '2 days ago',
    isRead: true,
    type: 'achievement',
  }
];

export const MessageView: React.FC = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const unreadCount = useMemo(
    () => messages.filter(message => !message.isRead).length,
    [messages],
  );

  const markAllRead = () => {
    setMessages(previous => previous.map(message => ({ ...message, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setMessages(previous =>
      previous.map(message =>
        message.id === id ? { ...message, isRead: !message.isRead } : message,
      ),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="font-headline text-5xl font-bold text-primary italic leading-tight">Messages</h2>
          <p className="text-on-surface-variant opacity-70">{unreadCount} new message{unreadCount !== 1 ? 's' : ''} from your care team.</p>
        </div>
        <button onClick={markAllRead} className="bg-sky-100 text-sky-700 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-sky-200 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
          Mark All Read
        </button>
      </header>

      <div className="space-y-6 max-w-4xl">
        {MOCK_MESSAGES.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex gap-6 p-8 rounded-[2.5rem] border transition-all ${
              !msg.isRead 
                ? "bg-white border-sky-400 shadow-[0_20px_40px_-5px_rgba(14,165,233,0.1)] ring-8 ring-sky-50/50" 
                : "bg-surface-container-low border-outline-variant/10 opacity-70"
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-white shadow-md">
                <div className="relative w-full h-full">
                  <Image 
                    src={msg.avatar} 
                    alt={msg.sender} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              </div>
              {!msg.isRead && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            
            <div className="space-y-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-primary text-xl leading-none">{msg.sender}</h4>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-outline font-bold mt-1">{msg.role}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-outline uppercase">{msg.time}</span>
              </div>
              
              <div className="relative">
                <span className="material-symbols-outlined absolute -top-4 -left-4 text-4xl text-sky-100/50 select-none">format_quote</span>
                <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl relative z-10 italic">
                  {msg.text}
                </p>
              </div>

              <div className="flex gap-4 items-center">
                <button className="text-sky-600 font-bold text-xs hover:underline flex items-center gap-1">
                  Send Heart
                  <span className="material-symbols-outlined text-[14px]">favorite</span>
                </button>
                <div className="w-1 h-1 bg-outline-variant rounded-full" />
                <button
                  onClick={() => toggleRead(msg.id)}
                  className="text-sky-600 font-bold text-xs hover:underline flex items-center gap-1"
                >
                  {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                  <span className="material-symbols-outlined text-[14px]">
                    {msg.isRead ? 'draft' : 'done'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
