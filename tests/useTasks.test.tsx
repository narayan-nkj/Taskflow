import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../src/hooks/useTasks';
import { UserTask } from '../src/types/task';

describe('useTasks hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const sampleTask: UserTask = {
    id: 'task-1',
    title: 'Complete GDG Project',
    priority: 'High',
    category: 'GDG',
    dueDate: '2026-10-30',
    status: 'Pending',
    createdAt: '2026-10-27T10:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
  };

  it('adds a new task with trimmed title and generated ID', () => {
    const { result } = renderHook(() => useTasks());

    let added: UserTask;
    act(() => {
      added = result.current.addTask({
        title: '  Submit Assignment  ',
        priority: 'Medium',
        category: 'Academics',
        dueDate: null,
      });
    });

    expect(added!.title).toBe('Submit Assignment');
    expect(added!.id).toBeDefined();
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Submit Assignment');
  });

  it('updates an existing task and returns true', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setAllTasks([sampleTask]);
    });

    let success: boolean;
    act(() => {
      success = result.current.updateTask('task-1', {
        title: 'Updated GDG Project',
        priority: 'Low',
      });
    });

    expect(success!).toBe(true);
    expect(result.current.tasks[0].title).toBe('Updated GDG Project');
    expect(result.current.tasks[0].priority).toBe('Low');
  });

  it('returns false when updating an unknown task ID', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setAllTasks([sampleTask]);
    });

    let success: boolean;
    act(() => {
      success = result.current.updateTask('non-existent-id', {
        title: 'Should not update',
      });
    });

    expect(success!).toBe(false);
    expect(result.current.tasks[0].title).toBe('Complete GDG Project');
  });

  it('deletes a known task and returns the exact deleted task', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setAllTasks([sampleTask]);
    });

    let deleted: UserTask | null;
    act(() => {
      deleted = result.current.deleteTask('task-1');
    });

    expect(deleted).not.toBeNull();
    expect(deleted?.id).toBe('task-1');
    expect(deleted?.title).toBe('Complete GDG Project');
    expect(result.current.tasks).toHaveLength(0);
  });

  it('returns null and leaves tasks unchanged when deleting an unknown task ID', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setAllTasks([sampleTask]);
    });

    let deleted: UserTask | null;
    act(() => {
      deleted = result.current.deleteTask('unknown-task-id');
    });

    expect(deleted).toBeNull();
    expect(result.current.tasks).toHaveLength(1);
  });

  it('restores a deleted task on undo and does not duplicate IDs if already present', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setAllTasks([sampleTask]);
    });

    let deleted: UserTask | null = null;
    act(() => {
      deleted = result.current.deleteTask('task-1');
    });
    expect(result.current.tasks).toHaveLength(0);

    // Undo / restore
    act(() => {
      result.current.restoreTask(deleted!);
    });
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('task-1');

    // Attempt restoring again: should be idempotent and not create duplicate IDs
    act(() => {
      result.current.restoreTask(deleted!);
    });
    expect(result.current.tasks).toHaveLength(1);
  });

  it('clears completed tasks with accurate non-duplicated counts and preserves incomplete tasks', () => {
    const { result } = renderHook(() => useTasks());

    const t1: UserTask = { ...sampleTask, id: '1', status: 'Completed' };
    const t2: UserTask = { ...sampleTask, id: '2', status: 'Pending' };
    const t3: UserTask = { ...sampleTask, id: '3', status: 'Completed' };
    const t4: UserTask = { ...sampleTask, id: '4', status: 'In Progress' };

    act(() => {
      result.current.setAllTasks([t1, t2, t3, t4]);
    });

    let removedCount = 0;
    act(() => {
      removedCount = result.current.clearCompletedTasks();
    });

    expect(removedCount).toBe(2);
    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.map((t) => t.id)).toEqual(['2', '4']);

    // Clearing again when 0 completed tasks remain returns 0
    let secondCount = 0;
    act(() => {
      secondCount = result.current.clearCompletedTasks();
    });
    expect(secondCount).toBe(0);
    expect(result.current.tasks).toHaveLength(2);
  });

  it('operates deterministically under React.StrictMode', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: ({ children }) => <React.StrictMode>{children}</React.StrictMode>,
    });

    const completed: UserTask = { ...sampleTask, id: 'c1', status: 'Completed' };
    const pending: UserTask = { ...sampleTask, id: 'p1', status: 'Pending' };

    act(() => {
      result.current.setAllTasks([completed, pending]);
    });

    // Clear completed in StrictMode
    let count = 0;
    act(() => {
      count = result.current.clearCompletedTasks();
    });

    // Count must be exactly 1, not doubled by StrictMode double-invocations
    expect(count).toBe(1);
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('p1');

    // Delete in StrictMode
    let deleted: UserTask | null = null;
    act(() => {
      deleted = result.current.deleteTask('p1');
    });

    expect(deleted?.id).toBe('p1');
    expect(result.current.tasks).toHaveLength(0);
  });
});
