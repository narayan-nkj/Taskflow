import { describe, it, expect } from 'vitest';
import { calculateStatistics } from '../src/utils/statistics';

describe('calculateStatistics', () => {
  it('handles zero tasks without NaN or division by zero', () => {
    const stats = calculateStatistics([]);
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.inProgress).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.completionRateFormatted).toBe('0%');
  });

  it('keeps Pending strictly separate from In Progress', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        priority: 'High',
        category: 'GDG',
        dueDate: '2026-10-30',
        status: 'Pending',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Task 2',
        priority: 'Medium',
        category: 'Academics',
        dueDate: null,
        status: 'In Progress',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
      {
        id: '3',
        title: 'Task 3',
        priority: 'Low',
        category: 'Personal',
        dueDate: null,
        status: 'Completed',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
    ];

    const stats = calculateStatistics(mockTasks);
    expect(stats.total).toBe(3);
    expect(stats.pending).toBe(1); // Only Task 1
    expect(stats.inProgress).toBe(1); // Task 2
    expect(stats.completed).toBe(1); // Task 3
    expect(stats.completionRate).toBe(33);
    expect(stats.completionRateFormatted).toBe('33%');
  });

  it('calculates 100% completion rate when all tasks are finished', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Done 1',
        priority: 'Low',
        category: 'GDG',
        dueDate: null,
        status: 'Completed',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Done 2',
        priority: 'High',
        category: 'Personal',
        dueDate: null,
        status: 'Completed',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
    ];

    const stats = calculateStatistics(mockTasks);
    expect(stats.completionRate).toBe(100);
    expect(stats.completionRateFormatted).toBe('100%');
  });
});
