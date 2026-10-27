import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../src/hooks/useTasks';
import { getSubtaskProgress, validateSubtaskTitle } from '../src/utils/subtasks';
import { isValidSubtask, isValidUserTask, validateImportJson } from '../src/utils/validation';
import { calculateStatistics } from '../src/utils/statistics';
import { loadUserTasksFromStorage, USER_TASKS_STORAGE_KEY } from '../src/utils/storage';
import { exportTasksAsJson, importTasksFromJsonFile } from '../src/services/importExport';
import { TaskChecklist } from '../src/components/dashboard/TaskChecklist';
import { TaskItem } from '../src/components/dashboard/TaskItem';

describe('TaskFlow Subtasks / Checklists Feature', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const baseTask = {
    id: 'parent-task-1',
    title: 'Parent Task Title',
    priority: 'High',
    category: 'GDG',
    dueDate: '2026-10-30',
    status: 'Pending',
    createdAt: '2026-10-27T10:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
    subtasks: [],
  };

  describe('1. Subtask utility & title validation', () => {
    it('accepts valid trimmed titles up to 120 characters', () => {
      const validRes = validateSubtaskTitle('  Read documentation  ');
      expect(validRes.isValid).toBe(true);
      expect(validRes.trimmed).toBe('Read documentation');

      const maxRes = validateSubtaskTitle('A'.repeat(120));
      expect(maxRes.isValid).toBe(true);
      expect(maxRes.trimmed).toHaveLength(120);
    });

    it('rejects blank and whitespace-only titles', () => {
      expect(validateSubtaskTitle('').isValid).toBe(false);
      expect(validateSubtaskTitle('   ').isValid).toBe(false);
      expect(validateSubtaskTitle('   ').error).toBe('Subtask title cannot be blank.');
    });

    it('rejects titles exceeding 120 characters', () => {
      const overLimitRes = validateSubtaskTitle('A'.repeat(121));
      expect(overLimitRes.isValid).toBe(false);
      expect(overLimitRes.error).toBe('Subtask title must be 120 characters or fewer.');
    });
  });

  describe('2. Subtask progress calculations', () => {
    it('calculates progress for zero subtasks cleanly', () => {
      const p = getSubtaskProgress([]);
      expect(p.total).toBe(0);
      expect(p.completed).toBe(0);
      expect(p.percentage).toBe(0);
      expect(p.isAllCompleted).toBe(false);
      expect(p.summaryLabel).toBe('0 of 0 complete');
    });

    it('calculates progress for partial completion', () => {
      const subtasks = [
        { id: 's1', title: 'Task 1', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        { id: 's2', title: 'Task 2', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        { id: 's3', title: 'Task 3', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        { id: 's4', title: 'Task 4', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
      ];
      const p = getSubtaskProgress(subtasks);
      expect(p.total).toBe(4);
      expect(p.completed).toBe(2);
      expect(p.percentage).toBe(50);
      expect(p.isAllCompleted).toBe(false);
      expect(p.summaryLabel).toBe('2 of 4 complete');
    });

    it('calculates progress for all completed subtasks', () => {
      const subtasks = [
        { id: 's1', title: 'Task 1', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        { id: 's2', title: 'Task 2', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
      ];
      const p = getSubtaskProgress(subtasks);
      expect(p.total).toBe(2);
      expect(p.completed).toBe(2);
      expect(p.percentage).toBe(100);
      expect(p.isAllCompleted).toBe(true);
      expect(p.summaryLabel).toBe('2 of 2 complete');
    });
  });

  describe('3. Validation schema & subtask payload checks', () => {
    it('validates a correct subtask record', () => {
      const validSub = {
        id: 'sub-1',
        title: 'Step 1',
        completed: false,
        createdAt: '2026-10-27T10:00:00.000Z',
        updatedAt: '2026-10-27T10:00:00.000Z',
      };
      expect(isValidSubtask(validSub)).toBe(true);
    });

    it('rejects subtask with blank title, missing ID, or non-boolean completed', () => {
      expect(isValidSubtask({ id: 's1', title: '   ', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' })).toBe(false);
      expect(isValidSubtask({ id: '', title: 'Valid', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' })).toBe(false);
      expect(isValidSubtask({ id: 's1', title: 'Valid', completed: 'yes', createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' })).toBe(false);
    });

    it('rejects parent task with duplicate subtask IDs within the parent', () => {
      const taskWithDupSubtasks = {
        ...baseTask,
        subtasks: [
          { id: 'duplicate-sub-id', title: 'First sub', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
          { id: 'duplicate-sub-id', title: 'Second sub', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        ],
      };
      expect(isValidUserTask(taskWithDupSubtasks)).toBe(false);
    });

    it('accepts legacy tasks with missing subtasks field', () => {
      const legacyTask = {
        id: 'legacy-1',
        title: 'Legacy task without subtasks key',
        priority: 'Medium',
        category: 'Personal',
        dueDate: null,
        status: 'Pending',
        createdAt: '2026-10-27T10:00:00.000Z',
        updatedAt: '2026-10-27T10:00:00.000Z',
      };
      expect(isValidUserTask(legacyTask)).toBe(true);
    });
  });

  describe('4. useTasks Hook: CRUD operations and parent status independence', () => {
    it('adds, toggles, updates, and deletes subtasks cleanly', () => {
      const { result } = renderHook(() => useTasks());

      let createdTask;
      act(() => {
        createdTask = result.current.addTask({
          title: 'Main parent project',
          priority: 'High',
          category: 'Academics',
          dueDate: '2026-11-05',
        });
      });

      expect(createdTask.subtasks).toEqual([]);

      // 1. Add Subtask
      let sub1 = null;
      act(() => {
        sub1 = result.current.addSubtask(createdTask.id, 'Draft outline');
      });

      expect(sub1).not.toBeNull();
      expect(sub1?.title).toBe('Draft outline');
      expect(sub1?.completed).toBe(false);

      let currentTask = result.current.tasks.find((t) => t.id === createdTask.id);
      expect(currentTask?.subtasks).toHaveLength(1);

      // 2. Toggle Subtask completion
      act(() => {
        result.current.toggleSubtask(createdTask.id, sub1.id);
      });

      currentTask = result.current.tasks.find((t) => t.id === createdTask.id);
      expect(currentTask?.subtasks?.[0].completed).toBe(true);

      // Crucial rule: Parent task status MUST remain 'Pending', not changed to 'Completed'
      expect(currentTask?.status).toBe('Pending');

      // 3. Update Subtask title
      act(() => {
        result.current.updateSubtask(createdTask.id, sub1.id, 'Finalize outline');
      });

      currentTask = result.current.tasks.find((t) => t.id === createdTask.id);
      expect(currentTask?.subtasks?.[0].title).toBe('Finalize outline');

      // 4. Delete Subtask
      act(() => {
        result.current.deleteSubtask(createdTask.id, sub1.id);
      });

      currentTask = result.current.tasks.find((t) => t.id === createdTask.id);
      expect(currentTask?.subtasks).toHaveLength(0);
    });

    it('keeps parent status and subtask completion completely independent', () => {
      const { result } = renderHook(() => useTasks());

      let task;
      act(() => {
        task = result.current.addTask({
          title: 'Parent with multiple subtasks',
          priority: 'Medium',
          category: 'GDG',
          dueDate: null,
        });
      });

      let sub1 = null;
      let sub2 = null;
      act(() => {
        sub1 = result.current.addSubtask(task.id, 'Subtask 1');
        sub2 = result.current.addSubtask(task.id, 'Subtask 2');
      });

      // Complete all subtasks
      act(() => {
        result.current.toggleSubtask(task.id, sub1.id);
        result.current.toggleSubtask(task.id, sub2.id);
      });

      let parent = result.current.tasks.find((t) => t.id === task.id);
      expect(parent?.subtasks?.every((s) => s.completed)).toBe(true);
      // Parent MUST NOT automatically become Completed
      expect(parent?.status).toBe('Pending');

      // Manually mark parent Completed
      act(() => {
        result.current.toggleTaskStatus(task.id);
      });

      parent = result.current.tasks.find((t) => t.id === task.id);
      expect(parent?.status).toBe('Completed');
      // Subtasks MUST NOT be discarded or reset
      expect(parent?.subtasks).toHaveLength(2);
      expect(parent?.subtasks?.[0].completed).toBe(true);
      expect(parent?.subtasks?.[1].completed).toBe(true);

      // Reopen parent task
      act(() => {
        result.current.toggleTaskStatus(task.id);
      });

      parent = result.current.tasks.find((t) => t.id === task.id);
      expect(parent?.status).toBe('Pending');
      // Subtasks MUST remain completed
      expect(parent?.subtasks?.[0].completed).toBe(true);
      expect(parent?.subtasks?.[1].completed).toBe(true);
    });

    it('preserves checklist when deleting and undoing (restoring) a parent task', () => {
      const { result } = renderHook(() => useTasks());

      let task;
      act(() => {
        task = result.current.addTask({
          title: 'Task with checklist to delete and restore',
          priority: 'Low',
          category: 'Personal',
          dueDate: null,
        });
      });

      act(() => {
        result.current.addSubtask(task.id, 'Checklist item A');
        result.current.addSubtask(task.id, 'Checklist item B');
      });

      // Delete parent task
      let removed = null;
      act(() => {
        removed = result.current.deleteTask(task.id);
      });

      expect(removed).not.toBeNull();
      expect(removed?.subtasks).toHaveLength(2);
      expect(result.current.tasks.find((t) => t.id === task.id)).toBeUndefined();

      // Undo deletion by restoring
      act(() => {
        result.current.restoreTask(removed);
      });

      const restored = result.current.tasks.find((t) => t.id === task.id);
      expect(restored).toBeDefined();
      expect(restored?.subtasks).toHaveLength(2);
      expect(restored?.subtasks?.[0].title).toBe('Checklist item A');
      expect(restored?.subtasks?.[1].title).toBe('Checklist item B');
    });
  });

  describe('5. Dashboard statistics independence', () => {
    it('does not count subtasks as top-level tasks in statistics calculations', () => {
      const taskWithSubtasks = {
        ...baseTask,
        status: 'Pending',
        subtasks: [
          { id: 's1', title: 'Sub 1', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
          { id: 's2', title: 'Sub 2', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
          { id: 's3', title: 'Sub 3', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        ],
      };

      const stats = calculateStatistics([taskWithSubtasks]);
      // Only 1 parent task
      expect(stats.total).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('6. LocalStorage persistence and legacy migration', () => {
    it('loads legacy stored tasks without subtasks field as empty arrays', () => {
      const legacyRaw = [
        {
          id: 'legacy-task-1',
          title: 'Legacy stored task',
          priority: 'High',
          category: 'Academics',
          dueDate: null,
          status: 'Pending',
          createdAt: '2026-10-27T10:00:00.000Z',
          updatedAt: '2026-10-27T10:00:00.000Z',
          // Note: no subtasks field!
        },
      ];

      localStorage.setItem(USER_TASKS_STORAGE_KEY, JSON.stringify(legacyRaw));
      const res = loadUserTasksFromStorage();

      expect(res.hadCorruption).toBe(false);
      expect(res.data).toHaveLength(1);
      expect(res.data[0].subtasks).toEqual([]);
    });
  });

  describe('7. Import/Export with subtasks and deduplication', () => {
    it('exports tasks with subtasks intact', () => {
      const taskWithSubtasks = {
        ...baseTask,
        subtasks: [
          { id: 's1', title: 'Subtask 1', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        ],
      };

      expect(exportTasksAsJson([taskWithSubtasks])).toBe(true);
    });

    it('imports backup file with subtasks and normalizes old files without subtasks', async () => {
      const backupJson = JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-10-27T10:00:00.000Z',
        appName: 'TaskFlow',
        tasks: [
          {
            ...baseTask,
            id: 'import-task-1',
            title: 'Task with subtasks',
            subtasks: [
              { id: 'sub-a', title: 'Sub A', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
            ],
          },
          {
            ...baseTask,
            id: 'import-task-2',
            title: 'Old task without subtasks key',
            // No subtasks field!
          },
        ],
      });

      const file = new File([backupJson], 'backup.json', { type: 'application/json' });
      const res = await importTasksFromJsonFile(file, []);

      expect(res.success).toBe(true);
      expect(res.importedCount).toBe(2);
      expect(res.mergedTasks[0].subtasks).toHaveLength(1);
      expect(res.mergedTasks[0].subtasks?.[0].title).toBe('Sub A');
      expect(res.mergedTasks[1].subtasks).toEqual([]);
    });

    it('resolves duplicate subtask IDs within the same parent during import', async () => {
      const backupJson = JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-10-27T10:00:00.000Z',
        appName: 'TaskFlow',
        tasks: [
          {
            ...baseTask,
            id: 'task-unique',
            title: 'Task with colliding subtask IDs',
            subtasks: [
              { id: 'colliding-sub-id', title: 'First sub', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
              { id: 'colliding-sub-id', title: 'Second sub', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
            ],
          },
        ],
      });

      // validateImportJson rejects duplicate subtask IDs per parent if all-or-nothing
      const val = validateImportJson(backupJson);
      expect(val.isValid).toBe(false);
      expect(val.errorMessage).toContain('invalid or has malformed fields');
    });
  });

  describe('8. UI Components: TaskChecklist and TaskItem integration', () => {
    it('renders TaskChecklist with progress, checkboxes, and handles adding a subtask', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      const onUpdate = vi.fn();
      const onDelete = vi.fn();

      const subtasks = [
        { id: 'sub-1', title: 'Study chapter 4', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
      ];

      render(
        <TaskChecklist
          taskId="task-1"
          subtasks={subtasks}
          onAddSubtask={onAdd}
          onToggleSubtask={onToggle}
          onUpdateSubtask={onUpdate}
          onDeleteSubtask={onDelete}
        />
      );

      // Verify progress summary
      expect(screen.getByText('0 of 1 complete')).toBeInTheDocument();
      expect(screen.getByText('Study chapter 4')).toBeInTheDocument();

      // Toggle checkbox
      const toggleBtn = screen.getByRole('button', { name: /mark "study chapter 4" complete/i });
      fireEvent.click(toggleBtn);
      expect(onToggle).toHaveBeenCalledWith('task-1', 'sub-1');

      // Add new subtask
      const input = screen.getByPlaceholderText(/add a checklist item/i);
      fireEvent.change(input, { target: { value: 'Write summary' } });
      const addBtn = screen.getByRole('button', { name: /add subtask/i });
      fireEvent.click(addBtn);

      expect(onAdd).toHaveBeenCalledWith('task-1', 'Write summary');
    });

    it('renders collapsed checklist summary on TaskItem and expands when clicked', () => {
      const taskWithSubtasks = {
        ...baseTask,
        subtasks: [
          { id: 'sub-1', title: 'Item 1', completed: true, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
          { id: 'sub-2', title: 'Item 2', completed: false, createdAt: '2026-10-27T10:00:00.000Z', updatedAt: '2026-10-27T10:00:00.000Z' },
        ],
      };

      render(
        <TaskItem
          task={taskWithSubtasks}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddSubtask={vi.fn()}
          onToggleSubtask={vi.fn()}
          onUpdateSubtask={vi.fn()}
          onDeleteSubtask={vi.fn()}
        />
      );

      // Collapsed count button
      const expandBtn = screen.getByRole('button', { name: /1 of 2 complete/i });
      expect(expandBtn).toBeInTheDocument();
      expect(expandBtn).toHaveAttribute('aria-expanded', 'false');

      // Expand checklist
      fireEvent.click(expandBtn);
      expect(expandBtn).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('does not render subtask strip on TaskItem if task has no subtasks', () => {
      render(
        <TaskItem
          task={baseTask}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.queryByRole('button', { name: /subtask.*complete/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/\d of \d complete/i)).not.toBeInTheDocument();
    });
  });
});
