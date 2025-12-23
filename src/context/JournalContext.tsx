import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JournalData, initialJournalData } from '../types/journal';
import { storageService } from '../utils/storage';

interface JournalContextType {
  journal: JournalData;
  updateJournal: (data: Partial<JournalData>) => Promise<void>;
  isLoading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [journal, setJournal] = useState<JournalData>(initialJournalData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    try {
      const data = await storageService.loadJournal();
      setJournal(data);
    } catch (error) {
      console.error('Failed to load journal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateJournal = async (data: Partial<JournalData>) => {
    try {
      const updatedJournal = { ...journal, ...data };
      setJournal(updatedJournal);
      await storageService.saveJournal(updatedJournal);
    } catch (error) {
      console.error('Failed to update journal:', error);
      throw error;
    }
  };

  return (
    <JournalContext.Provider value={{ journal, updateJournal, isLoading }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within JournalProvider');
  }
  return context;
};
