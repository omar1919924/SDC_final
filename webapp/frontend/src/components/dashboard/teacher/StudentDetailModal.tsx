'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChildData } from '@/types';
import { ClinicalModal } from '@/components/ui/ClinicalModal';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface ClinicalUpdate {
  id: string;
  child_id: string;
  provider: string;
  message: string;
  timestamp: string;
  is_today: boolean;
}

interface StudentDetailModalProps {
  student: ChildData | null;
  teacherName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const MOOD_STYLES: Record<string, string> = {
  Stable: 'bg-success/15 text-success border-success/30',
  'Needs Attention': 'bg-warning/15 text-warning border-warning/30',
  Critical: 'bg-error/15 text-error border-error/30',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BRACELET_STATUS_STYLES: Record<string, string> = {
  connected: 'bg-success/15 text-success border-success/30',
  syncing: 'bg-primary/10 text-primary border-primary/20',
  low_battery: 'bg-warning/15 text-warning border-warning/30',
  offline: 'bg-outline-variant/20 text-outline border-outline-variant/30',
};

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  teacherName = 'Educator',
  isOpen,
  onClose,
}) => {
  const [updates, setUpdates] = useState<ClinicalUpdate[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');

  const loadUpdates = useCallback(async () => {
    if (!student) return;
    setIsLoadingUpdates(true);
    try {
      const res = await apiClient.get(`/clinical-updates/${student.id}`);
      setUpdates(res.data);
    } catch (err) {
      console.error('[StudentDetailModal] Failed to fetch updates:', err);
      setUpdates([]);
    } finally {
      setIsLoadingUpdates(false);
    }
  }, [student]);

  useEffect(() => {
    if (isOpen && student) {
      loadUpdates();
      setNewNote('');
      setPostError('');
      setPostSuccess(false);
    }
  }, [isOpen, student, loadUpdates]);

  const handlePostNote = async () => {
    if (!newNote.trim() || !student) return;
    setIsPosting(true);
    setPostError('');
    setPostSuccess(false);
    try {
      await apiClient.post('/clinical-updates', {
        child_id: student.id,
        provider: teacherName,
        message: newNote.trim(),
        is_today: true,
      });
      setNewNote('');
      setPostSuccess(true);
      await loadUpdates();
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      console.error('[StudentDetailModal] Post failed:', err);
      setPostError('Failed to post note. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  if (!student) return null;

  const mood = student.currentMood ?? 'Stable';
  const focusScore = student.focus_score ?? 0;
  const weeklyProgress = student.weeklyProgress ?? [];
  const maxWP = Math.max(...weeklyProgress, 1);

  return (
    <ClinicalModal
      isOpen={isOpen}
      onClose={onClose}
      title={student.user?.nom ?? 'Explorer Node'}
      subtitle={`${student.classe ?? 'No class'} · Age ${student.age ?? '—'} · ${student.user?.email ?? ''}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Status + Key Metrics Row */}
        <div className="flex flex-wrap gap-3">
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              MOOD_STYLES[mood] ?? MOOD_STYLES['Stable']
            }`}
          >
            {mood}
          </span>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-primary text-sm">analytics</span>
            <span className="text-[11px] font-bold text-on-surface">
              Focus: {focusScore}%
            </span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-tertiary text-sm">workspace_premium</span>
            <span className="text-[11px] font-bold text-on-surface">
              Milestones: {student.milestonesReached ?? 0}
            </span>
          </div>
          {student.sentimentTrend !== undefined && (
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-success text-sm">trending_up</span>
              <span className="text-[11px] font-bold text-on-surface">
                Sentiment: +{student.sentimentTrend}%
              </span>
            </div>
          )}
          {student.bracelet_id && (
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-outline text-sm">watch</span>
              <span className="text-[11px] font-mono text-on-surface">
                IoT: {student.bracelet_id}
              </span>
            </div>
          )}
          {student.braceletStatus && (
            <span
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                BRACELET_STATUS_STYLES[student.braceletStatus] ?? BRACELET_STATUS_STYLES.offline
              }`}
            >
              Bracelet {student.braceletStatus.replace('_', ' ')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-container-low rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Battery</p>
            <p className="text-xl font-black text-on-surface">{student.braceletBattery ?? 0}%</p>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Location</p>
            <p className="text-sm font-bold text-on-surface">{student.locationLabel ?? 'Unknown'}</p>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Activity</p>
            <p className="text-sm font-bold text-on-surface">{student.currentActivity ?? 'Monitoring'}</p>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Hydration</p>
            <p className="text-xl font-black text-on-surface">{student.hydrationLevel ?? 0}%</p>
          </div>
        </div>

        {/* Focus Score Bar */}
        <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Current Focus Level
            </p>
            <span className="font-mono font-black text-2xl text-primary">{focusScore}%</span>
          </div>
          <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${focusScore}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                focusScore >= 70
                  ? 'bg-success'
                  : focusScore >= 40
                  ? 'bg-warning'
                  : 'bg-error'
              }`}
            />
          </div>
        </div>

        {/* Weekly Progress Chart */}
        {weeklyProgress.length > 0 && (
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
              Weekly Progress
            </p>
            <div className="flex items-end gap-1.5 h-20">
              {weeklyProgress.slice(0, 7).map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / maxWP) * 72}px` }}
                    transition={{ delay: i * 0.08, duration: 0.6 }}
                    className={`w-full rounded-t-md ${
                      v >= 70
                        ? 'bg-success/70'
                        : v >= 40
                        ? 'bg-primary/60'
                        : 'bg-error/50'
                    }`}
                    style={{ minHeight: 3 }}
                  />
                  <span className="text-[9px] font-mono text-outline">{DAY_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Notes Section */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
            Add Clinical Note
          </p>
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Document observations, interventions, or flag urgent concerns…"
            rows={3}
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40 resize-none transition-colors"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {postSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-success text-xs font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Note posted
                  </motion.span>
                )}
                {postError && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-error text-xs"
                  >
                    {postError}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={handlePostNote}
              disabled={!newNote.trim() || isPosting}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {isPosting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  Posting…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  Post Note
                </>
              )}
            </button>
          </div>
        </div>

        {/* Update History */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
            Update History ({updates.length})
          </p>

          {isLoadingUpdates ? (
            <div className="py-6 flex items-center justify-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
              <span className="text-sm">Loading updates…</span>
            </div>
          ) : updates.length === 0 ? (
            <div className="py-8 text-center bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-3xl text-outline-variant">inbox</span>
              <p className="text-on-surface-variant text-sm mt-2">
                No clinical updates yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {updates
                  .slice()
                  .reverse()
                  .map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`p-4 rounded-xl border-l-4 ${
                        u.is_today
                          ? 'border-primary bg-primary-container/10'
                          : 'border-outline-variant/20 bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-mono text-outline mb-1.5">
                        <span className="font-bold text-primary">{u.provider}</span>
                        <span>·</span>
                        <span>{formatTime(u.timestamp)}</span>
                        {u.is_today && (
                          <span className="bg-primary-container text-primary px-1.5 py-0.5 rounded text-[9px] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">{u.message}</p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ClinicalModal>
  );
};
