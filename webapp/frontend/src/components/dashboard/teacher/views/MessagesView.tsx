'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChildData } from '@/types';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoSkeleton } from '@/components/ui/SkeletonLoaders';

interface ClinicalUpdate {
  id: string;
  child_id: string;
  provider: string;
  message: string;
  timestamp: string;
  is_today: boolean;
}

interface MessagesViewProps {
  students: ChildData[];
  teacherName?: string;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  students,
  teacherName = 'Educator',
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [updates, setUpdates] = useState<ClinicalUpdate[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);

  // New update form state
  const [message, setMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');

  // Auto-select first student
  useEffect(() => {
    if (students.length > 0 && !selectedChildId) {
      setSelectedChildId(students[0].id);
    }
  }, [students, selectedChildId]);

  // Fetch updates when selected child changes
  const loadUpdates = useCallback(async () => {
    if (!selectedChildId) return;
    setIsLoadingUpdates(true);
    try {
      const res = await apiClient.get(`/clinical-updates/${selectedChildId}`);
      setUpdates(res.data);
    } catch (err) {
      console.error('[MessagesView] Failed to load clinical updates:', err);
      setUpdates([]);
    } finally {
      setIsLoadingUpdates(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const handlePost = async () => {
    if (!message.trim() || !selectedChildId) return;
    setIsPosting(true);
    setPostError('');
    setPostSuccess(false);
    try {
      await apiClient.post('/clinical-updates', {
        child_id: selectedChildId,
        provider: teacherName,
        message: message.trim(),
        is_today: true,
      });
      setMessage('');
      setPostSuccess(true);
      await loadUpdates();
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      console.error('[MessagesView] Failed to post update:', err);
      setPostError('Failed to post update. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedChildId);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-headline text-3xl font-bold text-primary italic lowercase tracking-tight">
          Clinical Updates
        </h2>
        <p className="text-on-surface-variant text-sm">
          Post and review case notes for your assigned students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Student Selector */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
            Select Student Node
          </p>
          {students.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No students assigned.</p>
          ) : (
            students.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedChildId(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  selectedChildId === s.id
                    ? 'bg-primary-container border-primary/20 text-primary'
                    : 'bg-surface-container-low border-outline-variant/10 text-on-surface hover:bg-primary/5'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm text-outline">person</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{s.user?.nom ?? 'Explorer Node'}</p>
                  <p className="text-[10px] text-outline truncate">
                    {s.classe ?? 'No class'} · Focus {s.focus_score ?? '—'}%
                  </p>
                </div>
                {selectedChildId === s.id && (
                  <span className="material-symbols-outlined text-primary text-sm ml-auto shrink-0">
                    chevron_right
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Right — Updates Feed + Compose */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStudent && (
            <div className="bg-primary-container/20 border border-primary/10 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">clinical_notes</span>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {selectedStudent.user?.nom ?? 'Explorer Node'}
                </p>
                <p className="text-[10px] text-outline">
                  {selectedStudent.classe ?? '—'} · Mood: {selectedStudent.currentMood ?? 'Stable'}
                </p>
              </div>
            </div>
          )}

          {/* Compose Box */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              New Clinical Update
            </p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Document behavioral patterns, intervention notes, focus observations…"
              rows={4}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/40 resize-none transition-colors"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-outline">{message.length} / 500 chars</span>
              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {postSuccess && (
                    <motion.span
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-success text-xs font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Posted
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
                <button
                  onClick={handlePost}
                  disabled={!message.trim() || isPosting || !selectedChildId}
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
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
                      Post Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Updates Feed */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 space-y-4 max-h-[420px] overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Update History
            </p>
            {isLoadingUpdates ? (
              <div className="space-y-3">
                <BentoSkeleton className="h-20" />
                <BentoSkeleton className="h-20" />
              </div>
            ) : updates.length === 0 ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-outline-variant">
                  inbox
                </span>
                <p className="text-on-surface-variant text-sm mt-2">
                  No clinical updates yet for this student.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {updates
                  .slice()
                  .reverse()
                  .map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex gap-4 border-l-4 pl-4 py-2 ${
                        u.is_today ? 'border-primary' : 'border-outline-variant/30'
                      }`}
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-outline mb-1">
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
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
