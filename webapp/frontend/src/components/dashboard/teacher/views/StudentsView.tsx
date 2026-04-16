'use client';

import React, { useState, useMemo } from 'react';
import { ChildData } from '@/types';
import { StudentCard } from '../StudentCard';
import { BentoSkeleton } from '@/components/ui/SkeletonLoaders';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentsViewProps {
  students: ChildData[];
  isLoading: boolean;
  onSelectStudent: (student: ChildData) => void;
}

type StatusFilter = 'All' | 'Stable' | 'Needs Attention' | 'Critical';
type RiskFilter = 'All Risks' | 'Low' | 'Medium' | 'High';

const STATUS_FILTERS: StatusFilter[] = ['All', 'Stable', 'Needs Attention', 'Critical'];
const RISK_FILTERS: RiskFilter[] = ['All Risks', 'Low', 'Medium', 'High'];

const STATUS_COLORS: Record<StatusFilter, string> = {
  All: 'bg-primary text-on-primary',
  Stable: 'bg-success/15 text-success border-success/30',
  'Needs Attention': 'bg-warning/15 text-warning border-warning/30',
  Critical: 'bg-error/15 text-error border-error/30',
};

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  isLoading,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All Risks');
  const [trackingNow, setTrackingNow] = useState(0);

  React.useEffect(() => {
    const syncClock = () => setTrackingNow(Date.now());
    const initial = window.setTimeout(syncClock, 0);
    const interval = window.setInterval(syncClock, 15000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const name = s.user?.nom?.toLowerCase() ?? '';
      const email = s.user?.email?.toLowerCase() ?? '';
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || name.includes(q) || email.includes(q);

      const mood = s.currentMood ?? 'Stable';
      const matchesStatus =
        statusFilter === 'All' || mood === statusFilter;

      const riskLabel = (s.riskLevel ?? 'low').toLowerCase();
      const matchesRisk =
        riskFilter === 'All Risks' || riskLabel === riskFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [students, searchQuery, statusFilter, riskFilter]);

  const atRiskStudents = useMemo(
    () => filtered.filter(student => student.riskLevel === 'high' || student.riskLevel === 'medium'),
    [filtered],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-headline text-3xl font-bold text-primary italic lowercase tracking-tight">
          All Students
        </h2>
        <p className="text-on-surface-variant text-sm">
          {students.length} profiles assigned · showing {filtered.length}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                statusFilter === f
                  ? STATUS_COLORS[f]
                  : 'border-outline-variant/20 text-outline hover:bg-primary/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RISK_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setRiskFilter(filter)}
            className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              riskFilter === filter
                ? 'bg-slate-900 text-white'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {atRiskStudents.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline mb-1">
                Tracking Queue
              </p>
              <h3 className="font-headline text-2xl font-bold italic text-on-surface">
                Students Needing Follow-up
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant">
              {atRiskStudents.length} learner{atRiskStudents.length > 1 ? 's' : ''} currently flagged.
            </p>
          </div>

          <div className="space-y-3">
            {atRiskStudents.slice(0, 4).map(student => (
              <button
                key={`risk-${student.id}`}
                onClick={() => onSelectStudent(student)}
                className="w-full rounded-2xl border border-outline-variant/10 bg-white px-4 py-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-on-surface">{student.user?.nom ?? 'Explorer Node'}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          student.riskLevel === 'high'
                            ? 'bg-error/10 text-error'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {student.riskLevel} risk
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{student.recommendedAction}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 lg:min-w-[260px]">
                    <div className="rounded-xl bg-surface-container-low px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Focus</p>
                      <p className="text-lg font-black text-on-surface">{student.focus_score ?? 0}%</p>
                    </div>
                    <div className="rounded-xl bg-surface-container-low px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Sync</p>
                        <p className="text-lg font-black text-on-surface">
                          {student.last_sync_at
                          ? `${Math.max(0, Math.round((trackingNow - new Date(student.last_sync_at).getTime()) / 1000))}s`
                          : '--'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface-container-low px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Streak</p>
                      <p className="text-lg font-black text-on-surface">{student.focusStreakMinutes ?? 0}m</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <BentoSkeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">
            manage_search
          </span>
          <p className="font-headline text-xl font-bold text-on-surface">No results found</p>
          <p className="text-on-surface-variant text-sm mt-1">
            Try adjusting your search or filter.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <StudentCard student={student} onClick={() => onSelectStudent(student)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
