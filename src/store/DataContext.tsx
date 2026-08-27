import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, Subject, Task, StudySession, Settings } from '../types';

const STORAGE_KEY = 'student-planner-data';

const defaultSettings: Settings = {
  theme: 'system',
  weeklyStudyGoalHours: 35,
};

const defaultData: AppData = {
  subjects: [],
  tasks: [],
  studySessions: [],
  settings: defaultSettings,
};

interface DataContextType {
  data: AppData;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, session: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  
  updateSettings: (settings: Partial<Settings>) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultData, ...parsed, settings: { ...defaultSettings, ...parsed.settings } };
      } catch (e) {
        console.error('Failed to parse stored data', e);
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (data.settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(data.settings.theme);
    }
  }, [data.settings.theme]);

  const addSubject = (subject: Subject) => {
    setData((prev) => ({ ...prev, subjects: [...prev.subjects, subject] }));
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      // Also potentially clean up associated study sessions, but we'll leave them as they have string subjectId 
      // or we can nullify it. The prompt says "Never delete historical information automatically." 
      // So we keep the sessions but they might reference a deleted subject.
    }));
  };

  const addTask = (task: Task) => {
    setData((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const addStudySession = (session: StudySession) => {
    setData((prev) => ({ ...prev, studySessions: [...prev.studySessions, session] }));
  };

  const updateStudySession = (id: string, updates: Partial<StudySession>) => {
    setData((prev) => ({
      ...prev,
      studySessions: prev.studySessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteStudySession = (id: string) => {
    setData((prev) => ({
      ...prev,
      studySessions: prev.studySessions.filter((s) => s.id !== id),
    }));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  };

  const resetData = () => {
    setData(defaultData);
  };

  return (
    <DataContext.Provider
      value={{
        data,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        updateSettings,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
