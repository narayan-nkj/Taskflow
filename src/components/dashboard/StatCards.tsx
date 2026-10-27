import React from 'react';
import { TaskStatistics } from '../../utils/statistics';
import { MetricSnapshot } from '../../utils/metricHistory';
import { Sparkline } from '../common/Sparkline';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  stats: TaskStatistics;
  history?: MetricSnapshot[];
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, history = [] }) => {
  const totalHistory = history.length > 0 ? history.map((h) => h.total) : [stats.total];
  const completedHistory = history.length > 0 ? history.map((h) => h.completed) : [stats.completed];
  const pendingHistory = history.length > 0 ? history.map((h) => h.pending) : [stats.pending];

  const primaryCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: <ListTodo className="w-4 h-4 text-brand-500" aria-hidden="true" />,
      historyData: totalHistory,
      chartColor: '#eb642e',
      trendLabel: 'Total tasks record history',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />,
      historyData: completedHistory,
      chartColor: '#10b981',
      trendLabel: 'Completed tasks trend',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock className="w-4 h-4 text-amber-500" aria-hidden="true" />,
      sublabel: stats.inProgress > 0 ? `${stats.inProgress} in progress` : undefined,
      historyData: pendingHistory,
      chartColor: '#f59e0b',
      trendLabel: 'Pending tasks trend',
    },
  ];

  return (
    <section aria-labelledby="stats-heading" className="w-full space-y-2.5">
      <h2 id="stats-heading" className="sr-only">
        Task Overview Statistics
      </h2>

      {/* Row of three compact white cards with mini-graphs */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {primaryCards.map((card) => (
          <div
            key={card.title}
            className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] shadow-sm transition-all hover:shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1 rounded-lg bg-peach-100 dark:bg-[#24140E]">
                {card.icon}
              </div>
              {card.sublabel && (
                <span className="text-[10px] font-semibold text-brand-500 dark:text-brand-400 px-1.5 py-0.5 rounded-full bg-peach-100/60 dark:bg-[#24140E]">
                  {card.sublabel}
                </span>
              )}
            </div>
            <div className="flex items-end justify-between gap-1.5">
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 dark:text-[#F5F5F5] leading-tight">
                  {card.value}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#808080] font-medium mt-0.5 truncate">
                  {card.title}
                </p>
              </div>
              <div className="shrink-0 pb-0.5" title={card.trendLabel}>
                <Sparkline
                  data={card.historyData}
                  color={card.chartColor}
                  ariaLabel={`${card.title} trend: ${card.historyData.join(', ')}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4th Companion Card: Completion Rate with real progress bar */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="p-1 rounded-md bg-peach-100 dark:bg-[#24140E]">
            <TrendingUp className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold text-charcoal-900 dark:text-[#F5F5F5]">
            Completion Rate
          </span>
          <span className="text-xs font-bold text-brand-500">
            {stats.completionRateFormatted}
          </span>
        </div>

        {/* Real Progress Bar */}
        <div className="flex items-center space-x-3 flex-1 sm:max-w-md">
          <div
            className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-[#181818] overflow-hidden"
            role="progressbar"
            aria-valuenow={stats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Task completion rate progress"
          >
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, stats.completionRate))}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#808080] shrink-0 font-medium">
            {stats.completed}/{stats.total} done
          </span>
        </div>
      </div>
    </section>
  );
};
