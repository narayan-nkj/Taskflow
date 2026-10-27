import { TaskStatistics } from './statistics';

export interface MetricSnapshot {
  timestamp: number;
  date: string; // YYYY-MM-DD
  total: number;
  completed: number;
  pending: number;
}

const STORAGE_KEY = 'taskflow_metrics_history_v1';
const MAX_SNAPSHOTS = 14;

/**
 * Load persisted metric snapshot history safely from localStorage.
 */
export function loadMetricHistory(): MetricSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MetricSnapshot =>
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
 */
export function recordMetricSnapshot(
  stats: TaskStatistics,
  currentDateYmd: string
): MetricSnapshot[] {
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

  let updated: MetricSnapshot[];
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
