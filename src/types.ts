export type Subject = 'math' | 'english' | 'chinese' | 'physics' | 'chemistry' | 'biology' | 'politics' | 'history' | 'geography';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  totalXP: number;
  streak: number;
  lastStudyDate: string;
  settings?: UserSettings;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'daily' | 'weekly';
  subject?: Subject | 'all';
  targetValue: number;
  progress: number;
  deadline: string;
  completed: boolean;
  title: string;
}

export type StudyDifficulty = 'easy' | 'normal' | 'hard' | 'hell';

export interface UserSettings {
  theme: 'cyber-dark' | 'study-light' | 'neon' | 'nature' | 'anime';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  aiEnabled: boolean;
  notificationsEnabled: boolean;
  bgmVolume: number;
  studyReminderTime?: string;
  studyReminderDays?: string[];
}

export interface Reminder {
  id: string;
  userId: string;
  time: string;
  repeat: string[];
  enabled: boolean;
  type: 'fixed' | 'ai' | 'streak-protection';
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  xp: number;
  streak: number;
  rank: number;
  period: 'weekly' | 'all-time';
}

export interface BeastSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked?: boolean;
  requiredLevel: number;
  effect: string;
}

export interface Beast {
  id: string;
  subject: Subject;
  level: number;
  xp: number;
  stage: number;
  mood: number;
  lastInteraction: string;
  skills?: BeastSkill[];
  skillPoints?: number;
}

export interface StudySession {
  id: string;
  subject: Subject;
  xpEarned: number;
  timestamp: string;
  accuracy: number;
  duration: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface WrongQuestion extends Question {
  subject: Subject;
  addedAt: string;
}

export interface Achievement {
  id: string;
  unlockedAt: string;
  progress: number;
  completed: boolean;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetValue: number;
  category: 'study' | 'beast' | 'social' | 'streak';
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'quiz' | 'milestone';
  status: 'locked' | 'available' | 'completed';
  xpReward: number;
  subject: Subject;
  aiTips?: string;
}

export interface LearningPath {
  subject: Subject;
  nodes: LearningPathNode[];
  currentLevel: number;
}

export interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  beastId?: string; // Which beast is talking
}
