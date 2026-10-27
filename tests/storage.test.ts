import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadUserTasksFromStorage,
  saveUserTasksToStorage,
  loadThemeFromStorage,
  saveThemeToStorage,
  getSafeLocalStorage,
  USER_TASKS_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from '../src/utils/storage';
import { UserTask } from '../src/types/task';

describe('storage utilities with robust guardrails', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore window.localStorage descriptor
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  const validTask: UserTask = {
    id: 'test-1',
    title: 'Valid task',
    priority: 'High',
    category: 'GDG',
    dueDate: '2026-10-30',
    status: 'Pending',
    createdAt: '2026-10-27T10:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
  };

  it('saves and loads user tasks successfully under normal conditions', () => {
    const saveRes = saveUserTasksToStorage([validTask]);
    expect(saveRes.success).toBe(true);
    expect(saveRes.error).toBeUndefined();

    const loadRes = loadUserTasksFromStorage();
    expect(loadRes.hadCorruption).toBe(false);
    expect(loadRes.data).toHaveLength(1);
    expect(loadRes.data[0].title).toBe('Valid task');
  });

  it('handles throwing window.localStorage getter safely without crashing', () => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('SecurityError: The operation is insecure.', 'SecurityError');
      },
      configurable: true,
    });

    expect(getSafeLocalStorage()).toBeNull();

    const loadRes = loadUserTasksFromStorage();
    expect(loadRes.data).toEqual([]);
    expect(loadRes.hadCorruption).toBe(false);
    expect(loadRes.errorMessage).toContain('Local storage is unavailable');

    const saveRes = saveUserTasksToStorage([validTask]);
    expect(saveRes.success).toBe(false);
    expect(saveRes.error).toContain('Local storage is unavailable');

    const theme = loadThemeFromStorage();
    expect(theme).toBe('system');

    const themeSaved = saveThemeToStorage('dark');
    expect(themeSaved).toBe(false);
  });

  it('detects quota exceeded errors on save and returns a failure result', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new DOMException('QuotaExceededError', 'QuotaExceededError');
      Object.defineProperty(err, 'code', { value: 22 });
      throw err;
    });

    const res = saveUserTasksToStorage([validTask]);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Storage quota exceeded');
  });

  it('recovers valid tasks while skipping and reporting corrupted entries', () => {
    const rawData = JSON.stringify([
      validTask,
      { id: 'corrupted-1', title: '' }, // invalid title
      { id: 'corrupted-2', title: 'A'.repeat(125), priority: 'High', category: 'GDG', status: 'Pending', createdAt: '2026', updatedAt: '2026' }, // 125 chars
    ]);
    window.localStorage.setItem(USER_TASKS_STORAGE_KEY, rawData);

    const res = loadUserTasksFromStorage();
    expect(res.hadCorruption).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe('test-1');
    expect(res.errorMessage).toContain('Recovered 1 tasks, but 2 corrupted records were skipped');
  });

  it('safely handles malformed non-JSON data in storage', () => {
    window.localStorage.setItem(USER_TASKS_STORAGE_KEY, 'invalid-json{{{');

    const res = loadUserTasksFromStorage();
    expect(res.hadCorruption).toBe(true);
    expect(res.data).toEqual([]);
    expect(res.errorMessage).toContain('malformed JSON');
  });

  it('saves, loads, and clears theme preference safely', () => {
    expect(loadThemeFromStorage()).toBe('system');

    expect(saveThemeToStorage('dark')).toBe(true);
    expect(loadThemeFromStorage()).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    expect(saveThemeToStorage('light')).toBe(true);
    expect(loadThemeFromStorage()).toBe('light');

    expect(saveThemeToStorage('system')).toBe(true);
    expect(loadThemeFromStorage()).toBe('system');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('safely defaults old localStorage records without a favorite property to false', () => {
    const legacyRecord = {
      id: 'legacy-1',
      title: 'Legacy task without favorite',
      priority: 'High',
      category: 'GDG',
      dueDate: '2026-10-30',
      status: 'Pending',
      createdAt: '2026-10-27T10:00:00.000Z',
      updatedAt: '2026-10-27T10:00:00.000Z',
    };
    window.localStorage.setItem(USER_TASKS_STORAGE_KEY, JSON.stringify([legacyRecord]));

    const res = loadUserTasksFromStorage();
    expect(res.hadCorruption).toBe(false);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe('legacy-1');
    expect(res.data[0].favorite).toBe(false);
  });

  it('persists and restores favorite: true without losing other task attributes', () => {
    const favoriteTask: UserTask = {
      ...validTask,
      id: 'fav-1',
      title: 'Star Project',
      favorite: true,
    };
    const saveRes = saveUserTasksToStorage([favoriteTask]);
    expect(saveRes.success).toBe(true);

    const loadRes = loadUserTasksFromStorage();
    expect(loadRes.hadCorruption).toBe(false);
    expect(loadRes.data).toHaveLength(1);
    expect(loadRes.data[0].favorite).toBe(true);
    expect(loadRes.data[0].title).toBe('Star Project');
    expect(loadRes.data[0].status).toBe('Pending');
  });
});
