'use client';

import React from 'react';
import Image from 'next/image';
import { BadgeItem } from '@/components/ui/BadgeItem';
import { QuestStep } from '@/types';
import { motion } from 'framer-motion';
import { SharedProgress } from '@/components/dashboard/shared/SharedProgress';

function cn(...inputs: unknown[]) {
  return inputs.filter(Boolean).join(' ');
}

interface HomeViewProps {
  mockQuests: QuestStep[];
  data?: unknown;
}

export const HomeView: React.FC<HomeViewProps> = ({ mockQuests }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Shared Progress Linkage Section */}
      <SharedProgress 
        currentScore={740} 
        totalGoal={1000} 
        goalLabel="Family Sanctuary Expansion" 
        className="mb-12"
      />

      {/* Hero Quest Section */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16 items-center">
        <div className="lg:col-span-3 space-y-6">
          <div className="inline-flex items-center gap-2 bg-secondary-container px-3 py-1 rounded-full text-on-secondary-container font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Current Mission
          </div>
          <h1 className="font-headline text-5xl lg:text-7xl font-bold leading-tight text-primary italic">
            Ready for <span className="text-sky-600">today&apos;s mission</span>, Alex?
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl">
            Today we&apos;re exploring <span className="font-bold text-primary">The Focus Labyrinth</span>. Can you find the way through using your concentration powers?
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-on-primary px-10 py-5 rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition-all flex items-center gap-3">
              Start Mission
              <span className="material-symbols-outlined">explore</span>
            </button>
            <button className="bg-surface-container-low text-primary px-10 py-5 rounded-xl font-bold text-lg hover:bg-surface-container-high transition-colors">
              View Map
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 relative">
          <div className="aspect-square bg-sky-100 rounded-[3rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl border-4 border-white relative">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQV-VXeEOiGPQsakdMGxTgwVabU0xBL4tp6vFRuQp6Zbn9c_eOWzCcDZvLT5W0a-u9BE_QZI2wWcEIerudMOicrlXmZKnd9XqIrjWhsvs-08dMkiuhEbRpsxZK-nDGtI3TxtojXV68Pwsr9-1EnImbqe40eHVVo7CQoxD974ZZd3bSJus8EqK0ZoREjHrGi8C2t5fIS-ehfA30Jyrzsi2ceH61js4ZPe49i981KQQcPpHkfp6MUWUvh7TC4q0wAbe4FT_EneE-8u7b" 
              alt="Hero Illustration" 
              fill
              className="object-cover" 
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-lg border-b-4 border-secondary-container max-w-[200px]">
            <p className="text-xs font-mono text-slate-500 mb-1 uppercase tracking-tighter">Current Progress</p>
            <p className="text-2xl font-black text-primary mb-2">3 <span className="text-slate-300 font-light">/</span> 5</p>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="bg-secondary-container h-full w-[60%] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Pathway Map */}
        <div className="md:col-span-2 bg-surface-container-low rounded-[2.5rem] p-8 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="font-headline text-2xl font-bold text-primary italic">Quest Pathway</h3>
              <p className="text-slate-500">Your journey through the labyrinth</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-sky-200">map</span>
          </div>
          
          <div className="relative flex justify-between items-center px-4 py-8">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-sky-200 -translate-y-1/2 z-0"></div>
            {mockQuests.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div className={cn(
                  "rounded-full flex items-center justify-center transition-all",
                  step.status === 'done' ? "w-12 h-12 bg-on-tertiary-container text-white ring-8 ring-tertiary-fixed-dim/30" :
                  step.status === 'current' ? "w-16 h-16 bg-white border-4 border-sky-500 text-sky-500 ring-8 ring-sky-100 shadow-xl" :
                  "w-12 h-12 bg-slate-200 text-slate-400"
                )}>
                  <span className={`material-symbols-outlined ${step.status === 'done' && 'filled-icon'}`}>{step.icon}</span>
                </div>
                <span className={`text-xs font-bold ${step.status === 'current' ? 'text-sky-700' : 'text-slate-400'}`}>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dr. Vance Message */}
        <div className="bg-primary-container text-on-primary-container rounded-[2.5rem] p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-inner border border-white/10">
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-sky-300">record_voice_over</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-white mb-3 italic">Message from Dr. Vance</h3>
            <p className="text-sky-100/70 text-sm leading-relaxed italic">
              &quot;Great job on that 15-minute focus streak yesterday, Alex! Today&apos;s labyrinth is tricky, but I know you can stay centered.&quot;
            </p>
          </div>
          <button className="mt-8 flex items-center gap-2 text-white font-bold hover:gap-4 transition-all group">
            Play Audio
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
          </button>
        </div>
      </div>

      {/* Badge Gallery Snapshot */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline text-3xl font-bold text-primary italic">Your Badge Collection</h2>
            <p className="text-slate-500">12 Badges Earned • <span className="text-secondary font-bold">3 New Challenges</span></p>
          </div>
          <button className="text-sky-600 font-bold hover:underline flex items-center gap-1">
            View All
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <BadgeItem title="Master of Focus" subtitle="Unlocked 2 days ago" icon="military_tech" variant="tertiary" />
          <BadgeItem title="Calm Navigator" subtitle="Unlocked 1 week ago" icon="sentiment_calm" variant="secondary" />
          <BadgeItem title="15-Min Streak" subtitle="Almost there!" icon="timer" isLocked />
          <BadgeItem title="Idea Spark" subtitle="Keep going!" icon="lightbulb" isLocked />
        </div>
      </section>
    </motion.div>
  );
};
