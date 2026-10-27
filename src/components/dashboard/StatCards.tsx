import React from 'react';
import { TaskStatistics } from '../../utils/statistics';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  stats: TaskStatistics;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      description: stats.total === 1 ? '1 student task' : `${stats.total} student tasks`,
      icon: <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />,
      bg: 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30',
      iconBg: 'bg-indigo-100/80 dark:bg-indigo-900/40',
    },
    {
      title: 'Completed',
      value: stats.completed,
      description: 'Finished commitments',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
      iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    },
    {
      title: 'Pending',
      value: stats.pending,
      description: stats.inProgress > 0 ? `+ ${stats.inProgress} in progress` : 'Awaiting start',
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
      bg: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
      iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
    },
    {
      title: 'Completion Rate',
      value: stats.completionRateFormatted,
      description: stats.total > 0 ? `${stats.completed} of ${stats.total} done` : 'No tasks yet',
      icon: <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />,
      bg: 'bg-brand-50/60 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900/30',
      iconBg: 'bg-brand-100/80 dark:bg-brand-900/40',
    },
  ];

  return (
    <section aria-labelledby="stats-heading" className="w-full">
      <h2 id="stats-heading" className="sr-only">
        Task Overview Statistics
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${card.bg} shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
