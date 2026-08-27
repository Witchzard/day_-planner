import React from 'react';
import { useData } from '../store/DataContext';
import { Card, Button, Label, Input, Select } from '../components/ui';

export default function Settings() {
  const { data, updateSettings, resetData } = useData();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      resetData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your application preferences.</p>
      </header>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={data.settings.theme} 
                onChange={e => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                className="max-w-xs"
              >
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Weekly Study Goal (Hours)</Label>
              <Input 
                type="number" 
                min="1" 
                max="168"
                value={data.settings.weeklyStudyGoalHours} 
                onChange={e => updateSettings({ weeklyStudyGoalHours: Number(e.target.value) || 0 })}
                className="max-w-xs"
              />
              <p className="text-sm text-slate-500">Your total target for study hours across all subjects per week.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Danger Zone</h2>
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Permanently delete all your tasks, study sessions, and subjects.</p>
            <Button variant="destructive" onClick={handleReset}>Clear All Data</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
