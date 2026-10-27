import { UserTask } from '../types/task';

export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: number; // 0 to 100
  completionRateFormatted: string; // e.g. "75%" or "0%"
}

/**
 * Calculates dashboard statistics from user-owned tasks only.
 *
 * Rules:
 * - Total Tasks: all user-owned tasks
 * - Completed: tasks with status === 'Completed'
 * - Pending: tasks with status === 'Pending' (explicitly excludes 'In Progress')
 * - In Progress: tasks with status === 'In Progress'
 * - Completion Rate: (completed / total) * 100, handled cleanly for total === 0 (0%, no NaN)
 */
export function calculateStatistics(tasks: readonly UserTask[]): TaskStatistics {
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
