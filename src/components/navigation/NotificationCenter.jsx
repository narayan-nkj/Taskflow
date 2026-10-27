import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, AlertCircle, Clock, CheckCircle2, CheckCheck, BellRing } from 'lucide-react';

export const NotificationCenter = ({
  alerts,
  unseenCount,
  onSelectTask,
  onDismissAlert,
  onClearAll,
  onMarkAllSeen,
  browserPermission,
  onRequestBrowserPermission,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      onMarkAllSeen();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleAlertClick = (taskId) => {
    onSelectTask(taskId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative p-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
          isOpen
            ? 'bg-slate-200 dark:bg-[#202020] text-charcoal-900 dark:text-[#F5F5F5]'
            : 'text-slate-500 hover:text-charcoal-900 dark:text-[#B0B0B0] dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#181818]'
        }`}
        aria-label={
          alerts.length > 0
            ? `Deadline notifications: ${alerts.length} active alerts${unseenCount > 0 ? `, ${unseenCount} unread` : ''}`
            : 'Deadline notifications: No alerts'
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {/* Unseen indicator badge */}
        {unseenCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-brand-500 text-white flex items-center justify-center border-2 border-white dark:border-[#0B0B0B]"
            aria-hidden="true"
          >
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Upcoming Deadlines and Alerts"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#292929] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#202020]">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-charcoal-900 dark:text-[#F5F5F5]">
                Deadline Alerts
              </span>
              {alerts.length > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-[#24140E] text-brand-600 dark:text-brand-300">
                  {alerts.length}
                </span>
              )}
            </div>

            {alerts.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] font-medium text-slate-500 dark:text-[#808080] hover:text-charcoal-900 dark:hover:text-[#F5F5F5] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List of Alerts */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1e1e1e] custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5 stroke-[2]" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold text-charcoal-900 dark:text-[#F5F5F5]">
                  No upcoming deadline alerts
                </p>
                <p className="text-[11px] text-slate-400 dark:text-[#808080] mt-0.5">
                  You are all caught up with your assignments and commitments!
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isOverdue = alert.urgency === 'overdue';
                const isToday = alert.urgency === 'due-today';

                return (
                  <div
                    key={alert.id}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-[#181818] transition-colors flex items-start justify-between gap-2.5 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleAlertClick(alert.taskId)}
                      className="flex-1 text-left flex items-start space-x-2.5 min-w-0"
                    >
                      <div className="shrink-0 mt-0.5">
                        {isOverdue ? (
                          <AlertCircle
                            className="w-4 h-4 text-rose-500 dark:text-rose-400"
                            aria-hidden="true"
                          />
                        ) : isToday ? (
                          <Clock
                            className="w-4 h-4 text-amber-500 dark:text-amber-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <Clock
                            className="w-4 h-4 text-brand-500"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-charcoal-900 dark:text-[#F5F5F5] truncate leading-tight">
                          {alert.taskTitle}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              isOverdue
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                : isToday
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-brand-50 text-brand-700 dark:bg-[#24140E] dark:text-brand-300'
                            }`}
                          >
                            {alert.urgencyLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-[#808080]">
                            {alert.category}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismissAlert(alert.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F5F5] hover:bg-slate-200 dark:hover:bg-[#222222] transition-colors"
                      title="Dismiss notification"
                      aria-label={`Dismiss alert for ${alert.taskTitle}`}
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Optional Browser Notification Opt-In */}
          {browserPermission !== 'unsupported' && (
            <div className="p-2.5 bg-slate-50 dark:bg-[#141414] border-t border-slate-100 dark:border-[#202020] text-center">
              {browserPermission === 'granted' ? (
                <div className="flex flex-col items-center justify-center space-y-0.5 text-center">
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Desktop reminders enabled</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                    Active while TaskFlow is open in your browser
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onRequestBrowserPermission}
                  className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Enable desktop reminder alerts</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
