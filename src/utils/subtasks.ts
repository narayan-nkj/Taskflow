import { Subtask } from '../types/task';
import { MAX_TITLE_LENGTH } from './validation';

export interface SubtaskProgress {
  total: number;
  completed: number;
  percentage: number;
  isAllCompleted: boolean;
  summaryLabel: string; // e.g. "2 of 4 complete"
}

/**
 * Calculates completed vs total checklist counts and percentage.
 * Handles zero subtasks, partial completion, and all-completed cleanly.
 */
export function getSubtaskProgress(subtasks?: readonly Subtask[] | null): SubtaskProgress {
  if (!subtasks || subtasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 0,
      isAllCompleted: false,
      summaryLabel: '0 of 0 complete',
    };
  }

  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.completed).length;
  const percentage = Math.round((completed / total) * 100);
  const isAllCompleted = completed === total && total > 0;

  return {
    total,
    completed,
    percentage,
    isAllCompleted,
    summaryLabel: `${completed} of ${total} complete`,
  };
}

/**
 * Validates a subtask title before creation or update.
 * Must be non-empty after trimming and <= 120 characters.
 */
export function validateSubtaskTitle(title: string): { isValid: boolean; error?: string; trimmed: string } {
  const trimmed = title.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Subtask title cannot be blank.', trimmed: '' };
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return {
      isValid: false,
      error: `Subtask title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
      trimmed,
    };
  }
  return { isValid: true, trimmed };
}

/**
 * Generates a unique subtask ID.
 */
export function generateSubtaskId(allocatedIds?: Set<string>): string {
  const base =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  if (!allocatedIds || !allocatedIds.has(base)) {
    return base;
  }

  let counter = 1;
  while (counter <= 1000) {
    const candidate = `${base}-${counter++}`;
    if (!allocatedIds.has(candidate)) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}
