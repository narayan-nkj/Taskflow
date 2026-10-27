/**
 * Returns today's date in local calendar YYYY-MM-DD format
 * avoiding any UTC midnight shifts.
 *
 * @param {Date} [baseDate]
 * @returns {string}
 */
export function getLocalTodayString(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a given Date in local calendar YYYY-MM-DD format
 *
 * @param {Date} baseDate
 * @returns {string}
 */
export function formatLocalYmd(baseDate) {
  return getLocalTodayString(baseDate);
}

/**
 * Parses YYYY-MM-DD string into a Date object representing local midnight
 *
 * @param {string} dateStr
 * @returns {Date | null}
 */
export function parseLocalDate(dateStr) {
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
 *
 * @param {string | null} dateStr
 * @returns {string}
 */
export function formatDisplayDate(dateStr) {
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

/**
 * Computes deadline urgency based on local calendar dates and task status.
 * Completed tasks are NEVER marked overdue or due today.
 *
 * @param {string | null} dueDate
 * @param {string} status
 * @param {Date} [referenceDate]
 * @returns {{ state: string, label: string, daysRemaining?: number }}
 */
export function getDeadlineState(
  dueDate,
  status,
  referenceDate = new Date()
) {
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
  const todayDate = parseLocalDate(todayStr);

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

/**
 * Convenience helper supporting either TaskStatus string or boolean isCompleted
 *
 * @param {string | null} dueDate
 * @param {string | boolean} statusOrCompleted
 * @param {Date} [referenceDate]
 */
export function getTaskDeadlineStatus(
  dueDate,
  statusOrCompleted,
  referenceDate = new Date()
) {
  const status =
    typeof statusOrCompleted === 'boolean'
      ? statusOrCompleted
        ? 'Completed'
        : 'Pending'
      : statusOrCompleted;
  return getDeadlineState(dueDate, status, referenceDate);
}
