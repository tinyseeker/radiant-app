export interface Goals {
  wealth: string;
  business: string;
  healthFitness: string;
  personalBehavior: string;
}

export interface VisionBoardImage {
  id: string;
  uri: string;
  label?: string;
  addedAt: number;
}

export type VisionBoardCategory = 'roleModels' | 'lifestyle' | 'bodyGoals' | 'successSymbols' | 'inspiration';

export interface VisionBoards {
  roleModels: VisionBoardImage[];
  lifestyle: VisionBoardImage[];
  bodyGoals: VisionBoardImage[];
  successSymbols: VisionBoardImage[];
  inspiration: VisionBoardImage[];
}

export type MoodRating = 1 | 2 | 3 | 4 | 5; // 1=terrible, 2=bad, 3=okay, 4=good, 5=great

export interface DailyJournalEntry {
  id: string;
  date: string; // "YYYY-MM-DD" format
  gratitude: string[]; // List of things grateful for
  eveningReview: string; // Evening reflection text
  mood?: MoodRating; // Optional mood rating for the day
  completedHabits?: string[]; // List of habit names completed for the day
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface JournalData {
  hasCompletedOnboarding: boolean;
  affirmations: string[];
  morningRoutine: string;
  eveningRoutine: string;
  goals: Goals;
  traits: string[];
  standards: string[];
  dailyReminders: string[];
  dailyHabits: string[];
  visionBoards: VisionBoards;
  dailyEntries: Record<string, DailyJournalEntry>; // date string -> entry
}

export const initialJournalData: JournalData = {
  hasCompletedOnboarding: false,
  affirmations: [],
  morningRoutine: '',
  eveningRoutine: '',
  goals: {
    wealth: '',
    business: '',
    healthFitness: '',
    personalBehavior: '',
  },
  traits: [],
  standards: [],
  dailyReminders: [],
  dailyHabits: [],
  visionBoards: {
    roleModels: [],
    lifestyle: [],
    bodyGoals: [],
    successSymbols: [],
    inspiration: [],
  },
  dailyEntries: {},
};
