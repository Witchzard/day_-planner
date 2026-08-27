import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Calendar, LayoutDashboard, Settings, CheckSquare, BookOpen, BarChart3, BookMarked, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui';

const NAV_ITEMS = [
  { path: '/', label: 'Today', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/study', label: 'Study', icon: BookOpen },
  { path: '/weekly-report', label: 'Weekly Report', icon: BarChart3 },
  { path: '/subjects', label: 'Subjects', icon: BookMarked },
];

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Student Planner</h1>
        </div>
        
        <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50 font-medium'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <NavLink
            to="/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
              location.pathname === '/settings'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50 font-medium'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pb-safe">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 p-3 transition-colors',
                isActive
                  ? 'text-slate-900 dark:text-slate-50'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive ? 'fill-slate-100 dark:fill-slate-800' : '')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        {/* We can tuck subjects and settings into a "More" menu on mobile if we wanted, or just list settings */}
        <NavLink
          to="/settings"
          className={cn(
            'flex flex-col items-center gap-1 p-3 transition-colors',
            location.pathname === '/settings'
              ? 'text-slate-900 dark:text-slate-50'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
          )}
        >
          <Settings className={cn('h-6 w-6', location.pathname === '/settings' ? 'fill-slate-100 dark:fill-slate-800' : '')} />
          <span className="text-[10px] font-medium">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};
