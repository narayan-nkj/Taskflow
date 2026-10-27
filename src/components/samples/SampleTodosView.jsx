import React from 'react';
import { RefreshCw, AlertCircle, CopyPlus, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export const SampleTodosView = ({
  samples,
  isLoading,
  error,
  onRefresh,
  onAddCopy,
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-4 lg:h-full lg:overflow-hidden">
      {/* Information Header Banner (Stationary) */}
      <div className="shrink-0 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-peach-100 text-brand-700 dark:bg-[#24140E] dark:text-brand-300 border border-brand-200/60 dark:border-brand-900/40 uppercase tracking-wider">
                External API
              </span>
              <h2 className="text-base font-bold text-charcoal-900 dark:text-[#F5F5F5]">
                DummyJSON Sample Todos
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B0B0B0] leading-relaxed max-w-2xl">
              These reference records are fetched live from{' '}
              <code className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-white dark:bg-[#181818] border border-slate-200 dark:border-[#292929] px-1 py-0.5 rounded">
                https://dummyjson.com/todos
              </code>
              . They remain completely isolated from your local tasks. Clicking{' '}
              <strong className="text-charcoal-900 dark:text-[#F5F5F5]">"Add copy to My Tasks"</strong> creates a distinct, user-owned task with a new ID
              in your Personal category.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#F5F5F5] bg-white dark:bg-[#181818] hover:bg-slate-50 dark:hover:bg-[#202020] border border-slate-200 dark:border-[#292929] rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500 self-start sm:self-center shrink-0"
            aria-label="Refresh sample todos from API"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-brand-500' : ''}`}
              aria-hidden="true"
            />
            Refresh Samples
          </button>
        </div>
      </div>

      {/* Loading State Skeletons */}
      {isLoading && (
        <div className="space-y-3 shrink-0" aria-busy="true" aria-label="Loading sample tasks">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#292929] animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2 flex-1 mr-4">
                <div className="h-4 bg-slate-200 dark:bg-[#181818] rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-[#181818]/60 rounded w-1/4" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-[#181818] rounded-xl w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {!isLoading && error && (
        <div className="shrink-0 p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Failed to load sample tasks
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-md mx-auto">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && samples.length === 0 && (
        <div className="shrink-0 p-8 text-center rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#292929]">
          <p className="text-sm text-slate-500 dark:text-[#808080]">
            No sample todos were returned from the endpoint.
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Try reloading
          </button>
        </div>
      )}

      {/* Successful Data List (Stationary header + Independently scrollable items container) */}
      {!isLoading && !error && samples.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col space-y-2 lg:overflow-hidden">
          {/* Status Row (Stationary) */}
          <div className="shrink-0 flex items-center justify-between text-xs text-slate-500 dark:text-[#808080] px-1 pb-1">
            <span>
              Showing {samples.length} remote samples from DummyJSON
            </span>
            <span className="text-[11px] font-medium">
              Read-only API records
            </span>
          </div>

          {/* Independently Scrollable Container for Remote Records */}
          <div
            className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar focus:outline-none"
            tabIndex={0}
            role="region"
            aria-label="Sample API todos list"
          >
            {samples.map((sample) => (
              <div
                key={sample.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] hover:border-brand-300 dark:hover:border-[#383838] shadow-sm transition-all gap-3"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  {/* Task Type Tile */}
                  <div
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#181818] border border-transparent dark:border-[#292929] flex items-center justify-center shrink-0 mt-0.5 text-slate-500 dark:text-[#B0B0B0]"
                    aria-hidden="true"
                  >
                    <ListTodo className="w-5 h-5 text-brand-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-charcoal-900 dark:text-[#F5F5F5] leading-snug break-words">
                      {sample.todo}
                    </p>

                    <div className="flex items-center space-x-2 mt-1.5 text-xs">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#181818] text-slate-500 dark:text-[#808080] shrink-0 border border-slate-200/60 dark:border-[#292929]">
                        #{sample.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          sample.completed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-slate-100 text-slate-600 dark:bg-[#181818] dark:text-[#B0B0B0] border-slate-200 dark:border-[#292929]'
                        }`}
                        aria-label={`Status: ${sample.completed ? 'Completed' : 'Pending'}`}
                      >
                        {sample.completed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                            Pending
                          </>
                        )}
                      </span>
                      <span className="text-slate-400 dark:text-[#808080] text-[11px]">
                        User ID: {sample.userId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add Copy to My Tasks Action */}
                <button
                  type="button"
                  onClick={() => onAddCopy(sample)}
                  className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-peach-100 hover:bg-peach-200 dark:bg-[#24140E] dark:hover:bg-[#341810] border border-brand-200 dark:border-brand-900/50 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 self-start sm:self-center"
                  aria-label={`Add copy of "${sample.todo}" to My Tasks`}
                >
                  <CopyPlus className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Add copy to My Tasks
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
