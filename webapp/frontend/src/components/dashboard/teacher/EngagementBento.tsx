'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BentoCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
  variant: 'cyan' | 'amber' | 'rose' | 'slate';
  delay?: number;
}

const VARIANTS = {
  cyan: {
    bg: 'bg-engagement-focused',
    glow: 'glass-glow-cyan',
    iconColor: 'text-cyan-100',
    titleColor: 'text-cyan-50',
    subtitleColor: 'text-cyan-100/70',
  },
  amber: {
    bg: 'bg-engagement-distracted',
    glow: 'glass-glow-amber',
    iconColor: 'text-amber-100',
    titleColor: 'text-amber-50',
    subtitleColor: 'text-amber-100/70',
  },
  rose: {
    bg: 'bg-engagement-stressed',
    glow: 'glass-glow-rose',
    iconColor: 'text-rose-100',
    titleColor: 'text-rose-50',
    subtitleColor: 'text-rose-100/70',
  },
  slate: {
    bg: 'bg-slate-800 text-white',
    glow: '',
    iconColor: 'text-slate-300',
    titleColor: 'text-slate-100',
    subtitleColor: 'text-slate-400',
  },
};

const BentoCard: React.FC<BentoCardProps> = ({ title, value, subtitle, icon, variant, delay = 0 }) => {
  const styles = VARIANTS[variant];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 glass-card flex flex-col justify-between h-40",
        styles.bg,
        styles.glow
      )}
    >
      {/* Decorative background element */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-start relative z-10">
        <span className={cn("material-symbols-outlined text-3xl", styles.iconColor)}>
          {icon}
        </span>
        <div className="text-right">
          <p className={cn("text-4xl font-black italic tracking-tight", styles.titleColor)}>
            {value}
          </p>
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className={cn("text-xs font-bold uppercase tracking-[0.2em]", styles.titleColor)}>
          {title}
        </h3>
        <p className={cn("text-[10px] uppercase font-medium", styles.subtitleColor)}>
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};

interface EngagementBentoProps {
  total: number;
  focused: number;
  distracted: number;
  stressed: number;
}

export const EngagementBento: React.FC<EngagementBentoProps> = ({ 
  total, 
  focused, 
  distracted, 
  stressed 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <BentoCard
        variant="slate"
        title="Total Students"
        value={total}
        subtitle="Currently Monitoring"
        icon="groups"
        delay={0}
      />
      <BentoCard
        variant="cyan"
        title="Focused"
        value={focused}
        subtitle="Actively Engaged"
        icon="bolt"
        delay={0.1}
      />
      <BentoCard
        variant="amber"
        title="Distracted"
        value={distracted}
        subtitle="Requires Guidance"
        icon="notification_important"
        delay={0.2}
      />
      <BentoCard
        variant="rose"
        title="Stressed"
        value={stressed}
        subtitle="High Pressure detected"
        icon="monitor_heart"
        delay={0.3}
      />
    </div>
  );
};
