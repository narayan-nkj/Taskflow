import React from 'react';
import { AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const PriorityBadge = ({ priority, className = '' }) => {
  const styles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    Low: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#181818] dark:text-[#B0B0B0] dark:border-[#292929]',
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

export const CategoryBadge = ({ category, className = '' }) => {
  const styles = {
    GDG: 'bg-peach-100 text-brand-600 border-brand-500/30 dark:bg-[#24140E] dark:text-brand-300 dark:border-brand-900/40 font-semibold',
    Academics: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40',
    Personal: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[category] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#181818] dark:text-[#B0B0B0] dark:border-[#292929]'} ${className}`}
      aria-label={`Category: ${category}`}
    >
      {category}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const styles = {
    Completed: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />,
    },
    'In Progress': {
      badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50',
      icon: <Clock className="w-3 h-3 mr-1" aria-hidden="true" />,
    },
    Pending: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#181818] dark:text-[#B0B0B0] dark:border-[#292929]',
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

export const DeadlineBadge = ({
  state,
  label,
  formattedDate,
  className = '',
}) => {
  if (state === 'none') {
    return (
      <span className={`inline-flex items-center text-xs text-slate-400 dark:text-[#808080] ${className}`}>
        <Calendar className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
        No deadline
      </span>
    );
  }

  const styles = {
    overdue: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 font-semibold',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" aria-hidden="true" />,
    },
    'due-today': {
      badge: 'bg-peach-100 text-brand-700 border-brand-500/30 dark:bg-[#24140E] dark:text-brand-300 dark:border-brand-900/40 font-semibold',
      icon: <Clock className="w-3.5 h-3.5 mr-1 text-brand-500" aria-hidden="true" />,
    },
    upcoming: {
      badge: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#181818] dark:text-[#B0B0B0] dark:border-[#292929]',
      icon: <Calendar className="w-3.5 h-3.5 mr-1 text-brand-500" aria-hidden="true" />,
    },
    normal: {
      badge: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#181818] dark:text-[#B0B0B0] dark:border-[#292929]',
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
