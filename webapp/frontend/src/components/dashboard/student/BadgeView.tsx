'use client';

import React from 'react';
import { BadgeItem } from '@/components/ui/BadgeItem';
import { motion } from 'framer-motion';

export const BadgeView: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="font-headline text-5xl font-bold text-primary italic leading-tight">My Badges</h2>
          <p className="text-on-surface-variant opacity-70">Every achievement is a step closer to focus mastery.</p>
        </div>
        <div className="bg-sky-100 px-6 py-4 rounded-[1.5rem] border border-sky-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sky-600 filled-icon">military_tech</span>
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-sky-700/60 font-bold">Earned</p>
              <p className="text-2xl font-black text-sky-700">12 Badges</p>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Focus Achievements</h3>
          <div className="h-px bg-outline-variant/10 flex-grow" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BadgeItem title="Master of Focus" subtitle="Unlocked 2 days ago" icon="military_tech" variant="tertiary" />
          <BadgeItem title="Calm Navigator" subtitle="Unlocked 1 week ago" icon="sentiment_calm" variant="secondary" />
          <BadgeItem title="Daily Warrior" subtitle="Unlocked 3 days ago" icon="auto_awesome" variant="secondary" />
          <BadgeItem title="Sync Master" subtitle="Unlocked 5 days ago" icon="sync_alt" variant="tertiary" />
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Legacy Badges</h3>
          <div className="h-px bg-outline-variant/10 flex-grow" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BadgeItem title="First Journey" subtitle="Unlocked 1 month ago" icon="explore" variant="secondary" />
          <BadgeItem title="Early Bird" subtitle="Unlocked 3 weeks ago" icon="wb_sunny" variant="secondary" />
          <BadgeItem title="Social Guide" subtitle="Unlocked 3 weeks ago" icon="group" variant="secondary" />
          <BadgeItem title="Brain Spark" subtitle="Unlocked 2 weeks ago" icon="psychology" variant="tertiary" />
        </div>
      </section>

      <section className="space-y-8 opacity-60">
        <div className="flex items-center gap-4">
          <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Locked Challenges</h3>
          <div className="h-px bg-outline-variant/10 flex-grow" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BadgeItem title="15-Min Streak" subtitle="Complete mission #5" icon="timer" isLocked />
          <BadgeItem title="Idea Spark" subtitle="Unlocked at level 10" icon="lightbulb" isLocked />
          <BadgeItem title="Silent Sage" subtitle="Unlocked at level 15" icon="self_improvement" isLocked />
          <BadgeItem title="Golden Focus" subtitle="Unlocked at level 20" icon="workspace_premium" isLocked />
        </div>
      </section>
    </motion.div>
  );
};
