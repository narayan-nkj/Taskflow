/**
 * Calculates dashboard statistics from user-owned tasks only.
 *
 * Rules:
 * - Total Tasks: all user-owned tasks
 * - Completed: tasks with status === 'Completed'
 * - Pending: tasks with status === 'Pending' (explicitly excludes 'In Progress')
 * - In Progress: tasks with status === 'In Progress'
 * - Completion Rate: (completed / total) * 100, handled cleanly for total === 0 (0%, no NaN)
 *
 * @param {Array<object>} tasks
 * @returns {{ total: number, completed: number, pending: number, inProgress: number, completionRate: number, completionRateFormatted: string }}
 */
export function calculateStatistics(tasks) {
  const total = tasks.length;
  let completed = 0;
  let pending = 0;
  let inProgress = 0;

  for (const task of tasks) {
    if (task.status === 'Completed') {
      completed++;
    } else if (task.status === 'Pending') {
      pending++;
    } else if (task.status === 'In Progress') {
      inProgress++;
    }
  }

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    inProgress,
    completionRate,
    completionRateFormatted: `${completionRate}%`,
  };
}
