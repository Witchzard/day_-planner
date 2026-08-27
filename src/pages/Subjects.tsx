import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Card, Button, Badge } from '../components/ui';
import { AddSubjectModal } from '../components/Modals';
import { Plus, Trash2, BookMarked } from 'lucide-react';

export default function Subjects() {
  const { data, deleteSubject } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your study subjects and priorities.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </header>

      {data.subjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <BookMarked className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No subjects yet</h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create subjects to start tracking your study time and setting weekly goals.</p>
          <Button onClick={() => setIsModalOpen(true)}>Add Your First Subject</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subjects.map(subject => (
            <Card key={subject.id} className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">{subject.name}</h3>
                <button onClick={() => deleteSubject(subject.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Priority</span>
                  <Badge variant="outline" className={
                    subject.priority === 'High' ? 'text-red-500 border-red-200 dark:border-red-900' : 
                    subject.priority === 'Medium' ? 'text-amber-500 border-amber-200 dark:border-amber-900' : 
                    'text-blue-500 border-blue-200 dark:border-blue-900'
                  }>
                    {subject.priority}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Weekly Target</span>
                  <span className="font-medium">{subject.weeklyTargetHours}h / week</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddSubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
