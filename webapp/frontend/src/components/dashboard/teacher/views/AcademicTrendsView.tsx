'use client';

import React, { useMemo } from 'react';
import { ChildData } from '@/types';
import { BentoSkeleton } from '@/components/ui/SkeletonLoaders';
import { motion } from 'framer-motion';

interface AcademicTrendsViewProps {
  students: ChildData[];
  isLoading: boolean;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Renders a sparkline bar chart from a data array (0–100) */
function Sparkline({ data, accent = 'bg-primary' }: { data: number[]; accent?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${accent} transition-all duration-700`}
          style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

/** Full class-avg bar chart */
function ClassAvgChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-2 h-36">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[9px] font-mono text-on-surface-variant">{Math.round(v)}%</span>
          <div className="w-full flex items-end" style={{ height: 100 }}>
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all duration-1000"
              style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
            />
          </div>
          <span className="text-[9px] font-mono text-outline">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export const AcademicTrendsView: React.FC<AcademicTrendsViewProps> = ({
  students,
  isLoading,
}) => {
  const classAvg = useMemo(() => {
    if (students.length === 0) return Array(7).fill(0);
    const sums = Array(7).fill(0);
    let count = 0;
    students.forEach(s => {
      const wp = s.weeklyProgress ?? [];
      if (wp.length >= 7) {
        count++;
        wp.slice(0, 7).forEach((v, i) => {
          sums[i] += v;
        });
      }
    });
    return count > 0 ? sums.map(s => s / count) : Array(7).fill(0);
  }, [students]);

  const avgFocus = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(students.reduce((a, s) => a + (s.focus_score ?? 0), 0) / students.length);
  }, [students]);

  const interventionSummary = useMemo(() => {
    const improving = students.filter(student => (student.trendDelta ?? 0) > 0).length;
    const declining = students.filter(student => (student.trendDelta ?? 0) < 0).length;
    const highRisk = students.filter(student => student.riskLevel === 'high').length;
    return { improving, declining, highRisk };
  }, [students]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BentoSkeleton className="h-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <BentoSkeleton key={i} className="h-36" />)}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">
          monitoring
        </span>
        <p className="font-headline text-xl font-bold text-on-surface">No trend data yet</p>
        <p className="text-on-surface-variant text-sm mt-1">
          Assign students to start tracking academic trends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-headline text-3xl font-bold text-primary italic lowercase tracking-tight">
          Academic Trends
        </h2>
        <p className="text-on-surface-variant text-sm">
          Class-level focus analytics across {students.length} students
        </p>
      </div>

      {/* Class Average Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">
              Class Average Focus
            </p>
            <p className="font-headline text-2xl font-black text-on-surface">
              {avgFocus}%{' '}
              <span className="text-success text-sm font-normal font-body">this week</span>
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
        </div>
        <ClassAvgChart data={classAvg} labels={DAY_LABELS} />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
            Tracking Load
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-success/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-success">Improving</p>
              <p className="text-3xl font-black text-success">{interventionSummary.improving}</p>
              <p className="text-xs text-on-surface-variant mt-1">Students gaining momentum this week.</p>
            </div>
            <div className="rounded-2xl bg-warning/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-warning">Declining</p>
              <p className="text-3xl font-black text-warning">{interventionSummary.declining}</p>
              <p className="text-xs text-on-surface-variant mt-1">Need a prompt or schedule adjustment.</p>
            </div>
            <div className="rounded-2xl bg-error/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-error">High Risk</p>
              <p className="text-3xl font-black text-error">{interventionSummary.highRisk}</p>
              <p className="text-xs text-on-surface-variant mt-1">Require intervention during the next block.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
            Priority Coaching
          </p>
          <div className="space-y-3">
            {students
              .slice()
              .sort((a, b) => (a.focus_score ?? 0) - (b.focus_score ?? 0))
              .slice(0, 4)
              .map(student => (
                <div
                  key={`coach-${student.id}`}
                  className="rounded-2xl border border-outline-variant/10 bg-white px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-on-surface">{student.user?.nom ?? 'Explorer Node'}</p>
                      <p className="text-sm text-on-surface-variant">{student.recommendedAction}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-black text-primary">{student.focus_score ?? 0}%</p>
                      <p className="text-[10px] uppercase tracking-widest text-outline">
                        {(student.trendDelta ?? 0) > 0 ? '+' : ''}
                        {student.trendDelta ?? 0} this week
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.section>
      </div>

      {/* Per-Student Sparklines */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
          Individual Weekly Progress
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s, i) => {
            const wp = (s.weeklyProgress ?? []).slice(0, 7);
            const latestFocus = s.focus_score ?? 0;
            const moodColor =
              s.currentMood === 'Needs Attention'
                ? 'bg-warning/70'
                : s.currentMood === 'Critical'
                ? 'bg-error/70'
                : 'bg-success/70';

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-sm text-on-surface">
                      {s.user?.nom ?? 'Explorer Node'}
                    </p>
                    <p className="text-[10px] text-outline">
                      {s.classe ?? 'No class'} · Age {s.age ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-primary">{latestFocus}%</p>
                    <span
                      className={`inline-block w-2 h-2 rounded-full mt-1 ${moodColor}`}
                    />
                  </div>
                </div>

                {wp.length > 0 ? (
                  <Sparkline
                    data={wp}
                    accent={
                      s.currentMood === 'Critical'
                        ? 'bg-error/50'
                        : s.currentMood === 'Needs Attention'
                        ? 'bg-warning/60'
                        : 'bg-primary/50'
                    }
                  />
                ) : (
                  <div className="h-10 flex items-center justify-center text-[10px] text-outline">
                    No weekly data
                  </div>
                )}

                <div className="flex gap-1 mt-2">
                  {DAY_LABELS.map((d, idx) => (
                    <span
                      key={d}
                      className="flex-1 text-center text-[8px] text-outline font-mono"
                    >
                      {wp[idx] !== undefined ? '' : ''}
                      {d.charAt(0)}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-sm"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
          Mood Distribution
        </p>
        <div className="flex gap-4 flex-wrap">
          {(['Stable', 'Needs Attention', 'Critical'] as const).map(mood => {
            const count = students.filter(s => (s.currentMood ?? 'Stable') === mood).length;
            const pct = students.length ? Math.round((count / students.length) * 100) : 0;
            const color =
              mood === 'Stable'
                ? 'bg-success'
                : mood === 'Needs Attention'
                ? 'bg-warning'
                : 'bg-error';
            return (
              <div key={mood} className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-on-surface">{mood}</span>
                    <span className="text-outline font-mono">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
