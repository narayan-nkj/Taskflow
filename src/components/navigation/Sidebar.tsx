import React from 'react';
import {
  LayoutDashboard,
  Database,
  Plus,
  Download,
  Upload,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'tasks' | 'samples';
  onSelectTab: (tab: 'tasks' | 'samples') => void;
  onAddTask: () => void;
  onExport: () => void;
  onImport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  userTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onAddTask,
  onExport,
  onImport,
  isDark,
  onToggleTheme,
  userTasksCount,
}) => {
  return (
    <aside
      className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 shrink-0 min-h-screen sticky top-0"
      aria-label="Application Navigation Rail"
    >
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            TaskFlow
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
              GDG
            </span>
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500">Student Dashboard</p>
        </div>
      </div>

      {/* Primary Action: Add Task Button */}
      <button
        type="button"
        onClick={onAddTask}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm shadow-sm shadow-brand-600/30 transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 mb-6"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
        <span>Add Task</span>
      </button>

      {/* Navigation Sections */}
      <nav className="space-y-1.5 flex-1" aria-label="Main Navigation">
        <button
          type="button"
          onClick={() => onSelectTab('tasks')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentTab === 'tasks'
              ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          aria-current={currentTab === 'tasks' ? 'page' : undefined}
        >
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            <span>My Tasks</span>
          </div>
          {userTasksCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              {userTasksCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('samples')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentTab === 'samples'
              ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          aria-current={currentTab === 'samples' ? 'page' : undefined}
        >
          <div className="flex items-center space-x-3">
            <Database className="w-4 h-4" aria-hidden="true" />
            <span>Sample Tasks</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 uppercase">
            API
          </span>
        </button>
      </nav>

      {/* Backup and Data Actions */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block mb-1">
          Backup & Data
        </span>
        <button
          type="button"
          onClick={onExport}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Export user tasks to JSON file"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export JSON</span>
        </button>

        <button
          type="button"
          onClick={onImport}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Import tasks from JSON file"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          <span>Import JSON</span>
        </button>
      </div>

      {/* Theme Toggle in Footer */}
      <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <div className="flex items-center space-x-2.5">
            {isDark ? (
              <Moon className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />
            )}
            <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            Toggle
          </span>
        </button>
      </div>
    </aside>
  );
};
