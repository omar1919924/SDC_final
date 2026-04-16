'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FAQS = [
  {
    q: "How do I earn Focus Stones?",
    a: "Complete your Daily Quests and maintain 10-minute focus streaks in the Labyrinth game!"
  },
  {
    q: "What are XP points for?",
    a: "XP points help you level up and unlock new games, rare laboratory items, and exclusive badges."
  },
  {
    q: "Where can I find my teacher's feedback?",
    a: "Check your Message Center! Clinical notes and encouragement appear there after each review."
  }
];

export const HelpView: React.FC = () => {
  const [supportSent, setSupportSent] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="font-headline text-5xl font-bold text-primary italic leading-tight">Help Center</h2>
          <p className="text-on-surface-variant opacity-70">Need assistance navigating the sanctuary? We&apos;ve got you covered.</p>
        </div>
        <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 shadow-inner">
          <span className="material-symbols-outlined text-4xl">live_help</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* FAQs */}
        <div className="space-y-8">
          <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Frequently Asked Questions</h3>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                   {faq.q}
                </h4>
                <p className="text-on-surface-variant text-sm leading-relaxed opacity-70 font-body">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Contact */}
        <div className="space-y-8">
          <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Contact Support</h3>
          <div className="bg-primary-container text-on-primary-container p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
             
             <h4 className="font-headline text-2xl font-bold text-white italic mb-4">Stuck? Ask Dr. Vance</h4>
             <p className="text-sky-100/70 text-sm leading-relaxed mb-10">
               If you encounter a bug or need clinical guidance, you can send a priority ping to your care coordinator.
             </p>
             
             <button
               onClick={() => {
                 setSupportSent(true);
                 window.setTimeout(() => setSupportSent(false), 2500);
               }}
               className="w-full bg-white text-primary py-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-white/20 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               Send priority message
               <span className="material-symbols-outlined text-[18px]">send</span>
             </button>
             {supportSent && (
               <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-white/80">
                 Support ping sent
               </p>
             )}
             
             <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest text-center">Support ID: #NF-HELP-001</p>
             </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
