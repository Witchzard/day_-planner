import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Card, Button, Badge, Select } from '../components/ui';
import { AddTaskModal } from '../components/Modals';
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';
import { Task } from '../types';
import { formatDuration } from '../lib/utils';

export default function Tasks() {
  const { data, updateTask, deleteTask } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = data.tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Today') return task.date === todayStr;
    if (filter === 'Upcoming') return task.date > todayStr;
    if (filter === 'Completed') return task.completed;
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Routine') return task.type === 'Routine';
    if (filter === 'Extra') return task.type === 'Extra';
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'Date') {
      return a.date.localeCompare(b.date);
    }
    if (sortBy === 'Priority') {
      const p = { High: 3, Medium: 2, Low: 1 };
      return p[b.priority] - p[a.priority];
    }
    return 0;
  });

  const toggleTask = (task: Task) => {
    updateTask(task.id, { completed: !task.completed });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all your scheduled tasks.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-slate-500">Filter:</span>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-[150px]">
            <option value="All">All</option>
            <option value="Today">Today</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Routine">Routine Tasks</option>
            <option value="Extra">Extra Tasks</option>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-slate-500">Sort:</span>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-[150px]">
            <option value="Date">Date</option>
            <option value="Priority">Priority</option>
          </Select>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-slate-500 mb-4">No tasks found for the current filters.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">Create a Task</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map(task => (
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
                    <span>{task.date}</span>
                    {task.scheduledTime && <span>• {task.scheduledTime}</span>}
                    {task.durationMinutes && <span>• {formatDuration(task.durationMinutes)}</span>}
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

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
