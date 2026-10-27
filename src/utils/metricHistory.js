const STORAGE_KEY = 'taskflow_metrics_history_v1';
const MAX_SNAPSHOTS = 14;

/**
 * Load persisted metric snapshot history safely from localStorage.
 *
 * @returns {Array<{ timestamp: number, date: string, total: number, completed: number, pending: number }>}
 */
export function loadMetricHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.timestamp === 'number' &&
        typeof item.date === 'string' &&
        typeof item.total === 'number' &&
        typeof item.completed === 'number' &&
        typeof item.pending === 'number'
    );
  } catch {
    return [];
  }
}

/**
 * Record a metric snapshot for user-owned tasks only.
 * Defensively updates or appends snapshots without fabricating fake trends.
 *
 * @param {{ total: number, completed: number, pending: number }} stats
 * @param {string} currentDateYmd
 * @returns {Array<{ timestamp: number, date: string, total: number, completed: number, pending: number }>}
 */
export function recordMetricSnapshot(stats, currentDateYmd) {
  const history = loadMetricHistory();
  const now = Date.now();
  const last = history[history.length - 1];

  // If latest snapshot is from today and has identical values, return as-is
  if (
    last &&
    last.date === currentDateYmd &&
    last.total === stats.total &&
    last.completed === stats.completed &&
    last.pending === stats.pending
  ) {
    return history;
  }

  let updated;
  if (last && last.date === currentDateYmd) {
    // Update today's entry with latest counts
    updated = [
      ...history.slice(0, -1),
      {
        timestamp: now,
        date: currentDateYmd,
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
      },
    ];
  } else {
    // Append new entry for a new day or initial state
    updated = [
      ...history,
      {
        timestamp: now,
        date: currentDateYmd,
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
      },
    ];
  }

  // Bound retention window
  if (updated.length > MAX_SNAPSHOTS) {
    updated = updated.slice(updated.length - MAX_SNAPSHOTS);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  return updated;
}
