// shared/types/study-plan.ts
export type StudyGoal =
  | "memorize_juz_30"
  | "read_entire_quran"
  | "understand_specific_surah"
  | "improve_tajweed"
  | "custom";

export type TimeCommitment = "10min" | "20min" | "30min" | "45min";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface StudyPlanInput {
  goal: StudyGoal;
  customGoalText?: string; // Required if goal === 'custom'
  specificSurah?: string; // Required if goal === 'understand_specific_surah'
  timeCommitment: TimeCommitment;
  skillLevel: SkillLevel;
}

export interface DailyTask {
  id: string; // UUID
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  title: string; // "Read Surah Al-Baqarah verses 1-20 with tajweed"
  description: string; // Detailed instructions
  estimatedMinutes: number;
  screenDeepLink: string; // "VerseReader?surahId=2&startVerse=1&endVerse=20"
  completed: boolean;
  completedAt?: number; // Timestamp
}

export interface WeeklyPlan {
  id: string; // UUID
  createdAt: number; // Timestamp
  weekStartDate: string; // ISO date (Monday)
  goal: StudyGoal;
  customGoalText?: string;
  timeCommitment: TimeCommitment;
  skillLevel: SkillLevel;
  tasks: DailyTask[]; // 7 days of tasks
  completionRate: number; // 0-100%
  streak: number; // Consecutive days completed
}

export interface AdaptationInput {
  planId: string;
  completedTasks: string[]; // Array of task IDs
  userFeedback: "too_easy" | "just_right" | "too_hard" | "not_enough_time";
}
