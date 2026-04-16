'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SharedProgressProps {
  currentScore: number;
  totalGoal: number;
  goalLabel: string;
  className?: string;
}

export const SharedProgress: React.FC<SharedProgressProps> = ({
  currentScore,
  totalGoal,
  goalLabel,
  className,
}) => {
  const percentage = Math.min((currentScore / totalGoal) * 100, 100);

  return (
    <div className={cn(
      "relative overflow-hidden bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 shadow-sm",
      className
    )}>
      {/* Background patterns */}
      <div className="absolute inset-0 precision-grid opacity-20 pointer-events-none"></div>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-surface-container-highest"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * percentage) / 100}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-primary italic lowercase">{Math.round(percentage)}%</span>
            <span className="text-[8px] font-bold text-outline uppercase tracking-widest">Progress</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="material-symbols-outlined text-primary filled-icon" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Family Collaborative Shield</h3>
            </div>
            <h2 className="font-headline text-3xl font-bold text-on-surface italic leading-tight">
              Shared Quest: <span className="text-secondary">{goalLabel}</span>
            </h2>
          </div>
          
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
            Collaborative focus synchronization active. Every point earned during game sessions strengthens the family sanctuary.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <div className="bg-surface px-4 py-2 rounded-xl border border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">diversity_1</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Student + Parent Link</span>
             </div>
             <div className="bg-surface px-4 py-2 rounded-xl border border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary">verified</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Sync Active</span>
             </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-2">
           <div className="w-12 h-12 rounded-full border-2 border-primary/20 bg-white shadow-sm flex items-center justify-center transform hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">family_restroom</span>
           </div>
           <div className="w-px h-8 bg-outline-variant/30 self-center"></div>
           <div className="w-12 h-12 rounded-full border-2 border-secondary/20 bg-white shadow-sm flex items-center justify-center transform hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary">child_care</span>
           </div>
        </div>
      </div>
    </div>
  );
};
