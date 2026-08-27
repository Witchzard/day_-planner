export type Priority = 'High' | 'Medium' | 'Low';

export interface Subject {
  id: string;
  name: string;
  priority: Priority;
  weeklyTargetHours: number;
}

export type TaskType = 'Routine' | 'Extra';

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  date: string; // ISO date string (YYYY-MM-DD)
  scheduledTime?: string; // HH:mm
  priority: Priority;
  completed: boolean;
}

export interface StudySession {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  subjectId: string;
  topic: string;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes: number; // calculated or manually entered
  priority: Priority;
  notes?: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  weeklyStudyGoalHours: number;
}

export interface AppData {
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
  settings: Settings;
}
