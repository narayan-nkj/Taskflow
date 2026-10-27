import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { UserTask } from '../types/task';
import { DeadlineAlert, DeadlineUrgency } from '../types/notification';
import { getTaskDeadlineStatus, formatDisplayDate } from '../utils/dates';

const DISMISSED_STORAGE_KEY = 'taskflow_dismissed_alerts_v1';
const SEEN_STORAGE_KEY = 'taskflow_seen_alerts_v1';
const DELIVERED_STORAGE_KEY = 'taskflow_notified_alerts_v1';

export interface UseDeadlineAlertsOptions {
  onNotifyToast?: (toast: {
    type: 'info' | 'error';
    message: string;
    action?: { label: string; onClick: () => void };
  }) => void;
  onSelectTask?: (taskId: string) => void;
}

export function useDeadlineAlerts(
  tasks: UserTask[],
  options?: UseDeadlineAlertsOptions
) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Load dismissed alert IDs from localStorage
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Load seen alert IDs from localStorage
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SEEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Load previously delivered alert deduplication keys from localStorage
  const [deliveredIds, setDeliveredIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(DELIVERED_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((k) => typeof k === 'string') : [];
    } catch {
      return [];
    }
  });

  // Browser notification permission state
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(
    () => {
      if (
        typeof window !== 'undefined' &&
        typeof window.Notification !== 'undefined' &&
        window.Notification !== null
      ) {
        return window.Notification.permission;
      }
      return 'unsupported';
    }
  );

  // Derive active alerts from user tasks only
  const allAlerts = useMemo<DeadlineAlert[]>(() => {
    const list: DeadlineAlert[] = [];

    for (const task of tasks) {
      // Exclude completed tasks or tasks without due dates
      if (task.status === 'Completed' || !task.dueDate) {
        continue;
      }

      const deadline = getTaskDeadlineStatus(task.dueDate, false);
      let urgency: DeadlineUrgency | null = null;
      let urgencyLabel = '';

      if (deadline.state === 'overdue') {
        urgency = 'overdue';
        urgencyLabel = `Overdue since ${formatDisplayDate(task.dueDate)}`;
      } else if (deadline.state === 'due-today') {
        urgency = 'due-today';
        urgencyLabel = 'Due today';
      } else if (deadline.state === 'upcoming') {
        urgency = 'due-soon';
        urgencyLabel = `Due tomorrow (${formatDisplayDate(task.dueDate)})`;
      } else if (
        deadline.daysRemaining !== undefined &&
        deadline.daysRemaining <= 3 &&
        deadline.daysRemaining > 0
      ) {
        urgency = 'due-soon';
        urgencyLabel = `Due in ${deadline.daysRemaining} days (${formatDisplayDate(task.dueDate)})`;
      }

      if (urgency) {
        const alertId = `${task.id}:${task.dueDate}:${urgency}`;
        list.push({
          id: alertId,
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate,
          urgency,
          urgencyLabel,
          category: task.category,
          priority: task.priority,
          isDismissed: dismissedIds.includes(alertId),
        });
      }
    }

    // Sort: overdue first, then due today, then due soon
    const urgencyWeight: Record<DeadlineUrgency, number> = {
      overdue: 0,
      'due-today': 1,
      'due-soon': 2,
    };

    return list.sort((a, b) => urgencyWeight[a.urgency] - urgencyWeight[b.urgency]);
  }, [tasks, dismissedIds]);

  // Active (non-dismissed) alerts
  const activeAlerts = useMemo(() => {
    return allAlerts.filter((a) => !a.isDismissed);
  }, [allAlerts]);

  // Count of unseen active alerts
  const unseenCount = useMemo(() => {
    return activeAlerts.filter((a) => !seenIds.includes(a.id)).length;
  }, [activeAlerts, seenIds]);

  // Mark all active alerts as seen
  const markAllSeen = useCallback(() => {
    const activeIds = activeAlerts.map((a) => a.id);
    setSeenIds((prev) => {
      const merged = Array.from(new Set([...prev, ...activeIds]));
      try {
        localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // Ignore quota error
      }
      return merged;
    });
  }, [activeAlerts]);

  // Dismiss a specific alert
  const dismissAlert = useCallback((id: string) => {
    setDismissedIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Dismiss all active alerts
  const clearAllAlerts = useCallback(() => {
    const activeIds = activeAlerts.map((a) => a.id);
    setDismissedIds((prev) => {
      const merged = Array.from(new Set([...prev, ...activeIds]));
      try {
        localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // Ignore
      }
      return merged;
    });
  }, [activeAlerts]);

  // Explicit user action to request browser notification permission
  const requestBrowserPermission = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      typeof window.Notification === 'undefined' ||
      window.Notification === null
    ) {
      setBrowserPermission('unsupported');
      return false;
    }
    try {
      const result = await window.Notification.requestPermission();
      setBrowserPermission(result);

      // If just granted and there are active alerts, deliver an immediate desktop notification
      if (result === 'granted' && activeAlerts.length > 0) {
        try {
          const primary = activeAlerts[0];
          const extra = activeAlerts.length - 1;
          const title =
            extra > 0
              ? `TaskFlow: ${primary.taskTitle} (+${extra} more)`
              : `TaskFlow: ${primary.taskTitle}`;
          const body =
            extra > 0
              ? `${primary.urgencyLabel}. Plus ${extra} more upcoming deadline${extra > 1 ? 's' : ''}.`
              : `${primary.urgencyLabel} (Priority: ${primary.priority})`;

          const n = new Notification(title, {
            body,
            tag: extra > 0 ? `coalesced-${primary.id}` : primary.id,
            icon: '/taskflow.svg',
          });
          n.onclick = () => {
            try {
              window.focus();
            } catch {
              // Ignore
            }
            optionsRef.current?.onSelectTask?.(primary.taskId);
            try {
              n.close();
            } catch {
              // Ignore
            }
          };
        } catch {
          // Ignore
        }
      }

      return result === 'granted';
    } catch {
      return false;
    }
  }, [activeAlerts]);

  // Proactive alert delivery (Toast & Desktop Notification)
  useEffect(() => {
    // Identify active alerts that have not yet been delivered as a proactive notification
    const newAlerts = activeAlerts.filter((a) => !deliveredIds.includes(a.id));
    if (newAlerts.length === 0) return;

    // Coalesce: Pick the most urgent alert first
    const primaryAlert = newAlerts[0];
    const additionalCount = newAlerts.length - 1;

    let toastMessage = '';
    if (additionalCount > 0) {
      if (primaryAlert.urgency === 'overdue') {
        toastMessage = `"${primaryAlert.taskTitle}" is overdue (+${additionalCount} more deadline${additionalCount > 1 ? 's' : ''})`;
      } else if (primaryAlert.urgency === 'due-today') {
        toastMessage = `"${primaryAlert.taskTitle}" is due today (+${additionalCount} more deadline${additionalCount > 1 ? 's' : ''})`;
      } else {
        toastMessage = `"${primaryAlert.taskTitle}" is due soon (+${additionalCount} more deadline${additionalCount > 1 ? 's' : ''})`;
      }
    } else {
      if (primaryAlert.urgency === 'overdue') {
        toastMessage = `"${primaryAlert.taskTitle}" is overdue (${primaryAlert.urgencyLabel.toLowerCase()})`;
      } else if (primaryAlert.urgency === 'due-today') {
        toastMessage = `"${primaryAlert.taskTitle}" is due today`;
      } else {
        toastMessage = `"${primaryAlert.taskTitle}" is due soon (${formatDisplayDate(primaryAlert.dueDate)})`;
      }
    }

    // Trigger in-app toast notification
    if (optionsRef.current?.onNotifyToast) {
      optionsRef.current.onNotifyToast({
        type: primaryAlert.urgency === 'overdue' ? 'error' : 'info',
        message: toastMessage,
        action: {
          label: 'View task',
          onClick: () => {
            optionsRef.current?.onSelectTask?.(primaryAlert.taskId);
          },
        },
      });
    }

    // Deliver browser desktop notification if permission has been granted
    if (
      typeof window !== 'undefined' &&
      typeof window.Notification !== 'undefined' &&
      window.Notification !== null &&
      window.Notification.permission === 'granted'
    ) {
      try {
        const desktopTitle =
          additionalCount > 0
            ? `TaskFlow: ${primaryAlert.taskTitle} (+${additionalCount} more)`
            : `TaskFlow: ${primaryAlert.taskTitle}`;

        const desktopBody =
          additionalCount > 0
            ? `${primaryAlert.urgencyLabel}. Plus ${additionalCount} more upcoming deadline${additionalCount > 1 ? 's' : ''}.`
            : `${primaryAlert.urgencyLabel} (Priority: ${primaryAlert.priority}, Category: ${primaryAlert.category})`;

        const notification = new Notification(desktopTitle, {
          body: desktopBody,
          tag: additionalCount > 0 ? `coalesced-${primaryAlert.id}` : primaryAlert.id,
          icon: '/taskflow.svg',
        });

        notification.onclick = () => {
          try {
            window.focus();
          } catch {
            // Ignore focus errors
          }
          optionsRef.current?.onSelectTask?.(primaryAlert.taskId);
          try {
            notification.close();
          } catch {
            // Ignore close errors
          }
        };
      } catch {
        // Guard against environments where Notification throws
      }
    }

    // Mark all newly detected alerts as delivered to prevent repeated popups
    const newDeliveredKeys = newAlerts.map((a) => a.id);
    setDeliveredIds((prev) => {
      const updated = Array.from(new Set([...prev, ...newDeliveredKeys])).slice(-100);
      try {
        localStorage.setItem(DELIVERED_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore quota/access errors
      }
      return updated;
    });
  }, [activeAlerts, deliveredIds]);

  // Sync state across storage events (in case another tab updates)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DISMISSED_STORAGE_KEY && e.newValue) {
        try {
          setDismissedIds(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
      if (e.key === SEEN_STORAGE_KEY && e.newValue) {
        try {
          setSeenIds(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
      if (e.key === DELIVERED_STORAGE_KEY && e.newValue) {
        try {
          setDeliveredIds(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    alerts: activeAlerts,
    unseenCount,
    markAllSeen,
    dismissAlert,
    clearAllAlerts,
    browserPermission,
    requestBrowserPermission,
  };
}
