import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    // If no action, auto-dismiss in 4 seconds; if action exists, auto-dismiss in 6 seconds
    const duration = toast.action ? 6000 : 4000;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />,
    info: <Info className="w-5 h-5 text-brand-500 shrink-0" aria-hidden="true" />,
  };

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-center justify-between p-3.5 bg-white dark:bg-[#111111] rounded-xl shadow-lg border border-slate-200 dark:border-[#292929] text-charcoal-900 dark:text-[#F5F5F5] text-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
        {icons[toast.type]}
        <span className="truncate">{toast.message}</span>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline focus-visible:ring-1 focus-visible:ring-brand-500 rounded"
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
