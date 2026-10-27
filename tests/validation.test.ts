import { describe, it, expect } from 'vitest';
import { validateTaskInput, validateImportJson } from '../src/utils/validation';

describe('validation utilities', () => {
  it('rejects blank and whitespace-only titles with helpful message', () => {
    const emptyRes = validateTaskInput({
      title: '   ',
      priority: 'High',
      category: 'GDG',
      dueDate: null,
      status: 'Pending',
    });
    expect(emptyRes.isValid).toBe(false);
    expect(emptyRes.errors.title).toBe('Title is required and cannot be blank.');
  });

  it('accepts valid task inputs', () => {
    const validRes = validateTaskInput({
      title: 'Review PR for GDG workshop',
      priority: 'High',
      category: 'GDG',
      dueDate: '2026-10-30',
      status: 'Pending',
    });
    expect(validRes.isValid).toBe(true);
    expect(validRes.errors).toEqual({});
  });

  it('validates imported JSON with schemaVersion: 1', () => {
    const validJson = JSON.stringify({
      schemaVersion: 1,
      exportedAt: '2026-10-27T10:00:00.000Z',
      appName: 'TaskFlow',
      tasks: [
        {
          id: 'test-1',
          title: 'Imported task',
          priority: 'Medium',
          category: 'Personal',
          dueDate: null,
          status: 'Pending',
          createdAt: '2026-10-27T10:00:00.000Z',
          updatedAt: '2026-10-27T10:00:00.000Z',
        },
      ],
    });

    const res = validateImportJson(validJson);
    expect(res.isValid).toBe(true);
    expect(res.tasks).toHaveLength(1);
    expect(res.tasks[0].title).toBe('Imported task');
  });

  it('rejects malformed JSON and enforces all-or-nothing validation', () => {
    const invalidJson = JSON.stringify({
      schemaVersion: 1,
      tasks: [
        {
          id: 'valid-1',
          title: 'Good Task',
          priority: 'High',
          category: 'GDG',
          dueDate: null,
          status: 'Pending',
          createdAt: '2026-10-27T10:00:00.000Z',
          updatedAt: '2026-10-27T10:00:00.000Z',
        },
        {
          id: 'bad-2',
          title: '', // Empty title is invalid
          priority: 'UnknownPriority',
          category: 'GDG',
          dueDate: null,
          status: 'Pending',
          createdAt: '2026-10-27T10:00:00.000Z',
          updatedAt: '2026-10-27T10:00:00.000Z',
        },
      ],
    });

    const res = validateImportJson(invalidJson);
    expect(res.isValid).toBe(false);
    expect(res.tasks).toHaveLength(0); // All-or-nothing: zero tasks imported
    expect(res.errorMessage).toContain('invalid or has malformed fields');
  });

  it('rejects unsupported schema version', () => {
    const badVersion = JSON.stringify({
      schemaVersion: 99,
      tasks: [],
    });
    const res = validateImportJson(badVersion);
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('Unsupported schema version: 99');
  });
});
