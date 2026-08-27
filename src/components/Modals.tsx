import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Modal, Button, Input, Select, Label, Card, Badge } from './ui';
import { generateId } from '../lib/utils';
import { Priority, TaskType } from '../types';
import { format } from 'date-fns';

export function AddTaskModal({ isOpen, onClose, defaultDate }: { isOpen: boolean, onClose: () => void, defaultDate?: string }) {
  const { addTask } = useData();
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<TaskType>('Routine');
  
  const [name, setName] = useState('');
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    addTask({
      id: generateId(),
      type,
      name,
      date,
      scheduledTime: scheduledTime || undefined,
      durationMinutes: duration ? Number(duration) : undefined,
      priority,
      completed: false
    });
    
    // Reset and close
    setName('');
    setScheduledTime('');
    setDuration('');
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { setStep(1); onClose(); }} title="Add Task">
      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">What kind of task is this?</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setType('Routine'); setStep(2); }}
              className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-900 dark:hover:border-slate-100 transition-all text-left"
            >
              <span className="font-semibold text-lg mb-1">Routine</span>
              <span className="text-xs text-slate-500 text-center">College, Exercise, Daily revision</span>
            </button>
            <button 
              onClick={() => { setType('Extra'); setStep(2); }}
              className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-900 dark:hover:border-slate-100 transition-all text-left"
            >
              <span className="font-semibold text-lg mb-1">Extra</span>
              <span className="text-xs text-slate-500 text-center">Assignment, Project, Exam prep</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={type === 'Routine' ? 'secondary' : 'default'}>{type} Task</Badge>
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="h-6 text-xs px-2">Change</Button>
          </div>
          
          <div className="space-y-2">
            <Label>Task Name *</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="E.g., Read Chapter 5" autoFocus />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input required type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheduled Time (Optional)</Label>
              <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duration (Minutes) (Optional)</Label>
              <Input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g., 30" />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => { setStep(1); onClose(); }}>Cancel</Button>
            <Button type="submit">Save Task</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function AddStudySessionModal({ isOpen, onClose, defaultDate }: { isOpen: boolean, onClose: () => void, defaultDate?: string }) {
  const { data, addStudySession } = useData();
  
  const [date, setDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [subjectId, setSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationManual, setDurationManual] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');

  // Auto-select first subject if none selected
  React.useEffect(() => {
    if (data.subjects.length > 0 && !subjectId) {
      setSubjectId(data.subjects[0].id);
    }
  }, [data.subjects, subjectId]);

  const calculateDuration = (): number => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let duration = (endH * 60 + endM) - (startH * 60 + startM);
      if (duration < 0) duration += 24 * 60; // handle cross midnight
      return duration;
    }
    return Number(durationManual) || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      alert("Please create a subject first.");
      return;
    }
    const duration = calculateDuration();
    if (duration <= 0) {
      alert("Please provide valid start/end times or a positive duration.");
      return;
    }
    
    addStudySession({
      id: generateId(),
      date,
      subjectId,
      topic,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      durationMinutes: duration,
      priority,
      notes
    });
    
    // Reset
    setTopic('');
    setStartTime('');
    setEndTime('');
    setDurationManual('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Study Session">
      {data.subjects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">You need to add at least one subject first.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input required type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select required value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                {data.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Topic / Chapter *</Label>
            <Input required value={topic} onChange={e => setTopic(e.target.value)} placeholder="E.g., Differential Equations" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>OR Duration (Minutes)</Label>
            <Input 
              type="number" 
              min="1" 
              value={durationManual} 
              onChange={e => {
                setDurationManual(e.target.value);
                setStartTime('');
                setEndTime('');
              }} 
              placeholder="e.g., 120"
              disabled={!!(startTime && endTime)}
            />
            {(startTime && endTime) && (
              <p className="text-xs text-slate-500">Duration is calculated from times ({calculateDuration()} mins)</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any reflections..." />
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Session</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function AddSubjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addSubject } = useData();
  
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [targetHours, setTargetHours] = useState('5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    addSubject({
      id: generateId(),
      name,
      priority,
      weeklyTargetHours: Number(targetHours) || 0
    });
    
    setName('');
    setTargetHours('5');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Subject">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Subject Name *</Label>
          <Input required value={name} onChange={e => setName(e.target.value)} placeholder="E.g., Mathematics" autoFocus />
        </div>
        
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Weekly Target (Hours) *</Label>
          <Input required type="number" min="1" max="168" value={targetHours} onChange={e => setTargetHours(e.target.value)} />
        </div>
        
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Subject</Button>
        </div>
      </form>
    </Modal>
  );
}
