import React from 'react';
import { Search, X } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { DeadlineAlert } from '../../types/notification';
import { USER_CONFIG } from '../../config/user';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Notification center props
  alerts?: DeadlineAlert[];
  unseenCount?: number;
  onSelectTask?: (taskId: string) => void;
  onDismissAlert?: (id: string) => void;
  onClearAllAlerts?: () => void;
  onMarkAllSeen?: () => void;
  browserPermission?: NotificationPermission | 'unsupported';
  onRequestBrowserPermission?: () => Promise<boolean>;
  // Fallback props
  urgentTasksCount?: number;
  onUrgentClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  alerts = [],
  unseenCount = 0,
  onSelectTask,
  onDismissAlert,
  onClearAllAlerts,
  onMarkAllSeen,
  browserPermission = 'unsupported',
  onRequestBrowserPermission,
}) => {
  return (
    <header className="flex items-center justify-between pb-3 sm:pb-4 pt-1 border-b border-slate-100 dark:border-[#292929] gap-4">
      {/* Left: Rounded search bar */}
      <div className="relative w-56 sm:w-72 md:w-80 lg:w-96 max-w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-500">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-9 py-2 bg-white dark:bg-[#151515] border border-slate-300/90 dark:border-[#303030] hover:border-slate-400 dark:hover:border-[#414141] rounded-full text-xs sm:text-sm text-charcoal-900 dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#969696] shadow-sm shadow-slate-200/50 dark:shadow-none focus:bg-white dark:focus:bg-[#151515] focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all"
          aria-label="Search tasks by title"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F5F5] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-r-full"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Right: Notifications, Avatar, Greeting */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Real Deadline Notification Center */}
        <NotificationCenter
          alerts={alerts}
          unseenCount={unseenCount}
          onSelectTask={onSelectTask || (() => {})}
          onDismissAlert={onDismissAlert || (() => {})}
          onClearAll={onClearAllAlerts || (() => {})}
          onMarkAllSeen={onMarkAllSeen || (() => {})}
          browserPermission={browserPermission}
          onRequestBrowserPermission={onRequestBrowserPermission || (async () => false)}
        />

        {/* User Profile Pill - Personalized for Narayan */}
        <div className="flex items-center space-x-2.5 pl-1 sm:pl-2">
          <div
            className="w-8 h-8 rounded-full bg-peach-100 dark:bg-[#24140E] border border-brand-200 dark:border-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs select-none shadow-sm"
            aria-label={`User profile for ${USER_CONFIG.displayName}`}
          >
            {USER_CONFIG.initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-charcoal-900 dark:text-[#F5F5F5] leading-tight">
              Welcome back, {USER_CONFIG.displayName}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-[#808080] font-medium leading-tight">
              {USER_CONFIG.roleSubtitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

