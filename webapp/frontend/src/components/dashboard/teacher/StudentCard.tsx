'use client';

import React, { useEffect, useState } from 'react';
import { ChildData, EngagementStatus } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentCardProps {
  student: ChildData;
  onClick?: () => void;
}

const ENGAGEMENT_CONFIG: Record<EngagementStatus, {
  color: string;
  glow: string;
  icon: string;
  label: string;
  bgLight: string;
}> = {
  focused: {
    color: 'text-engagement-focused',
    glow: 'glass-glow-cyan',
    icon: 'bolt',
    label: 'Focused',
    bgLight: 'bg-cyan-50',
  },
  distracted: {
    color: 'text-engagement-distracted',
    glow: 'glass-glow-amber',
    icon: 'notification_important',
    label: 'Distracted',
    bgLight: 'bg-amber-50',
  },
  stressed: {
    color: 'text-engagement-stressed',
    glow: 'glass-glow-rose',
    icon: 'monitor_heart',
    label: 'Stressed',
    bgLight: 'bg-rose-50',
  },
  offline: {
    color: 'text-slate-400',
    glow: '',
    icon: 'wifi_off',
    label: 'Offline',
    bgLight: 'bg-slate-50',
  },
};

const BRACELET_STATUS_LABELS = {
  connected: 'Connected',
  syncing: 'Syncing',
  low_battery: 'Low Battery',
  offline: 'Offline',
};

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
  const [isStale, setIsStale] = useState(false);
  const status = student.engagement_status ?? 'offline';
  const config = ENGAGEMENT_CONFIG[status];
  
  const focusScore = student.focus_score ?? 0;

  // Logic for "Stale" data alert (> 30s)
  useEffect(() => {
    if (!student.last_sync_at) return;
    
    const checkStale = () => {
      const lastSync = new Date(student.last_sync_at!).getTime();
      const now = new Date().getTime();
      setIsStale(now - lastSync > 30000); // 30 seconds
    };

    checkStale();
    const interval = setInterval(checkStale, 5000);
    return () => clearInterval(interval);
  }, [student.last_sync_at]);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden cursor-pointer group rounded-3xl p-6 glass-card transition-all duration-500",
        config.glow,
        status === 'offline' && "opacity-70 grayscale-[0.5]"
      )}
    >
      {/* Dynamic Visual Cues: Border Glow */}
      <div className={cn(
        "absolute inset-0 border-2 rounded-3xl pointer-events-none transition-colors duration-500",
        status === 'focused' && "border-cyan-500/20",
        status === 'distracted' && "border-amber-500/20",
        status === 'stressed' && "border-rose-500/20 animate-pulse",
        status === 'offline' && "border-transparent"
      )} />

      {/* Header: Student Identity */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm ring-1 ring-black/5 relative shrink-0">
              <Image
                src={student.user?.avatar_url ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuArXceYhLE9g_s3faJlGyGUCY2Xtrgp_jkHfcrVpAp34-estpD-_DzCMbiWjq88BBKJAKrXTzpJ9guM840btQsKJw4pZUXgyE4e81nnNr0chDjaWHocGXHGSEAJ603IhQEFaCfpYAWeMLSyz4XLvys4GaJL4Gs8b2g7He0SGJN7Gl7ajrYNeA0aVQMRmHnRXT1Mm03l5pkAJVZJbwH4HUbnWXMCDVtk5aUgtiDcItUqpcTuuEySz9jxTdS_ZFPwzURopXwTZKORTKFK'}
                alt={student.user?.nom ?? 'Student'}
                fill
                className="object-cover"
              />
            </div>
            {/* Status Indicator Dot */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
              status === 'offline' ? "bg-slate-400" : "bg-green-500"
            )} />
          </div>

          <div>
            <h3 className="font-headline font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">
              {student.user?.nom ?? 'Explorer Node'}
            </h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {student.classe ?? 'General'}
            </p>
          </div>
        </div>

        {/* Dynamic Engagement Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
          config.bgLight,
          status === 'stressed' && "animate-breathing"
        )}>
          <span className={cn("material-symbols-outlined text-xl", config.color)}>
            {config.icon}
          </span>
        </div>
      </div>

      {/* Engagement Status Label */}
      <div className="mb-4">
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md",
          config.bgLight,
          config.color
        )}>
          {config.label}
        </span>
      </div>

      {/* Focus Level Bar */}
      <div className="space-y-3 mb-6 relative z-10">
        <div className="flex justify-between items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
            Engagement Level
          </span>
          <span className={cn("text-xs font-black", config.color)}>{focusScore}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${focusScore}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              status === 'focused' && "bg-cyan-500",
              status === 'distracted' && "bg-amber-500",
              status === 'stressed' && "bg-rose-500",
              status === 'offline' && "bg-slate-300"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        <div className="rounded-2xl bg-white/70 px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Streak</p>
          <p className="text-sm font-black text-slate-800">{student.focusStreakMinutes ?? 0}m</p>
        </div>
        <div className="rounded-2xl bg-white/70 px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Trend</p>
          <p className="text-sm font-black text-slate-800">
            {(student.trendDelta ?? 0) > 0 ? '+' : ''}
            {student.trendDelta ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Risk</p>
          <p
            className={cn(
              'text-sm font-black uppercase',
              student.riskLevel === 'high'
                ? 'text-rose-600'
                : student.riskLevel === 'medium'
                ? 'text-amber-600'
                : 'text-emerald-600',
            )}
          >
            {student.riskLevel ?? 'low'}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-white/75 px-4 py-4 relative z-10">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Bracelet Monitor
          </p>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest',
              student.braceletStatus === 'connected' && 'bg-emerald-100 text-emerald-700',
              student.braceletStatus === 'syncing' && 'bg-sky-100 text-sky-700',
              student.braceletStatus === 'low_battery' && 'bg-amber-100 text-amber-700',
              student.braceletStatus === 'offline' && 'bg-slate-100 text-slate-500',
            )}
          >
            {BRACELET_STATUS_LABELS[student.braceletStatus ?? 'offline']}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">ID</p>
            <p className="font-mono font-semibold text-slate-700">{student.bracelet_id ?? 'Not paired'}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Battery</p>
            <p className="font-semibold text-slate-700">{student.braceletBattery ?? 0}%</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Zone</p>
            <p className="font-semibold text-slate-700">{student.locationLabel ?? 'Unknown'}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Activity</p>
            <p className="font-semibold text-slate-700">{student.currentActivity ?? 'Monitoring'}</p>
          </div>
        </div>
      </div>

      {/* Sync / Freshness Status */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            isStale ? "bg-amber-500 animate-pulse" : "bg-cyan-500"
          )} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {isStale ? 'Data Stale (reconnecting)' : 'Live Link Stable'}
          </span>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline"
        >
          Details
        </button>
      </div>

      {/* Overlays for Offline/Stale */}
      <AnimatePresence>
        {status === 'offline' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-100/40 backdrop-blur-[2px] z-20 flex items-center justify-center p-6 text-center"
          >
            <div className="glass-card bg-white px-4 py-2 rounded-2xl shadow-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Device Offline</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
