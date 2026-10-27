import React, { useMemo } from 'react';
import { TaskStatistics } from '../../utils/statistics';
import { MetricSnapshot } from '../../utils/metricHistory';
import { UserTask } from '../../types/task';
import { Sparkline } from '../common/Sparkline';
import { CircularProgress } from '../common/CircularProgress';
import { PriorityDistributionBar } from '../common/PriorityDistributionBar';
import { formatLocalYmd } from '../../utils/dates';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  stats: TaskStatistics;
  history?: MetricSnapshot[];
  tasks?: readonly UserTask[];
}

export const StatCards: React.FC<StatCardsProps> = ({
  stats,
  history = [],
  tasks = [],
}) => {
  // 1. Total Tasks volume history (computed from real tasks or persisted snapshots)
  const totalVolumeHistory = useMemo(() => {
    if (history.length >= 2) {
      return history.map((h) => h.total);
    }
    if (!tasks || tasks.length === 0) {
      return [stats.total];
    }
    // Calculate cumulative task count over the past 7 days based on real task creation dates
    const today = new Date();
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ymd = formatLocalYmd(d);
      const count = tasks.filter((t) => {
        if (!t.createdAt) return true;
        const createdYmd = t.createdAt.split('T')[0];
        return createdYmd <= ymd;
      }).length;
      days.push(count);
    }
    return days;
  }, [history, tasks, stats.total]);

  // 2. Pending tasks workload distribution by priority
  const { pendingHigh, pendingMedium, pendingLow } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { pendingHigh: 0, pendingMedium: stats.pending, pendingLow: 0 };
    }
    const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
    return {
      pendingHigh: pendingTasks.filter((t) => t.priority === 'High').length,
      pendingMedium: pendingTasks.filter((t) => t.priority === 'Medium').length,
      pendingLow: pendingTasks.filter((t) => t.priority === 'Low').length,
    };
  }, [tasks, stats.pending]);

  return (
    <section aria-labelledby="stats-heading" className="w-full space-y-2.5">
      <h2 id="stats-heading" className="sr-only">
        Task Overview Statistics
      </h2>

      {/* Row of three compact cards with real micro-visualizations */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Tasks with Volume Trend Sparkline */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1 rounded-lg bg-peach-100 dark:bg-[#24140E]">
              <ListTodo className="w-4 h-4 text-brand-500" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-[#808080]">
              All tasks
            </span>
          </div>
          <div className="flex items-end justify-between gap-1.5">
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 dark:text-[#F5F5F5] leading-tight">
                {stats.total}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#808080] font-medium mt-0.5 truncate">
                Total Tasks
              </p>
            </div>
            <div className="shrink-0 pb-0.5" title="Task volume over recent days">
              <Sparkline
                data={totalVolumeHistory}
                color="#eb642e"
                width={56}
                height={24}
                ariaLabel={`Total task volume: ${totalVolumeHistory.join(', ')}`}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Completed with Circular Progress Indicator */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.completionRateFormatted}
            </span>
          </div>
          <div className="flex items-end justify-between gap-1.5">
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 dark:text-[#F5F5F5] leading-tight">
                {stats.completed}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#808080] font-medium mt-0.5 truncate">
                Completed
              </p>
            </div>
            <div className="shrink-0 pb-0.5">
              <CircularProgress
                percentage={stats.completionRate}
                size={34}
                strokeWidth={3.5}
                color="#10b981"
                label={`${stats.completed} of ${stats.total} tasks completed`}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Pending with Workload Priority Breakdown */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/40">
              <Clock className="w-4 h-4 text-amber-500" aria-hidden="true" />
            </div>
            {stats.inProgress > 0 ? (
              <span className="text-[10px] font-semibold text-brand-500 dark:text-brand-400 px-1.5 py-0.5 rounded-full bg-peach-100/60 dark:bg-[#24140E]">
                {stats.inProgress} in progress
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-[#808080]">
                Workload
              </span>
            )}
          </div>
          <div className="flex items-end justify-between gap-1.5">
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 dark:text-[#F5F5F5] leading-tight">
                {stats.pending}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#808080] font-medium mt-0.5 truncate">
                Pending
              </p>
            </div>
            <div className="shrink-0 pb-0.5">
              <PriorityDistributionBar
                high={pendingHigh}
                medium={pendingMedium}
                low={pendingLow}
                totalPending={stats.pending}
              />
            </div>
          </div>
        </div>
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
