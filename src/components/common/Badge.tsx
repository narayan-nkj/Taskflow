import React from 'react';
import { TaskPriority, TaskCategory, TaskStatus } from '../../types/task';
import { DeadlineState } from '../../utils/dates';
import { AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const styles: Record<TaskPriority, string> = {
    High: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    Low: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[priority]} ${className}`}
      aria-label={`Priority: ${priority}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          priority === 'High'
            ? 'bg-rose-500'
            : priority === 'Medium'
            ? 'bg-amber-500'
            : 'bg-slate-400'
        }`}
        aria-hidden="true"
      />
      {priority}
    </span>
  );
};

interface CategoryBadgeProps {
  category: TaskCategory;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const styles: Record<TaskCategory, string> = {
    GDG: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50',
    Academics: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
    Personal: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[category]} ${className}`}
      aria-label={`Category: ${category}`}
    >
      {category}
    </span>
  );
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles: Record<TaskStatus, { badge: string; icon: React.ReactNode }> = {
    Completed: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />,
    },
    'In Progress': {
      badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50',
      icon: <Clock className="w-3 h-3 mr-1" aria-hidden="true" />,
    },
    Pending: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" aria-hidden="true" />,
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status].badge} ${className}`}
      aria-label={`Status: ${status}`}
    >
      {styles[status].icon}
      {status}
    </span>
  );
};

interface DeadlineBadgeProps {
  state: DeadlineState;
  label: string;
  formattedDate: string;
  className?: string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  state,
  label,
  formattedDate,
  className = '',
}) => {
  if (state === 'none') {
    return (
      <span className={`inline-flex items-center text-xs text-slate-400 dark:text-slate-500 ${className}`}>
        <Calendar className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
        No deadline
      </span>
    );
  }

  const styles: Record<DeadlineState, { badge: string; icon: React.ReactNode }> = {
    overdue: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 font-semibold',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" aria-hidden="true" />,
    },
    'due-today': {
      badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 font-semibold',
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" aria-hidden="true" />,
    },
    upcoming: {
      badge: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
      icon: <Calendar className="w-3.5 h-3.5 mr-1 text-brand-500" aria-hidden="true" />,
    },
    normal: {
      badge: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
      icon: <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" aria-hidden="true" />,
    },
    none: {
      badge: '',
      icon: null,
    },
  };

  const current = styles[state];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${current.badge} ${className}`}
      title={label}
    >
      {current.icon}
      <span>{formattedDate}</span>
      {(state === 'overdue' || state === 'due-today') && (
        <span className="ml-1 opacity-90 text-[10px] uppercase tracking-wider">
          ({label})
        </span>
      )}
    </span>
  );
};
