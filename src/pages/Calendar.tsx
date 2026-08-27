import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Card, Button, Badge } from '../components/ui';
import { AddTaskModal, AddStudySessionModal } from '../components/Modals';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatDuration } from '../lib/utils';

export default function CalendarPage() {
  const { data } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTasks = data.tasks.filter(t => t.date === selectedDateStr);
  const selectedSessions = data.studySessions.filter(s => s.date === selectedDateStr);
  
  const selectedTotalStudy = selectedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Determine padding for first day of month
  const startDay = start.getDay();
  // Adjust so Monday is 0, or just use default Sunday is 0. Let's stick to Sunday = 0
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400">Plan and review your month.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>Today</Button>
                <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-slate-500 py-2">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {paddingDays.map(i => (
                <div key={`pad-${i}`} className="aspect-square rounded-lg opacity-0" />
              ))}
              
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasTasks = data.tasks.some(t => t.date === dateStr);
                const hasStudy = data.studySessions.some(s => s.date === dateStr);
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg p-1 transition-all
                      ${!isSameMonth(day, currentDate) ? 'text-slate-400 opacity-50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                      ${isSameDay(day, selectedDate) ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900' : ''}
                      ${isToday(day) && !isSameDay(day, selectedDate) ? 'border border-slate-900 dark:border-slate-100' : ''}
                    `}
                  >
                    <span className="text-sm">{format(day, 'd')}</span>
                    <div className="flex gap-1 mt-1 h-1.5">
                      {hasTasks && <div className={`w-1.5 h-1.5 rounded-full ${isSameDay(day, selectedDate) ? 'bg-slate-400 dark:bg-slate-600' : 'bg-amber-500'}`} />}
                      {hasStudy && <div className={`w-1.5 h-1.5 rounded-full ${isSameDay(day, selectedDate) ? 'bg-white dark:bg-slate-900' : 'bg-blue-500'}`} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-1">{format(selectedDate, 'EEEE, MMMM d')}</h3>
            <p className="text-sm text-slate-500 mb-6">{isToday(selectedDate) ? 'Today' : ''}</p>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    Tasks
                    <Badge variant="secondary">{selectedTasks.length}</Badge>
                  </h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsTaskModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No tasks.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedTasks.map(t => (
                      <li key={t.id} className="text-sm flex items-start gap-2">
                        <span className={t.completed ? 'text-green-500' : 'text-slate-400'}>•</span>
                        <span className={t.completed ? 'line-through opacity-60' : ''}>
                          {t.name} {t.durationMinutes ? <span className="text-slate-500 ml-1">({formatDuration(t.durationMinutes)})</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    Study
                    <Badge variant="secondary">{formatDuration(selectedTotalStudy)}</Badge>
                  </h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsStudyModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedSessions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No study sessions.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedSessions.map(s => {
                      const sub = data.subjects.find(sub => sub.id === s.subjectId);
                      return (
                        <li key={s.id} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <div>
                            <p className="font-medium">{sub?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{formatDuration(s.durationMinutes)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} defaultDate={selectedDateStr} />
      <AddStudySessionModal isOpen={isStudyModalOpen} onClose={() => setIsStudyModalOpen(false)} defaultDate={selectedDateStr} />
    </div>
  );
}
