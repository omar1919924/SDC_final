import { BraceletStatus, ChildData, EngagementStatus, RiskLevel } from '@/types';

const STATUS_SEQUENCE: EngagementStatus[] = [
  'focused',
  'distracted',
  'focused',
  'stressed',
  'focused',
  'offline',
];

const SYNC_OFFSETS = [18, 44, 9, 81, 27, 52];
const BRACELET_STATUS_SEQUENCE: BraceletStatus[] = [
  'connected',
  'syncing',
  'connected',
  'low_battery',
  'offline',
  'connected',
];
const LOCATION_SEQUENCE = [
  'Classroom A',
  'Reading Corner',
  'Sensory Room',
  'Outdoor Break Zone',
  'Science Lab',
  'Quiet Pod',
];
const ACTIVITY_SEQUENCE = [
  'Math focus block',
  'Guided reading',
  'Emotion regulation break',
  'Motor coordination game',
  'Creative writing',
  'Wearable reconnecting',
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function buildWeeklyProgress(baseFocus: number, index: number) {
  return Array.from({ length: 7 }, (_, dayIndex) => {
    const drift = (dayIndex - 3) * 3;
    const variance = ((index + 1) * (dayIndex + 2) * 7) % 12 - 6;
    return clamp(baseFocus + drift + variance, 32, 96);
  });
}

function getMoodFromFocus(focusScore: number): 'Stable' | 'Needs Attention' | 'Critical' {
  if (focusScore >= 72) return 'Stable';
  if (focusScore >= 45) return 'Needs Attention';
  return 'Critical';
}

function getRiskLevel(focusScore: number, engagementStatus: EngagementStatus, syncAgeSeconds: number): RiskLevel {
  if (focusScore < 45 || engagementStatus === 'stressed' || syncAgeSeconds > 60) {
    return 'high';
  }
  if (focusScore < 70 || engagementStatus === 'distracted' || syncAgeSeconds > 30) {
    return 'medium';
  }
  return 'low';
}

function buildAttentionFlags(
  engagementStatus: EngagementStatus,
  riskLevel: RiskLevel,
  trendDelta: number,
  syncAgeSeconds: number,
) {
  const flags: string[] = [];

  if (engagementStatus === 'distracted') flags.push('Attention wandering');
  if (engagementStatus === 'stressed') flags.push('Stress spike detected');
  if (syncAgeSeconds > 45) flags.push('Bracelet sync unstable');
  if (trendDelta < 0) flags.push('Weekly focus trending down');
  if (riskLevel === 'low') flags.push('On track');

  return flags;
}

function getRecommendedAction(riskLevel: RiskLevel, engagementStatus: EngagementStatus) {
  if (riskLevel === 'high' && engagementStatus === 'stressed') {
    return 'Schedule a calm break and notify the parent if stress persists.';
  }
  if (riskLevel === 'high') {
    return 'Check in within the next 10 minutes and reduce task load.';
  }
  if (riskLevel === 'medium') {
    return 'Use a short guided prompt and monitor the next activity block.';
  }
  return 'Maintain the current routine and reinforce the positive streak.';
}

export function normalizeTrackedStudents(students: ChildData[]): ChildData[] {
  return students.map((student, index) => {
    const engagementStatus = student.engagement_status || STATUS_SEQUENCE[index % STATUS_SEQUENCE.length];
    const focusSeed =
      student.focus_score ??
      (engagementStatus === 'focused'
        ? 84 - (index % 7) * 3
        : engagementStatus === 'distracted'
        ? 58 - (index % 5) * 2
        : engagementStatus === 'stressed'
        ? 38 + (index % 4) * 2
        : 22);

    const focusScore = clamp(focusSeed, 18, 96);
    const weeklyProgress =
      student.weeklyProgress && student.weeklyProgress.length >= 7
        ? student.weeklyProgress.slice(0, 7)
        : buildWeeklyProgress(focusScore, index);

    const lastSyncAt =
      student.last_sync_at ||
      new Date(Date.now() - SYNC_OFFSETS[index % SYNC_OFFSETS.length] * 1000).toISOString();

    const syncAgeSeconds = Math.max(
      0,
      Math.round((Date.now() - new Date(lastSyncAt).getTime()) / 1000),
    );

    const trendDelta = weeklyProgress[weeklyProgress.length - 1] - weeklyProgress[0];
    const mood = student.currentMood || getMoodFromFocus(focusScore);
    const riskLevel = student.riskLevel || getRiskLevel(focusScore, engagementStatus, syncAgeSeconds);
    const braceletStatus =
      student.braceletStatus ||
      (student.bracelet_id ? BRACELET_STATUS_SEQUENCE[index % BRACELET_STATUS_SEQUENCE.length] : 'offline');
    const attentionFlags =
      student.attentionFlags && student.attentionFlags.length > 0
        ? student.attentionFlags
        : buildAttentionFlags(engagementStatus, riskLevel, trendDelta, syncAgeSeconds);

    return {
      ...student,
      id: student.id || (student as { _id?: string })._id || student.user_id,
      engagement_status: engagementStatus,
      focus_score: focusScore,
      weeklyProgress,
      last_sync_at: lastSyncAt,
      currentMood: mood,
      milestonesReached: student.milestonesReached ?? 1 + (index % 4),
      sentimentTrend: student.sentimentTrend ?? clamp(Math.round(trendDelta), -18, 24),
      focusStreakMinutes: student.focusStreakMinutes ?? clamp(12 + index * 4, 8, 42),
      sessionMinutes: student.sessionMinutes ?? clamp(28 + index * 6, 20, 65),
      achievementRate: student.achievementRate ?? clamp(focusScore + 8, 35, 99),
      trendDelta,
      riskLevel,
      attentionFlags,
      recommendedAction: student.recommendedAction || getRecommendedAction(riskLevel, engagementStatus),
      braceletStatus,
      braceletBattery:
        student.braceletBattery ??
        (braceletStatus === 'low_battery' ? 18 : braceletStatus === 'offline' ? 0 : clamp(92 - index * 11, 22, 98)),
      braceletLastSeen: student.braceletLastSeen || lastSyncAt,
      locationLabel: student.locationLabel || LOCATION_SEQUENCE[index % LOCATION_SEQUENCE.length],
      currentActivity: student.currentActivity || ACTIVITY_SEQUENCE[index % ACTIVITY_SEQUENCE.length],
      hydrationLevel: student.hydrationLevel ?? clamp(55 + index * 7, 48, 96),
    };
  });
}
