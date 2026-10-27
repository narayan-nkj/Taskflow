import { UserTask, SortOption, TaskPriority } from '../types/task';

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Deterministically sorts a collection of UserTasks according to business rules.
 * - Due date sorting: dated tasks sorted, undated (null) tasks consistently grouped at the end.
 * - Stable tie-breaker: title (A-Z) or createdAt.
 */
export function sortTasks(tasks: readonly UserTask[], sortBy: SortOption): UserTask[] {
  const result = [...tasks];

  result.sort((a, b) => {
    switch (sortBy) {
      case 'dueDate-asc': {
        // Both have dates
        if (a.dueDate && b.dueDate) {
          const comp = a.dueDate.localeCompare(b.dueDate);
          if (comp !== 0) return comp;
        } else if (a.dueDate && !b.dueDate) {
          return -1; // a comes first
        } else if (!a.dueDate && b.dueDate) {
          return 1; // b comes first, undated tasks last
        }
        // Tie breaker: priority (high to low), then title
        const pDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
        if (pDiff !== 0) return pDiff;
        return a.title.localeCompare(b.title);
      }

      case 'dueDate-desc': {
        if (a.dueDate && b.dueDate) {
          const comp = b.dueDate.localeCompare(a.dueDate);
          if (comp !== 0) return comp;
        } else if (a.dueDate && !b.dueDate) {
          return -1; // a comes first (dated before undated)
        } else if (!a.dueDate && b.dueDate) {
          return 1; // b comes first, undated tasks last
        }
        // Tie breaker: priority, then title
        const pDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
        if (pDiff !== 0) return pDiff;
        return a.title.localeCompare(b.title);
      }

      case 'priority-high-low': {
        const diff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
        if (diff !== 0) return diff;
        // Tie breaker: due date asc, then title
        if (a.dueDate && b.dueDate) {
          const comp = a.dueDate.localeCompare(b.dueDate);
          if (comp !== 0) return comp;
        } else if (a.dueDate && !b.dueDate) {
          return -1;
        } else if (!a.dueDate && b.dueDate) {
          return 1;
        }
        return a.title.localeCompare(b.title);
      }

      case 'priority-low-high': {
        const diff = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
        if (diff !== 0) return diff;
        if (a.dueDate && b.dueDate) {
          const comp = a.dueDate.localeCompare(b.dueDate);
          if (comp !== 0) return comp;
        } else if (a.dueDate && !b.dueDate) {
          return -1;
        } else if (!a.dueDate && b.dueDate) {
          return 1;
        }
        return a.title.localeCompare(b.title);
      }

      case 'newest': {
        const comp = b.createdAt.localeCompare(a.createdAt);
        if (comp !== 0) return comp;
        return a.title.localeCompare(b.title);
      }

      case 'oldest': {
        const comp = a.createdAt.localeCompare(b.createdAt);
        if (comp !== 0) return comp;
        return a.title.localeCompare(b.title);
      }

      case 'title-asc':
      default: {
        const comp = a.title.localeCompare(b.title);
        if (comp !== 0) return comp;
        return b.createdAt.localeCompare(a.createdAt);
      }
    }
  });

  return result;
}
