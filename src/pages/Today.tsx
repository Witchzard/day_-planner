import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { format } from 'date-fns';
import { Card, Button, Badge } from '../components/ui';
import { AddTaskModal, AddStudySessionModal } from '../components/Modals';
import { formatDuration } from '../lib/utils';
import { Plus, CheckCircle2, Circle, Edit, Trash2 } from 'lucide-react';
import { Task } from '../types';

export default function Today() {
  const { data, updateTask, deleteTask, deleteStudySession } = useData();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

  const todayTasks = data.tasks.filter(t => t.date === todayStr);
  const todaySessions = data.studySessions.filter(s => s.date === todayStr);

  const completedTasks = todayTasks.filter(t => t.completed).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0;

  const totalStudyMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const subjectIdsStudied = new Set(todaySessions.map(s => s.subjectId));
  
  // Calculate most studied subject today
  let mostStudiedSubjectName = 'None';
  let maxMinutes = 0;
  const subjectMinutes: Record<string, number> = {};
  
  todaySessions.forEach(s => {
    subjectMinutes[s.subjectId] = (subjectMinutes[s.subjectId] || 0) + s.durationMinutes;
    if (subjectMinutes[s.subjectId] > maxMinutes) {
      maxMinutes = subjectMinutes[s.subjectId];
      const subject = data.subjects.find(sub => sub.id === s.subjectId);
      mostStudiedSubjectName = subject ? subject.name : 'Unknown';
    }
  });

  const toggleTask = (task: Task) => {
    updateTask(task.id, { completed: !task.completed });
  };

  // Group sessions by subject for the list
  const sessionsBySubject = todaySessions.reduce((acc, session) => {
    const sub = data.subjects.find(s => s.id === session.subjectId);
    const name = sub ? sub.name : 'Unknown';
    if (!acc[name]) acc[name] = 0;
    acc[name] += session.durationMinutes;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{format(new Date(), 'EEEE')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsTaskModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
          <Button onClick={() => setIsStudyModalOpen(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Study Session
          </Button>
        </div>
      </header>

      {todayTasks.length > 0 && (
        <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 border-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily Progress</span>
            <span className="text-sm text-slate-500">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Today's Tasks
            <Badge variant="secondary" className="ml-2">{todayTasks.length}</Badge>
          </h2>
          
          {todayTasks.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-slate-500 mb-4">No tasks planned for today.</p>
              <Button onClick={() => setIsTaskModalOpen(true)} variant="outline" size="sm">Add Task</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayTasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map(task => (
                <Card key={task.id} className={`p-4 transition-all ${task.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleTask(task)} className="mt-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                      {task.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`font-medium truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.name}
                        </span>
                        <Badge variant={task.type === 'Routine' ? 'secondary' : 'default'} className="text-[10px] px-1.5 py-0">
                          {task.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {task.scheduledTime && <span>{task.scheduledTime}</span>}
                        <span className={`flex items-center gap-1 ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                          • {task.priority} Priority
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Study Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Study Tracking
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="p-4 bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 border-none">
              <p className="text-sm opacity-80 mb-1">Total Study Time</p>
              <p className="text-2xl font-bold">{formatDuration(totalStudyMinutes)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500 mb-1">Sessions</p>
              <p className="text-2xl font-bold">{todaySessions.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500 mb-1">Subjects</p>
              <p className="text-2xl font-bold">{subjectIdsStudied.size}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500 mb-1">Most Studied</p>
              <p className="text-lg font-bold truncate" title={mostStudiedSubjectName}>{mostStudiedSubjectName}</p>
            </Card>
          </div>

          {todaySessions.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-slate-500 mb-4">No study sessions recorded today.</p>
              <Button onClick={() => setIsStudyModalOpen(true)} variant="outline" size="sm">Add Study Session</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-6 mb-2">Session Breakdown</h3>
              {Object.entries(sessionsBySubject).map(([subject, minutes]) => (
                <Card key={subject} className="p-4 flex items-center justify-between">
                  <span className="font-medium">{subject}</span>
                  <span className="text-slate-500 font-mono">{formatDuration(minutes)}</span>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} defaultDate={todayStr} />
      <AddStudySessionModal isOpen={isStudyModalOpen} onClose={() => setIsStudyModalOpen(false)} defaultDate={todayStr} />
    </div>
  );
}

