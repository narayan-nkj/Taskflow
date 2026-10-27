import React, { useState } from 'react';
import {
  Menu,
  X,
  Plus,
  LayoutDashboard,
  Database,
  Download,
  Upload,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';

interface MobileHeaderProps {
  currentTab: 'tasks' | 'samples';
  onSelectTab: (tab: 'tasks' | 'samples') => void;
  onAddTask: () => void;
  onExport: () => void;
  onImport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  userTasksCount: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentTab,
  onSelectTab,
  onAddTask,
  onExport,
  onImport,
  isDark,
  onToggleTheme,
  userTasksCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tab: 'tasks' | 'samples') => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base leading-none">
              TaskFlow
            </span>
            <span className="ml-1.5 text-[10px] font-semibold uppercase px-1 py-0.2 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              GDG
            </span>
          </div>
        </div>

        {/* Quick Add + Menu Toggle */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Add new task"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Drawer */}
      {isOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-slate-900 shadow-xl">
          <nav className="space-y-1" aria-label="Mobile Navigation">
            <button
              type="button"
              onClick={() => handleTabClick('tasks')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'tasks'
                  ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                <span>My Tasks</span>
              </div>
              {userTasksCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {userTasksCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('samples')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'samples'
                  ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4" aria-hidden="true" />
                <span>Sample Tasks (DummyJSON)</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 uppercase">
                API
              </span>
            </button>
          </nav>

          {/* Actions: Export, Import, Theme */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onExport();
                setIsOpen(false);
              }}
              className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onImport();
                setIsOpen(false);
              }}
              className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Import JSON</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <div className="flex items-center space-x-2">
                {isDark ? (
                  <Moon className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />
                )}
                <span>Current Theme: {isDark ? 'Dark' : 'Light'}</span>
              </div>
              <span className="text-brand-600 dark:text-brand-400 font-semibold">Switch</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
