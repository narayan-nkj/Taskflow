import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserTask } from '../types/task';
import { DeadlineAlert, DeadlineUrgency } from '../types/notification';
import { getTaskDeadlineStatus, formatDisplayDate } from '../utils/dates';

const DISMISSED_STORAGE_KEY = 'taskflow_dismissed_alerts_v1';
const SEEN_STORAGE_KEY = 'taskflow_seen_alerts_v1';

export function useDeadlineAlerts(tasks: UserTask[]) {
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

  // Browser notification permission state
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(
    () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission;
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
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      setBrowserPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, []);

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
