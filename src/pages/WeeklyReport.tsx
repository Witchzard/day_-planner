import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Card, Button } from '../components/ui';
import { formatDuration } from '../lib/utils';
import { format, subWeeks, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Trophy, Target, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
const DARK_COLORS = ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569'];

export default function WeeklyReport() {
  const { data } = useData();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start
  
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  // Filter data for the selected week
  const weekStrStart = format(currentWeekStart, 'yyyy-MM-dd');
  const weekStrEnd = format(weekEnd, 'yyyy-MM-dd');
  
  const weekSessions = data.studySessions.filter(s => s.date >= weekStrStart && s.date <= weekStrEnd);
  const weekTasks = data.tasks.filter(t => t.date >= weekStrStart && t.date <= weekStrEnd);

  // Weekly Study Time
  const totalStudyMinutes = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalStudyHours = totalStudyMinutes / 60;
  
  // Goal Progress
  const goalHours = data.settings.weeklyStudyGoalHours;
  const goalPercent = Math.min(100, Math.round((totalStudyHours / goalHours) * 100)) || 0;

  // Daily Breakdown Data
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const daySessions = weekSessions.filter(s => s.date === dateStr);
    const minutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      name: format(day, 'EEE'), // Mon, Tue...
      hours: Number((minutes / 60).toFixed(1)),
      minutes,
    };
  });

  // Subject Breakdown Data
  const subjectMinutes: Record<string, number> = {};
  weekSessions.forEach(s => {
    const sub = data.subjects.find(sub => sub.id === s.subjectId);
    const name = sub ? sub.name : 'Unknown';
    subjectMinutes[name] = (subjectMinutes[name] || 0) + s.durationMinutes;
  });

  const subjectData = Object.entries(subjectMinutes)
    .map(([name, minutes]) => ({ name, value: minutes, hours: Number((minutes / 60).toFixed(1)) }))
    .sort((a, b) => b.value - a.value);

  // Task Analytics
  const completedTasks = weekTasks.filter(t => t.completed).length;
  const taskCompletionRate = weekTasks.length > 0 ? Math.round((completedTasks / weekTasks.length) * 100) : 0;
  const routineTasks = weekTasks.filter(t => t.type === 'Routine').length;
  const extraTasks = weekTasks.filter(t => t.type === 'Extra').length;

  // Insights
  const bestDay = dailyData.reduce((max, d) => d.minutes > max.minutes ? d : max, dailyData[0]);
  const bestSubject = subjectData.length > 0 ? subjectData[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Report</h1>
          <p className="text-slate-500 dark:text-slate-400">Analyze your study habits and progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium px-2">
            {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </header>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 col-span-1 md:col-span-2">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between h-full">
            <div>
              <h2 className="text-sm font-medium text-slate-500 mb-2">Total Weekly Study Time</h2>
              <p className="text-4xl font-bold">{formatDuration(totalStudyMinutes)}</p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-1"><Target className="h-4 w-4" /> Goal: {goalHours}h</span>
                <span className="text-slate-500">{goalPercent}%</span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${goalPercent >= 100 ? 'bg-green-500' : 'bg-slate-900 dark:bg-slate-100'}`}
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              {goalPercent >= 100 && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Goal Achieved!
                </p>
              )}
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-2">Task Completion</h2>
          <div className="flex items-end gap-2 mb-2">
            <p className="text-4xl font-bold">{taskCompletionRate}%</p>
          </div>
          <p className="text-sm text-slate-500">{completedTasks} of {weekTasks.length} tasks completed</p>
          <div className="flex gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" /> {routineTasks} Routine</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-100" /> {extraTasks} Extra</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Daily Study Breakdown</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm text-sm">
                          <p className="font-semibold mb-1">{data.name}</p>
                          <p>{formatDuration(data.minutes)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="currentColor" className="fill-slate-900 dark:fill-slate-100" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-6">Subject Breakdown</h2>
          {subjectData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-slate-500 italic">No study data for this week</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8 h-[250px]">
              <div className="h-full w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="dark:hidden" />
                      ))}
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-dark-${index}`} fill={DARK_COLORS[index % DARK_COLORS.length]} className="hidden dark:block" />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm text-sm">
                              <p className="font-semibold mb-1">{data.name}</p>
                              <p>{formatDuration(data.value)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-3">
                {subjectData.slice(0, 4).map((subject, index) => (
                  <div key={subject.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium truncate max-w-[120px]">{subject.name}</span>
                    </div>
                    <div className="text-right">
                      <p>{formatDuration(subject.value)}</p>
                      <p className="text-xs text-slate-500">{Math.round((subject.value / totalStudyMinutes) * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-none">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Weekly Insights</h2>
        <ul className="space-y-2 text-slate-700 dark:text-slate-300">
          <li>• You studied for a total of <strong>{formatDuration(totalStudyMinutes)}</strong> this week.</li>
          {totalStudyMinutes > 0 && (
            <>
              <li>• Your average daily study time was <strong>{formatDuration(totalStudyMinutes / 7)}</strong>.</li>
              {bestDay && bestDay.minutes > 0 && <li>• <strong>{bestDay.name}</strong> was your most productive study day ({formatDuration(bestDay.minutes)}).</li>}
              {bestSubject && <li>• <strong>{bestSubject.name}</strong> received the most study time this week ({formatDuration(bestSubject.value)}).</li>}
            </>
          )}
          {weekTasks.length > 0 && (
            <li>• You completed <strong>{taskCompletionRate}%</strong> of your planned tasks.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
