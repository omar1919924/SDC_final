export type UserRole = 'student' | 'parent' | 'teacher' | 'enfant';
export type RiskLevel = 'low' | 'medium' | 'high';
export type BraceletStatus = 'connected' | 'syncing' | 'low_battery' | 'offline';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  parent_id?: string;
  teacher_id?: string;
  focus_score: number;
  status: 'Stable' | 'Needs Attention' | 'Critical';
  notes: string;
  trend_data: number[];
  avatar_url?: string;
}

export type EngagementStatus = 'focused' | 'distracted' | 'stressed' | 'offline';

/** Aligned to backend ChildResponse schema */
export interface ChildData {
  id: string;
  user_id: string;
  age?: number;
  classe?: string;
  parent_id?: string;
  teacher_id?: string;
  bracelet_id?: string;
  chatbot_session_id?: string;
  focus_score?: number;
  milestonesReached?: number;
  sentimentTrend?: number;
  currentMood?: string; // Legacy field
  engagement_status?: EngagementStatus; // New "Live" field
  last_sync_at?: string; // ISO timestamp
  weeklyProgress?: number[];
  user?: User;
  riskLevel?: RiskLevel;
  attentionFlags?: string[];
  focusStreakMinutes?: number;
  sessionMinutes?: number;
  achievementRate?: number;
  trendDelta?: number;
  recommendedAction?: string;
  braceletStatus?: BraceletStatus;
  braceletBattery?: number;
  braceletLastSeen?: string;
  locationLabel?: string;
  currentActivity?: string;
  hydrationLevel?: number;
}

/** Aligned to backend TeacherResponse schema */
export interface TeacherProfile {
  id: string;
  user_id: string;
  matiere?: string;
  classe?: string;
  ecole?: string;
  numero?: string;
  avatar_url?: string;
}

export interface QuestStep {
  id: string;
  title: string;
  label: string;
  status: 'done' | 'current' | 'locked';
  icon?: string;
}

export interface FocusMetric {
  label: string;
  value: string | number;
  trend?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'error' | 'surface';
}

export interface ClinicalUpdate {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  is_urgent?: boolean;
}
