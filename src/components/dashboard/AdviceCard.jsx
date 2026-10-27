import React from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export const AdviceCard = ({
  advice,
  isLoading,
  error,
  onRefresh,
}) => {
  return (
    <div
      className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-peach-50/70 dark:bg-[#181818] border border-peach-200/80 dark:border-[#292929] shadow-sm"
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

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-brand-500/10 dark:bg-[#24140E] text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 stroke-[2]" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Daily Advice
              </span>
              <span className="text-[11px] text-slate-400 dark:text-[#808080]">
                • Motivation
              </span>
            </div>

            {isLoading ? (
              <div
                className="mt-2 space-y-1.5 animate-pulse"
                aria-hidden="true"
              >
                <div className="h-3.5 bg-slate-200 dark:bg-[#292929] rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-[#292929] rounded w-1/2" />
              </div>
            ) : error ? (
              <div className="mt-1.5 flex items-center space-x-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : advice ? (
              <blockquote className="mt-1 text-xs sm:text-sm font-medium text-charcoal-900 dark:text-[#F5F5F5] italic leading-relaxed">
                "{advice}"
              </blockquote>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-xl text-slate-500 hover:text-brand-600 dark:text-[#B0B0B0] dark:hover:text-[#F5F5F5] hover:bg-white/60 dark:hover:bg-[#202020] border border-transparent hover:border-brand-200 dark:hover:border-[#383838] transition-all focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          title="Refresh daily advice"
          aria-label="Refresh daily advice"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-500' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
};
