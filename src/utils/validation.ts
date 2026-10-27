import {
  UserTask,
  Subtask,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '../types/task';
import { parseLocalDate } from './dates';

export const VALID_STATUSES: readonly TaskStatus[] = ['Pending', 'In Progress', 'Completed'] as const;
export const VALID_PRIORITIES: readonly TaskPriority[] = ['High', 'Medium', 'Low'] as const;
export const VALID_CATEGORIES: readonly TaskCategory[] = ['GDG', 'Academics', 'Personal'] as const;

export const MAX_TITLE_LENGTH = 120;

export function isValidStatus(val: unknown): val is TaskStatus {
  return typeof val === 'string' && VALID_STATUSES.includes(val as TaskStatus);
}

export function isValidPriority(val: unknown): val is TaskPriority {
  return typeof val === 'string' && VALID_PRIORITIES.includes(val as TaskPriority);
}

export function isValidCategory(val: unknown): val is TaskCategory {
  return typeof val === 'string' && VALID_CATEGORIES.includes(val as TaskCategory);
}

/**
 * Defensively validates an individual Subtask item.
 */
export function isValidSubtask(obj: unknown): obj is Subtask {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;

  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') return false;
  if (typeof candidate.title !== 'string') return false;
  const trimmedTitle = candidate.title.trim();
  if (trimmedTitle.length === 0 || trimmedTitle.length > MAX_TITLE_LENGTH) return false;
  if (typeof candidate.completed !== 'boolean') return false;
  if (typeof candidate.createdAt !== 'string' || isNaN(Date.parse(candidate.createdAt))) return false;
  if (typeof candidate.updatedAt !== 'string' || isNaN(Date.parse(candidate.updatedAt))) return false;

  return true;
}

export interface TaskFormErrors {
  title?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  status?: string;
}

export function validateTaskInput(input: {
  title: string;
  priority: string;
  category: string;
  dueDate: string | null;
  status: string;
}): { isValid: boolean; errors: TaskFormErrors } {
  const errors: TaskFormErrors = {};

  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    errors.title = 'Title is required and cannot be blank.';
  } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (!isValidPriority(input.priority)) {
    errors.priority = 'Priority must be High, Medium, or Low.';
  }

  if (!isValidCategory(input.category)) {
    errors.category = 'Category must be GDG, Academics, or Personal.';
  }

  if (input.dueDate !== null && input.dueDate !== '') {
    const parsed = parseLocalDate(input.dueDate);
    if (!parsed) {
      errors.dueDate = 'Due date must be a valid date in YYYY-MM-DD format.';
    }
  }

  if (!isValidStatus(input.status)) {
    errors.status = 'Status must be Pending, In Progress, or Completed.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a loaded or parsed UserTask object strictly.
 * Applies the exact same title length and non-empty rules as form submissions.
 * Accepts legacy records without subtasks, defaulting them to valid.
 */
export function isValidUserTask(obj: unknown): obj is UserTask {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;

  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') return false;
  
  if (typeof candidate.title !== 'string') return false;
  const trimmedTitle = candidate.title.trim();
  if (trimmedTitle.length === 0 || trimmedTitle.length > MAX_TITLE_LENGTH) return false;

  if (!isValidPriority(candidate.priority)) return false;
  if (!isValidCategory(candidate.category)) return false;
  if (candidate.dueDate !== null && typeof candidate.dueDate !== 'string') return false;
  if (typeof candidate.dueDate === 'string' && !parseLocalDate(candidate.dueDate)) return false;
  if (!isValidStatus(candidate.status)) return false;
  if (typeof candidate.createdAt !== 'string' || isNaN(Date.parse(candidate.createdAt))) return false;
  if (typeof candidate.updatedAt !== 'string' || isNaN(Date.parse(candidate.updatedAt))) return false;

  // Defensive validation of subtasks array if present
  if (candidate.subtasks !== undefined) {
    if (!Array.isArray(candidate.subtasks)) return false;
    const subtaskIds = new Set<string>();
    for (const sub of candidate.subtasks) {
      if (!isValidSubtask(sub)) return false;
      if (subtaskIds.has(sub.id)) return false; // Enforce unique subtask ID per parent
      subtaskIds.add(sub.id);
    }
  }

  return true;
}

export interface ImportValidationResult {
  isValid: boolean;
  tasks: UserTask[];
  errorMessage?: string;
}

/**
 * All-or-nothing validation of an imported JSON file string.
 * Supports:
 * 1. Raw UserTask[] array
 * 2. Schema version 1 object payload { schemaVersion: 1, tasks: [...] }
 * Rejects missing or unsupported schemaVersion for object payloads.
 */
export function validateImportJson(rawContent: string): ImportValidationResult {
  if (!rawContent || rawContent.trim() === '') {
    return { isValid: false, tasks: [], errorMessage: 'File is empty.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return {
      isValid: false,
      tasks: [],
      errorMessage: 'Invalid JSON format: Failed to parse file content.',
    };
  }

  let taskArray: unknown[] = [];

  if (Array.isArray(parsed)) {
    // Raw task array
    taskArray = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const payload = parsed as Record<string, unknown>;
    
    // Explicit policy: Object payloads MUST include schemaVersion === 1
    if (payload.schemaVersion === undefined) {
      return {
        isValid: false,
        tasks: [],
        errorMessage: 'Invalid file format: Missing "schemaVersion" in JSON object. Expected schemaVersion: 1.',
      };
    }
    
    if (payload.schemaVersion !== 1) {
      return {
        isValid: false,
        tasks: [],
        errorMessage: `Unsupported schema version: ${payload.schemaVersion}. Only version 1 is supported.`,
      };
    }
    
    if (!Array.isArray(payload.tasks)) {
      return {
        isValid: false,
        tasks: [],
        errorMessage: 'Invalid file format: Missing "tasks" array in JSON object.',
      };
    }
    taskArray = payload.tasks;
  } else {
    return {
      isValid: false,
      tasks: [],
      errorMessage: 'Invalid JSON structure: Expected a task array or a schema object.',
    };
  }

  // Validate every single task item (all-or-nothing)
  const validTasks: UserTask[] = [];
  for (let i = 0; i < taskArray.length; i++) {
    const item = taskArray[i];
    if (!isValidUserTask(item)) {
      return {
        isValid: false,
        tasks: [],
        errorMessage: `Task record at index ${i} is invalid or has malformed fields. Import stopped to prevent corrupting data.`,
      };
    }
    validTasks.push({
      ...item,
      subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
    });
  }

  return {
    isValid: true,
    tasks: validTasks,
  };
}
