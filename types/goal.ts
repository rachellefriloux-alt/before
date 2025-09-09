export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number; // 0-100
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  milestones: Milestone[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  completedDate?: Date;
  dueDate?: Date;
}

export type GoalCategory =
  | 'health'
  | 'fitness'
  | 'career'
  | 'education'
  | 'personal'
  | 'relationships'
  | 'finance'
  | 'creativity'
  | 'spirituality'
  | 'other';

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export type GoalStatus =
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export interface GoalProgress {
  goalId: string;
  date: Date;
  value: number;
  notes?: string;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  completionRate: number;
  averageProgress: number;
  goalsByCategory: Record<GoalCategory, number>;
  recentAchievements: Goal[];
}
