import { describe, it, expect } from 'vitest';
import { filterTasks, DEFAULT_FILTERS } from '../src/utils/filtering';
import { UserTask, TaskFiltersState } from '../src/types/task';

describe('filterTasks utility', () => {
  const sampleTasks: UserTask[] = [
    {
      id: '1',
      title: 'Build GDG Website',
      priority: 'High',
      category: 'GDG',
      dueDate: '2026-10-28',
      status: 'Pending',
      createdAt: '2026-10-27T01:00:00Z',
      updatedAt: '2026-10-27T01:00:00Z',
    },
    {
      id: '2',
      title: 'Submit Math Assignment',
      priority: 'Medium',
      category: 'Academics',
      dueDate: '2026-10-29',
      status: 'In Progress',
      createdAt: '2026-10-27T02:00:00Z',
      updatedAt: '2026-10-27T02:00:00Z',
    },
    {
      id: '3',
      title: 'Buy Groceries',
      priority: 'Low',
      category: 'Personal',
      dueDate: null,
      status: 'Completed',
      createdAt: '2026-10-27T03:00:00Z',
      updatedAt: '2026-10-27T03:00:00Z',
    },
  ];

  it('filters by case-insensitive trimmed search query', () => {
    const filters: TaskFiltersState = { ...DEFAULT_FILTERS, search: '  gdg  ' };
    const res = filterTasks(sampleTasks, filters);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('1');
  });

  it('filters by category', () => {
    const filters: TaskFiltersState = { ...DEFAULT_FILTERS, category: 'Academics' };
    const res = filterTasks(sampleTasks, filters);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('2');
  });

  it('filters by priority', () => {
    const filters: TaskFiltersState = { ...DEFAULT_FILTERS, priority: 'High' };
    const res = filterTasks(sampleTasks, filters);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('1');
  });

  it('filters by status', () => {
    const filters: TaskFiltersState = { ...DEFAULT_FILTERS, status: 'Completed' };
    const res = filterTasks(sampleTasks, filters);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('3');
  });

  it('composes multiple filters together over the same collection', () => {
    const filters: TaskFiltersState = {
      ...DEFAULT_FILTERS,
      category: 'GDG',
      priority: 'High',
      status: 'Pending',
    };
    const res = filterTasks(sampleTasks, filters);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('1');

    const mismatch: TaskFiltersState = {
      ...DEFAULT_FILTERS,
      category: 'GDG',
      priority: 'Low',
    };
    expect(filterTasks(sampleTasks, mismatch)).toHaveLength(0);
  });
});
