import { UserTask } from '../types/task';
import { isValidUserTask } from './validation';

export const USER_TASKS_STORAGE_KEY = 'taskflow:user-tasks:v1';
export const THEME_STORAGE_KEY = 'taskflow:theme:v1';

export interface StorageLoadResult<T> {
  data: T;
  hadCorruption: boolean;
  errorMessage?: string;
}

/**
 * Safely accesses window.localStorage without throwing in restricted browser contexts.
 */
export function getSafeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Safely reads from localStorage with defensive JSON parsing and validation.
 */
export function loadUserTasksFromStorage(): StorageLoadResult<UserTask[]> {
  if (typeof window === 'undefined') {
    return { data: [], hadCorruption: false };
  }

  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    return {
      data: [],
      hadCorruption: false,
      errorMessage: 'Local storage is unavailable or access was denied (e.g. strict private browsing).',
    };
  }

  if (!storage) {
    return {
      data: [],
      hadCorruption: false,
      errorMessage: 'Local storage is not available in this environment.',
    };
  }

  try {
    const raw = storage.getItem(USER_TASKS_STORAGE_KEY);
    if (!raw) {
      return { data: [], hadCorruption: false };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        data: [],
        hadCorruption: true,
        errorMessage: 'Stored task data was malformed JSON and could not be restored.',
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        data: [],
        hadCorruption: true,
        errorMessage: 'Stored task data was not an array.',
      };
    }

    // Filter valid tasks and record if any were corrupted
    const validTasks: UserTask[] = [];
    let corruptedCount = 0;

    for (const item of parsed) {
      if (isValidUserTask(item)) {
        const rawRecord = item as unknown as Record<string, unknown>;
        const isFav =
          typeof item.favorite === 'boolean'
            ? item.favorite
            : typeof rawRecord.isFavorite === 'boolean'
            ? rawRecord.isFavorite
            : false;

        validTasks.push({
          ...item,
          subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
          favorite: isFav,
        });
      } else {
        corruptedCount++;
      }
    }

    if (corruptedCount > 0) {
      return {
        data: validTasks,
        hadCorruption: true,
        errorMessage: `Recovered ${validTasks.length} tasks, but ${corruptedCount} corrupted records were skipped.`,
      };
    }

    return {
      data: validTasks,
      hadCorruption: false,
    };
  } catch {
    return {
      data: [],
      hadCorruption: true,
      errorMessage: 'Local storage is unavailable or access was denied (e.g. strict private browsing).',
    };
  }
}

/**
 * Safely persists user tasks to localStorage with error handling for quota/private mode.
 */
export function saveUserTasksToStorage(tasks: readonly UserTask[]): {
  success: boolean;
  error?: string;
} {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Local storage is not available in non-browser environments.' };
  }

  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    return {
      success: false,
      error: 'Local storage is unavailable or access was denied (e.g. strict private browsing).',
    };
  }

  if (!storage) {
    return { success: false, error: 'Local storage is not available in this environment.' };
  }

  try {
    const serialized = JSON.stringify(tasks);
    storage.setItem(USER_TASKS_STORAGE_KEY, serialized);
    return { success: true };
  } catch (err: unknown) {
    const isQuotaError =
      err instanceof DOMException &&
      (err.code === 22 ||
        err.code === 1014 ||
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    const msg = isQuotaError
      ? 'Storage quota exceeded. Please free up browser space.'
      : 'Failed to write to local storage. Your changes might not persist across sessions.';

    return { success: false, error: msg };
  }
}

export type ThemePreference = 'light' | 'dark' | 'system';

export function loadThemeFromStorage(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system';
  }
  try {
    const storage = window.localStorage;
    if (!storage) return 'system';
    const val = storage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark') {
      return val;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function saveThemeToStorage(theme: ThemePreference): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const storage = window.localStorage;
    if (!storage) return false;
    if (theme === 'system') {
      storage.removeItem(THEME_STORAGE_KEY);
    } else {
      storage.setItem(THEME_STORAGE_KEY, theme);
    }
    return true;
  } catch {
    return false;
  }
}
