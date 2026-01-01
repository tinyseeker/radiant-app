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

export interface JournalData {
  hasCompletedOnboarding: boolean;
  affirmations: string[];
  morningRoutine: string;
  eveningRoutine: string;
  goals: Goals;
  traits: string[];
  standards: string[];
  dailyReminders: string[];
  visionBoards: VisionBoards;
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
  visionBoards: {
    roleModels: [],
    lifestyle: [],
    bodyGoals: [],
    successSymbols: [],
    inspiration: [],
  },
};
