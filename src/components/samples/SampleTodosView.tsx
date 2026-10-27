import React from 'react';
import { SampleTodo } from '../../types/api';
import { RefreshCw, AlertCircle, CopyPlus, CheckCircle2, Clock } from 'lucide-react';

interface SampleTodosViewProps {
  samples: SampleTodo[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onAddCopy: (sample: SampleTodo) => void;
}

export const SampleTodosView: React.FC<SampleTodosViewProps> = ({
  samples,
  isLoading,
  error,
  onRefresh,
  onAddCopy,
}) => {
  return (
    <div className="space-y-5">
      {/* Information Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-slate-500/10 border border-blue-200/60 dark:border-blue-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 uppercase tracking-wider">
                External API
              </span>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                DummyJSON Sample Todos
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              These reference records are fetched live from{' '}
              <code className="text-xs font-mono text-brand-600 dark:text-brand-400 bg-white/70 dark:bg-slate-800 px-1 py-0.5 rounded">
                https://dummyjson.com/todos
              </code>
              . They remain completely isolated from your local tasks. Clicking{' '}
              <strong>"Add copy to My Tasks"</strong> creates a distinct, user-owned task with a new ID
              in your Personal category.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500 self-start sm:self-center shrink-0"
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
        <div className="space-y-3" aria-busy="true" aria-label="Loading sample tasks">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2 flex-1 mr-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {!isLoading && error && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-3">
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
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
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

      {/* Successful Data List */}
      {!isLoading && !error && samples.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing {samples.length} remote samples from DummyJSON
            </span>
            <span className="text-[11px]">
              Read-only API records
            </span>
          </div>

          {samples.map((sample) => (
            <div
              key={sample.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900/60 shadow-sm transition-all gap-3"
            >
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 mt-0.5">
                  #{sample.id}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug break-words">
                    {sample.todo}
                  </p>

                  <div className="flex items-center space-x-2 mt-1.5 text-xs">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        sample.completed
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      User ID: {sample.userId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Copy to My Tasks Action */}
              <button
                type="button"
                onClick={() => onAddCopy(sample)}
                className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-900/50 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
                aria-label={`Add copy of "${sample.todo}" to My Tasks`}
              >
                <CopyPlus className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                Add copy to My Tasks
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
