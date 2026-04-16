'use client';

import React, { useMemo } from 'react';
import { ChildData } from '@/types';
import { StudentCard } from '../StudentCard';
import { EngagementBento } from '../EngagementBento';
import { BentoSkeleton } from '@/components/ui/SkeletonLoaders';
import { motion } from 'framer-motion';

interface OverviewViewProps {
  students: ChildData[];
  isLoading: boolean;
  onSelectStudent: (student: ChildData) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  students,
  isLoading,
  onSelectStudent,
}) => {
  const [trackingNow, setTrackingNow] = React.useState(0);

  React.useEffect(() => {
    const syncClock = () => setTrackingNow(Date.now());
    const initial = window.setTimeout(syncClock, 0);
    const interval = window.setInterval(syncClock, 15000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: students.length,
      focused: students.filter(s => s.engagement_status === 'focused').length,
      distracted: students.filter(s => s.engagement_status === 'distracted').length,
      stressed: students.filter(s => s.engagement_status === 'stressed').length,
    };
  }, [students]);

  const trackingInsights = useMemo(() => {
    const highPriority = students
      .filter(student => student.riskLevel === 'high')
      .sort((a, b) => (a.focus_score ?? 0) - (b.focus_score ?? 0));
    const staleDevices = students.filter(student => {
      if (!student.last_sync_at) return false;
      return trackingNow - new Date(student.last_sync_at).getTime() > 45000;
    });
    const classAverage =
      students.length > 0
        ? Math.round(students.reduce((sum, student) => sum + (student.focus_score ?? 0), 0) / students.length)
        : 0;
    const bestStreak =
      students.length > 0
        ? Math.max(...students.map(student => student.focusStreakMinutes ?? 0))
        : 0;

    return {
      highPriority,
      staleDevices,
      classAverage,
      bestStreak,
      connectedBracelets: students.filter(student => student.braceletStatus === 'connected').length,
      syncingBracelets: students.filter(student => student.braceletStatus === 'syncing').length,
      lowBatteryBracelets: students.filter(student => student.braceletStatus === 'low_battery').length,
    };
  }, [students, trackingNow]);

  const handleIEPExport = () => {
    window.print();
  };

  const [currentTime, setCurrentTime] = React.useState<string>('');

  React.useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <BentoSkeleton className="h-40" />
          <BentoSkeleton className="h-40" />
          <BentoSkeleton className="h-40" />
          <BentoSkeleton className="h-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BentoSkeleton className="h-64" />
          <BentoSkeleton className="h-64" />
          <BentoSkeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-300">
            person_search
          </span>
        </div>
        <h3 className="text-xl font-headline font-bold text-slate-800">
          No students discovered.
        </h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
          Please verify your class assignment or contact the IT department to sync your explorer nodes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 1. Real-time Engagement Bento Grid */}
      <EngagementBento
        total={stats.total}
        focused={stats.focused}
        distracted={stats.distracted}
        stressed={stats.stressed}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline mb-2">
                Tracking Center
              </p>
              <h3 className="font-headline text-3xl font-black italic text-on-surface">
                Intervention Queue
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Prioritise the learners who need support during this session.
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Class Average
              </p>
              <p className="text-3xl font-black text-primary">{trackingInsights.classAverage}%</p>
            </div>
          </div>

          <div className="space-y-4">
            {trackingInsights.highPriority.length === 0 ? (
              <div className="rounded-2xl border border-success/20 bg-success/10 px-5 py-4 text-sm text-success">
                No urgent intervention needed right now. The class is holding a healthy rhythm.
              </div>
            ) : (
              trackingInsights.highPriority.slice(0, 3).map(student => (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="w-full rounded-2xl border border-outline-variant/10 bg-white p-5 text-left transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-on-surface">
                          {student.user?.nom ?? 'Explorer Node'}
                        </h4>
                        <span className="rounded-full bg-error/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-error">
                          High Priority
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {student.recommendedAction}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(student.attentionFlags ?? []).slice(0, 3).map(flag => (
                          <span
                            key={flag}
                            className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:min-w-[240px]">
                      <div className="rounded-2xl bg-surface-container-low px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Focus</p>
                        <p className="text-xl font-black text-on-surface">{student.focus_score ?? 0}%</p>
                      </div>
                      <div className="rounded-2xl bg-surface-container-low px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Streak</p>
                        <p className="text-xl font-black text-on-surface">{student.focusStreakMinutes ?? 0}m</p>
                      </div>
                      <div className="rounded-2xl bg-surface-container-low px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Trend</p>
                        <p className="text-xl font-black text-on-surface">
                          {(student.trendDelta ?? 0) > 0 ? '+' : ''}
                          {student.trendDelta ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline mb-2">
            Session Signals
          </p>
          <h3 className="font-headline text-3xl font-black italic text-on-surface mb-6">
            Teacher Radar
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Best Streak</p>
              <p className="text-2xl font-black text-primary">{trackingInsights.bestStreak} min</p>
            </div>
            <div className="rounded-2xl bg-warning/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-warning">Sync Alerts</p>
              <p className="text-2xl font-black text-warning">{trackingInsights.staleDevices.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Connected</p>
              <p className="text-xl font-black text-emerald-700">{trackingInsights.connectedBracelets}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Syncing</p>
              <p className="text-xl font-black text-sky-700">{trackingInsights.syncingBracelets}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Low Battery</p>
              <p className="text-xl font-black text-amber-700">{trackingInsights.lowBatteryBracelets}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
              Next Actions
            </p>
            {students.slice(0, 4).map(student => (
              <div
                key={student.id}
                className="rounded-2xl border border-outline-variant/10 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-on-surface">{student.user?.nom ?? 'Explorer Node'}</p>
                    <p className="text-xs text-on-surface-variant">{student.recommendedAction}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      student.riskLevel === 'high'
                        ? 'bg-error/10 text-error'
                        : student.riskLevel === 'medium'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-success/10 text-success'
                    }`}
                  >
                    {student.riskLevel ?? 'low'} risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>

      {/* 2. Section Header with Admin Tools */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="font-headline text-3xl font-black text-slate-900 italic tracking-tight lowercase">
              Live Monitoring
            </h2>
          </div>
          <p className="text-slate-500 text-sm font-medium" suppressHydrationWarning>
            Active Session · {stats.total} students connected · {currentTime} Sync
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="hidden md:flex items-center bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2">
            <input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
            />
          </div>
          <button 
            onClick={handleIEPExport}
            className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg shadow-slate-900/10"
          >
            <span className="material-symbols-outlined text-sm">ios_share</span>
            IEP Export
          </button>
        </div>
      </div>

      {/* 3. Individual Student Monitoring Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {students.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <StudentCard
              student={student}
              onClick={() => onSelectStudent(student)}
            />
          </motion.div>
        ))}
      </div>

      {/* Print-only View for IEP Export */}
      <style jsx global>{`
        @media print {
          nav, aside, header, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .grid {
            display: block !important;
          }
          .glass-card {
            box-shadow: none !important;
            border: 1px solid #eee !important;
            break-inside: avoid;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};
