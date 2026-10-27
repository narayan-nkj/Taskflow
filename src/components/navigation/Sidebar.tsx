import React from 'react';
import {
  LayoutDashboard,
  Library,
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
      className="hidden md:flex flex-col w-[82px] h-full bg-black text-white rounded-[32px] p-3 py-6 items-center shrink-0 shadow-xl border border-white/10 z-20"
      aria-label="Application Navigation Rail"
    >
      {/* Region 1: Branding or Application Logo at the top */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/35 transition-transform hover:scale-105"
          title="TaskFlow — Student Productivity Dashboard"
        >
          <CheckCircle2 className="w-6 h-6 stroke-[2.75]" aria-hidden="true" />
        </div>
      </div>

      {/* Region 2: Primary Navigation in the middle */}
      <nav
        className="mt-6 flex flex-col items-center space-y-3.5 flex-1 min-h-0 overflow-y-auto no-scrollbar py-1 px-1"
        aria-label="Main Navigation"
      >
        {/* 1. Dashboard / My Tasks */}
        <div className="group relative">
          <button
            type="button"
            onClick={() => onSelectTab('tasks')}
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-brand-500 ${
              currentTab === 'tasks'
                ? 'bg-[#181818] text-brand-500 border-2 border-brand-500 shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label={`My Tasks Dashboard, ${userTasksCount} ${userTasksCount === 1 ? 'task' : 'tasks'}`}
            aria-current={currentTab === 'tasks' ? 'page' : undefined}
          >
            <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
            {userTasksCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 text-[10px] font-bold rounded-full bg-brand-500 text-white flex items-center justify-center border-2 border-black shadow-sm"
                aria-hidden="true"
              >
                {userTasksCount > 99 ? '99+' : userTasksCount}
              </span>
            )}
          </button>
          <span
            role="tooltip"
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-charcoal-900 dark:bg-[#181818] text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap border border-white/10"
          >
            My Tasks ({userTasksCount})
          </span>
        </div>

        {/* 2. Sample Tasks (DummyJSON) */}
        <div className="group relative">
          <button
            type="button"
            onClick={() => onSelectTab('samples')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-brand-500 ${
              currentTab === 'samples'
                ? 'bg-[#181818] text-brand-500 border-2 border-brand-500 shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Sample Tasks (DummyJSON API)"
            aria-current={currentTab === 'samples' ? 'page' : undefined}
          >
            <Library className="w-5 h-5" aria-hidden="true" />
          </button>
          <span
            role="tooltip"
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-charcoal-900 dark:bg-[#181818] text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap border border-white/10"
          >
            Sample Tasks (API)
          </span>
        </div>

        {/* 3. Quick Action: Add Task */}
        <div className="group relative mt-2">
          <button
            type="button"
            onClick={onAddTask}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Add new task"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          </button>
          <span
            role="tooltip"
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-charcoal-900 dark:bg-[#181818] text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap border border-white/10"
          >
            Create New Task
          </span>
        </div>
      </nav>

      {/* Region 3: Secondary Utility Controls at the bottom */}
      <div className="mt-auto flex flex-col items-center space-y-3.5 pt-4 border-t border-white/10 w-full shrink-0">
        {/* Export JSON */}
        <div className="group relative">
          <button
            type="button"
            onClick={onExport}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Export user tasks as JSON"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>
          <span
            role="tooltip"
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-charcoal-900 dark:bg-[#181818] text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap border border-white/10"
          >
            Export Tasks (JSON)
          </span>
        </div>

        {/* Import JSON */}
        <div className="group relative">
          <button
            type="button"
            onClick={onImport}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Import tasks from JSON"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
          </button>
          <span
            role="tooltip"
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-charcoal-900 dark:bg-[#181818] text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap border border-white/10"
          >
            Import Tasks (JSON)
          </span>
        </div>

        {/* Theme Toggle (Utility icon) */}
        <div className="group relative">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-500 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" aria-hidden="true" />
            )}
          </button>
          <span
            role="tooltip"
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-charcoal-900 dark:bg-[#181818] text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap border border-white/10"
          >
            {isDark ? 'Light Theme' : 'Dark Theme'}
          </span>
        </div>
      </div>
    </aside>
  );
};
