import { TaskStatus } from '../types/task';

/**
 * Returns today's date in local calendar YYYY-MM-DD format
 * avoiding any UTC midnight shifts.
 */
export function getLocalTodayString(baseDate = new Date()): string {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD string into a Date object representing local midnight
 */
export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  // Verify date validity (e.g. not Feb 31)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Formats YYYY-MM-DD for user presentation (e.g., "Oct 27, 2026" or "Today")
 */
export function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return 'Invalid date';

  const todayStr = getLocalTodayString();
  if (dateStr === todayStr) {
    return 'Today';
  }

  // Check tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === getLocalTodayString(tomorrow)) {
    return 'Tomorrow';
  }

  // Check yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === getLocalTodayString(yesterday)) {
    return 'Yesterday';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: parsed.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export type DeadlineState = 'overdue' | 'due-today' | 'upcoming' | 'normal' | 'none';

/**
 * Computes deadline urgency based on local calendar dates and task status.
 * Completed tasks are NEVER marked overdue or due today.
 */
export function getDeadlineState(
  dueDate: string | null,
  status: TaskStatus,
  referenceDate = new Date()
): { state: DeadlineState; label: string; daysRemaining?: number } {
  if (!dueDate) {
    return { state: 'none', label: 'No deadline' };
  }

  const parsedDue = parseLocalDate(dueDate);
  if (!parsedDue) {
    return { state: 'none', label: 'Invalid date' };
  }

  // Completed tasks are never overdue or due today
  if (status === 'Completed') {
    return { state: 'normal', label: 'Completed' };
  }

  const todayStr = getLocalTodayString(referenceDate);
  const todayDate = parseLocalDate(todayStr)!;

  // Calculate day difference
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((parsedDue.getTime() - todayDate.getTime()) / msPerDay);

  if (dueDate < todayStr) {
    const overdueDays = Math.abs(diffDays);
    return {
      state: 'overdue',
      label: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
      daysRemaining: diffDays,
    };
  }

  if (dueDate === todayStr) {
    return {
      state: 'due-today',
      label: 'Due today',
      daysRemaining: 0,
    };
  }

  if (diffDays <= 3) {
    return {
      state: 'upcoming',
      label: diffDays === 1 ? 'Due tomorrow' : `Due in ${diffDays} days`,
      daysRemaining: diffDays,
    };
  }

  return {
    state: 'normal',
    label: `Due in ${diffDays} days`,
    daysRemaining: diffDays,
  };
}
