import React from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface AdviceCardProps {
  advice: string | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({
  advice,
  isLoading,
  error,
  onRefresh,
}) => {
  return (
    <div
      className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-indigo-500/10 border border-brand-200/60 dark:border-brand-900/40"
      aria-busy={isLoading}
    >
      {/* Polite live region for screen-reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading
          ? 'Loading daily advice...'
          : error
          ? `Advice error: ${error}`
          : advice
          ? `Daily advice: "${advice}"`
          : ''}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Daily Advice
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                • Inspiration for today
              </span>
            </div>

            {isLoading ? (
              <div
                className="mt-2 space-y-2 animate-pulse"
                aria-hidden="true"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
              </div>
            ) : error ? (
              <div className="mt-2 flex items-center space-x-2 text-sm text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : advice ? (
              <blockquote className="mt-1.5 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "{advice}"
              </blockquote>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent hover:border-brand-200 dark:hover:border-brand-900/50 transition-all focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          title="Refresh daily advice"
          aria-label="Refresh daily advice"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-500' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
};
