export type PersonaType = 'Student' | 'Professional' | 'Entrepreneur';

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  xp: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  category?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic?: string;
  box?: number; // Leitner system box
}

export interface GuildMember {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'offline' | 'idle' | 'focusing';
  focusSessionLeft?: string; // e.g. "18m left"
  xp: number;
  streak: number;
  glowing: boolean;
  recentActivity?: string;
  isCurrentUser?: boolean;
}

export interface FocusDuel {
  id: string;
  challengerId: string;
  challengerName: string;
  targetDuration: number; // in minutes
  xpPool: number;
  deadlineMinutes: number;
  status: 'pending' | 'active' | 'completed' | 'declined';
  userProgressMinutes: number;
  challengerProgressMinutes: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface MeetingInvite {
  id: string;
  title: string;
  time: string;
  duration: number; // in minutes
  priority: 'high' | 'low';
  status: 'pending' | 'declined' | 'accepted' | 'shielded';
  organizer: string;
}
