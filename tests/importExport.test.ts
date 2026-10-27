import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateUniqueId, importTasksFromJsonFile } from '../src/services/importExport';
import { UserTask } from '../src/types/task';

describe('importExport service & robust ID generation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const existingTask: UserTask = {
    id: 'existing-id-1',
    title: 'Existing user task',
    priority: 'High',
    category: 'GDG',
    dueDate: '2026-10-30',
    status: 'Pending',
    createdAt: '2026-10-27T10:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
  };

  describe('generateUniqueId', () => {
    it('returns an ID not in allocatedIds', () => {
      const allocated = new Set(['id-1', 'id-2']);
      const id = generateUniqueId(allocated);
      expect(allocated.has(id)).toBe(false);
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('handles a mocked ID generator returning repeated colliding values via bounded retry fallback', () => {
      const allocated = new Set(['repeated-mock-id']);

      // Mock crypto.randomUUID to always return the colliding ID
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('repeated-mock-id' as `${string}-${string}-${string}-${string}-${string}`);

      // generateUniqueId should exhaust the 50 random attempts and successfully use its deterministic fallback
      const resultId = generateUniqueId(allocated);
      expect(resultId).not.toBe('repeated-mock-id');
      expect(allocated.has(resultId)).toBe(false);
      expect(resultId).toContain('task-import-');
    });
  });

  describe('importTasksFromJsonFile', () => {
    const makeFile = (content: string, filename = 'backup.json'): File => {
      return new File([content], filename, { type: 'application/json' });
    };

    it('resolves collision with existing user tasks by generating new unique IDs for imported tasks', async () => {
      const fileContent = JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-10-27T10:00:00.000Z',
        appName: 'TaskFlow',
        tasks: [
          {
            id: 'existing-id-1', // Collides with existing task!
            title: 'Imported conflicting task',
            priority: 'Medium',
            category: 'Personal',
            dueDate: null,
            status: 'Pending',
            createdAt: '2026-10-27T10:00:00.000Z',
            updatedAt: '2026-10-27T10:00:00.000Z',
          },
        ],
      });

      const file = makeFile(fileContent);
      const res = await importTasksFromJsonFile(file, [existingTask]);

      expect(res.success).toBe(true);
      expect(res.importedCount).toBe(1);
      expect(res.collisionCount).toBe(1);
      expect(res.mergedTasks).toHaveLength(2);

      // Existing task remains untouched
      expect(res.mergedTasks[0]).toEqual(existingTask);

      // Imported task has a new, unique ID
      const importedTask = res.mergedTasks[1];
      expect(importedTask.title).toBe('Imported conflicting task');
      expect(importedTask.id).not.toBe('existing-id-1');
      expect(importedTask.id).toBeDefined();
    });

    it('resolves intra-file duplicate IDs so every imported task gets a unique ID', async () => {
      const fileContent = JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-10-27T10:00:00.000Z',
        appName: 'TaskFlow',
        tasks: [
          {
            id: 'duplicate-within-file',
            title: 'First instance',
            priority: 'Low',
            category: 'Academics',
            dueDate: null,
            status: 'Pending',
            createdAt: '2026-10-27T10:00:00.000Z',
            updatedAt: '2026-10-27T10:00:00.000Z',
          },
          {
            id: 'duplicate-within-file', // Duplicate inside same file!
            title: 'Second instance',
            priority: 'High',
            category: 'Academics',
            dueDate: null,
            status: 'In Progress',
            createdAt: '2026-10-27T10:00:00.000Z',
            updatedAt: '2026-10-27T10:00:00.000Z',
          },
        ],
      });

      const file = makeFile(fileContent);
      const res = await importTasksFromJsonFile(file, []);

      expect(res.success).toBe(true);
      expect(res.importedCount).toBe(2);
      expect(res.collisionCount).toBe(1);
      expect(res.mergedTasks).toHaveLength(2);

      const [first, second] = res.mergedTasks;
      expect(first.title).toBe('First instance');
      expect(second.title).toBe('Second instance');
      expect(first.id).not.toBe(second.id);
    });

    it('leaves existing data untouched when import validation fails', async () => {
      const invalidContent = JSON.stringify({
        schemaVersion: 1,
        tasks: [{ id: 'corrupt', title: '' }], // Invalid empty title
      });

      const file = makeFile(invalidContent);
      const res = await importTasksFromJsonFile(file, [existingTask]);

      expect(res.success).toBe(false);
      expect(res.importedCount).toBe(0);
      expect(res.mergedTasks).toHaveLength(1);
      expect(res.mergedTasks[0]).toEqual(existingTask);
      expect(res.error).toBeDefined();
    });
  });
});
