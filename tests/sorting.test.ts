import { describe, it, expect } from 'vitest';
import { sortTasks } from '../src/utils/sorting';
import { UserTask } from '../src/types/task';

describe('sortTasks utility', () => {
  const sampleTasks: UserTask[] = [
    {
      id: '1',
      title: 'B task',
      priority: 'Low',
      category: 'GDG',
      dueDate: '2026-10-29',
      status: 'Pending',
      createdAt: '2026-10-27T01:00:00Z',
      updatedAt: '2026-10-27T01:00:00Z',
    },
    {
      id: '2',
      title: 'A task',
      priority: 'High',
      category: 'Academics',
      dueDate: '2026-10-28',
      status: 'Pending',
      createdAt: '2026-10-27T02:00:00Z',
      updatedAt: '2026-10-27T02:00:00Z',
    },
    {
      id: '3',
      title: 'C task no date',
      priority: 'Medium',
      category: 'Personal',
      dueDate: null,
      status: 'Pending',
      createdAt: '2026-10-27T03:00:00Z',
      updatedAt: '2026-10-27T03:00:00Z',
    },
  ];

  it('sorts by priority High > Medium > Low', () => {
    const sorted = sortTasks(sampleTasks, 'priority-high-low');
    expect(sorted.map((t) => t.priority)).toEqual(['High', 'Medium', 'Low']);
  });

  it('sorts by dueDate ascending and groups undated tasks last', () => {
    const sorted = sortTasks(sampleTasks, 'dueDate-asc');
    expect(sorted[0].id).toBe('2'); // Oct 28
    expect(sorted[1].id).toBe('1'); // Oct 29
    expect(sorted[2].id).toBe('3'); // null date last
  });

  it('sorts by dueDate descending while still grouping undated tasks last', () => {
    const sorted = sortTasks(sampleTasks, 'dueDate-desc');
    expect(sorted[0].id).toBe('1'); // Oct 29
    expect(sorted[1].id).toBe('2'); // Oct 28
    expect(sorted[2].id).toBe('3'); // null date grouped last
  });

  it('sorts by title alphabetically A to Z', () => {
    const sorted = sortTasks(sampleTasks, 'title-asc');
    expect(sorted.map((t) => t.title)).toEqual(['A task', 'B task', 'C task no date']);
  });
});
