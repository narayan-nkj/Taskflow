import { describe, it, expect } from 'vitest';
import { validateTaskInput, validateImportJson, isValidUserTask } from '../src/utils/validation';

describe('validation utilities and import schema', () => {
  const baseValidInput = {
    title: 'Valid task title',
    priority: 'High',
    category: 'GDG',
    dueDate: '2026-10-30',
    status: 'Pending',
  };

  const baseValidTask = {
    id: 'test-1',
    title: 'Imported task',
    priority: 'Medium',
    category: 'Personal',
    dueDate: null,
    status: 'Pending',
    createdAt: '2026-10-27T10:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
  };

  describe('validateTaskInput and title boundaries', () => {
    it('rejects blank and whitespace-only titles with helpful message', () => {
      const emptyRes = validateTaskInput({ ...baseValidInput, title: '   ' });
      expect(emptyRes.isValid).toBe(false);
      expect(emptyRes.errors.title).toBe('Title is required and cannot be blank.');
    });

    it('accepts a title with exactly 120 characters', () => {
      const title120 = 'A'.repeat(120);
      const res = validateTaskInput({ ...baseValidInput, title: title120 });
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
    });

    it('rejects a title with 121 characters', () => {
      const title121 = 'A'.repeat(121);
      const res = validateTaskInput({ ...baseValidInput, title: title121 });
      expect(res.isValid).toBe(false);
      expect(res.errors.title).toBe('Title must be 120 characters or fewer.');
    });

    it('accepts valid task inputs with optional due dates and valid categories', () => {
      const res = validateTaskInput({ ...baseValidInput, dueDate: null });
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
    });

    it('accepts past due dates without rejecting or clearing them (yesterday, last month, previous years)', () => {
      const yesterdayRes = validateTaskInput({ ...baseValidInput, dueDate: '2026-10-26' });
      expect(yesterdayRes.isValid).toBe(true);
      expect(yesterdayRes.errors.dueDate).toBeUndefined();

      const lastYearRes = validateTaskInput({ ...baseValidInput, dueDate: '2025-01-15' });
      expect(lastYearRes.isValid).toBe(true);
      expect(lastYearRes.errors.dueDate).toBeUndefined();
    });
  });

  describe('isValidUserTask record validator', () => {
    it('accepts valid UserTask records with up to 120 characters', () => {
      expect(isValidUserTask(baseValidTask)).toBe(true);
      expect(isValidUserTask({ ...baseValidTask, title: 'B'.repeat(120) })).toBe(true);
    });

    it('rejects UserTask records with whitespace-only or empty titles', () => {
      expect(isValidUserTask({ ...baseValidTask, title: '' })).toBe(false);
      expect(isValidUserTask({ ...baseValidTask, title: '   ' })).toBe(false);
    });

    it('rejects UserTask records with titles exceeding 120 characters', () => {
      expect(isValidUserTask({ ...baseValidTask, title: 'B'.repeat(121) })).toBe(false);
    });

    it('rejects records with missing or invalid fields', () => {
      expect(isValidUserTask(null)).toBe(false);
      expect(isValidUserTask({ ...baseValidTask, priority: 'Critical' })).toBe(false);
      expect(isValidUserTask({ ...baseValidTask, category: 'Work' })).toBe(false);
      expect(isValidUserTask({ ...baseValidTask, status: 'Archived' })).toBe(false);
    });
  });

  describe('validateImportJson schema handling', () => {
    it('accepts raw task arrays', () => {
      const rawJson = JSON.stringify([baseValidTask]);
      const res = validateImportJson(rawJson);
      expect(res.isValid).toBe(true);
      expect(res.tasks).toHaveLength(1);
      expect(res.tasks[0].title).toBe('Imported task');
    });

    it('accepts valid object export format with schemaVersion === 1', () => {
      const validJson = JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-10-27T10:00:00.000Z',
        appName: 'TaskFlow',
        tasks: [baseValidTask],
      });

      const res = validateImportJson(validJson);
      expect(res.isValid).toBe(true);
      expect(res.tasks).toHaveLength(1);
      expect(res.tasks[0].title).toBe('Imported task');
    });

    it('rejects object payloads missing schemaVersion', () => {
      const noVersion = JSON.stringify({
        tasks: [baseValidTask],
      });
      const res = validateImportJson(noVersion);
      expect(res.isValid).toBe(false);
      expect(res.tasks).toHaveLength(0);
      expect(res.errorMessage).toBe('Invalid file format: Missing "schemaVersion" in JSON object. Expected schemaVersion: 1.');
    });

    it('rejects unsupported schema version', () => {
      const badVersion = JSON.stringify({
        schemaVersion: 2,
        tasks: [baseValidTask],
      });
      const res = validateImportJson(badVersion);
      expect(res.isValid).toBe(false);
      expect(res.tasks).toHaveLength(0);
      expect(res.errorMessage).toBe('Unsupported schema version: 2. Only version 1 is supported.');
    });

    it('rejects object payload missing tasks array', () => {
      const missingTasks = JSON.stringify({
        schemaVersion: 1,
      });
      const res = validateImportJson(missingTasks);
      expect(res.isValid).toBe(false);
      expect(res.tasks).toHaveLength(0);
      expect(res.errorMessage).toBe('Invalid file format: Missing "tasks" array in JSON object.');
    });

    it('rejects non-array and non-object inputs', () => {
      expect(validateImportJson('"string"').isValid).toBe(false);
      expect(validateImportJson('12345').isValid).toBe(false);
      expect(validateImportJson('null').isValid).toBe(false);
    });

    it('rejects malformed JSON syntax', () => {
      const res = validateImportJson('{ not json }');
      expect(res.isValid).toBe(false);
      expect(res.tasks).toHaveLength(0);
      expect(res.errorMessage).toBe('Invalid JSON format: Failed to parse file content.');
    });

    it('enforces all-or-nothing validation: any invalid task rejects the entire file', () => {
      const mixedJson = JSON.stringify({
        schemaVersion: 1,
        tasks: [
          baseValidTask,
          { ...baseValidTask, id: 'bad-task', title: 'C'.repeat(121) }, // 121 chars
        ],
      });
      const res = validateImportJson(mixedJson);
      expect(res.isValid).toBe(false);
      expect(res.tasks).toHaveLength(0);
      expect(res.errorMessage).toContain('invalid or has malformed fields');
    });
  });
});
