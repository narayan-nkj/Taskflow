import { parseLocalDate } from './dates';

export const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];
export const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
export const VALID_CATEGORIES = ['GDG', 'Academics', 'Personal'];

export const MAX_TITLE_LENGTH = 120;

export function isValidStatus(val) {
  return typeof val === 'string' && VALID_STATUSES.includes(val);
}

export function isValidPriority(val) {
  return typeof val === 'string' && VALID_PRIORITIES.includes(val);
}

export function isValidCategory(val) {
  return typeof val === 'string' && VALID_CATEGORIES.includes(val);
}

/**
 * Defensively validates an individual Subtask item.
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isValidSubtask(obj) {
  if (!obj || typeof obj !== 'object') return false;

  if (typeof obj.id !== 'string' || obj.id.trim() === '') return false;
  if (typeof obj.title !== 'string') return false;
  const trimmedTitle = obj.title.trim();
  if (trimmedTitle.length === 0 || trimmedTitle.length > MAX_TITLE_LENGTH) return false;
  if (typeof obj.completed !== 'boolean') return false;
  if (typeof obj.createdAt !== 'string' || isNaN(Date.parse(obj.createdAt))) return false;
  if (typeof obj.updatedAt !== 'string' || isNaN(Date.parse(obj.updatedAt))) return false;

  return true;
}

/**
 * @param {{ title: string, priority: string, category: string, dueDate: string | null, status: string }} input
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateTaskInput(input) {
  const errors = {};

  const trimmedTitle = typeof input.title === 'string' ? input.title.trim() : '';
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

  if (input.dueDate !== null && input.dueDate !== '' && input.dueDate !== undefined) {
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
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isValidUserTask(obj) {
  if (!obj || typeof obj !== 'object') return false;

  if (typeof obj.id !== 'string' || obj.id.trim() === '') return false;

  if (typeof obj.title !== 'string') return false;
  const trimmedTitle = obj.title.trim();
  if (trimmedTitle.length === 0 || trimmedTitle.length > MAX_TITLE_LENGTH) return false;

  if (!isValidPriority(obj.priority)) return false;
  if (!isValidCategory(obj.category)) return false;
  if (obj.dueDate !== null && typeof obj.dueDate !== 'string') return false;
  if (typeof obj.dueDate === 'string' && !parseLocalDate(obj.dueDate)) return false;
  if (!isValidStatus(obj.status)) return false;
  if (typeof obj.createdAt !== 'string' || isNaN(Date.parse(obj.createdAt))) return false;
  if (typeof obj.updatedAt !== 'string' || isNaN(Date.parse(obj.updatedAt))) return false;

  // Defensive validation of subtasks array if present
  if (obj.subtasks !== undefined) {
    if (!Array.isArray(obj.subtasks)) return false;
    const subtaskIds = new Set();
    for (const sub of obj.subtasks) {
      if (!isValidSubtask(sub)) return false;
      if (subtaskIds.has(sub.id)) return false; // Enforce unique subtask ID per parent
      subtaskIds.add(sub.id);
    }
  }

  // Defensive validation of favorite flag if present
  if (obj.favorite !== undefined && typeof obj.favorite !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * All-or-nothing validation of an imported JSON file string.
 * Supports:
 * 1. Raw UserTask[] array
 * 2. Schema version 1 object payload { schemaVersion: 1, tasks: [...] }
 * Rejects missing or unsupported schemaVersion for object payloads.
 *
 * @param {string} rawContent
 * @returns {{ isValid: boolean, tasks: Array<object>, errorMessage?: string }}
 */
export function validateImportJson(rawContent) {
  if (!rawContent || rawContent.trim() === '') {
    return { isValid: false, tasks: [], errorMessage: 'File is empty.' };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return {
      isValid: false,
      tasks: [],
      errorMessage: 'Invalid JSON format: Failed to parse file content.',
    };
  }

  let taskArray = [];

  if (Array.isArray(parsed)) {
    // Raw task array
    taskArray = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const payload = parsed;

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
  const validTasks = [];
  for (let i = 0; i < taskArray.length; i++) {
    const item = taskArray[i];
    if (!isValidUserTask(item)) {
      return {
        isValid: false,
        tasks: [],
        errorMessage: `Task record at index ${i} is invalid or has malformed fields. Import stopped to prevent corrupting data.`,
      };
    }
    const isFav =
      typeof item.favorite === 'boolean'
        ? item.favorite
        : typeof item.isFavorite === 'boolean'
        ? item.isFavorite
        : false;

    validTasks.push({
      ...item,
      subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
      favorite: isFav,
    });
  }

  return {
    isValid: true,
    tasks: validTasks,
  };
}
