import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Card, Button, Badge } from '../components/ui';
import { AddStudySessionModal } from '../components/Modals';
import { formatDuration } from '../lib/utils';
import { format, subDays, isAfter } from 'date-fns';
import { Plus, Trash2, Clock, CalendarDays } from 'lucide-react';

export default function Study() {
  const { data, deleteStudySession } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate some basic stats
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = data.studySessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const weekSessions = data.studySessions.filter(s => s.date >= sevenDaysAgo);
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Group by subject for the week
  const subjectMinutes: Record<string, number> = {};
  weekSessions.forEach(s => {
    const sub = data.subjects.find(sub => sub.id === s.subjectId);
    const name = sub ? sub.name : 'Unknown';
    subjectMinutes[name] = (subjectMinutes[name] || 0) + s.durationMinutes;
  });

  // Sort sessions by date descending
  const sortedSessions = [...data.studySessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Sessions</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and review your study time.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Session
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Today's Study Time</h3>
          <p className="text-3xl font-bold">{formatDuration(todayMinutes)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Past 7 Days</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatDuration(weekMinutes)}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Sessions</h2>
        {sortedSessions.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <p className="text-slate-500 mb-4">No study sessions recorded yet.</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">Record a Session</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedSessions.map(session => {
              const subject = data.subjects.find(s => s.id === session.subjectId);
              return (
                <Card key={session.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{subject?.name || 'Unknown'}</Badge>
                        <span className="font-semibold">{session.topic}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                        <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {session.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(session.durationMinutes)}</span>
                        {(session.startTime && session.endTime) && (
                          <span>({session.startTime} - {session.endTime})</span>
                        )}
                      </div>
                      {session.notes && (
                        <p className="text-sm mt-3 text-slate-600 dark:text-slate-300 italic">"{session.notes}"</p>
                      )}
                    </div>
                    <button onClick={() => deleteStudySession(session.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddStudySessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
