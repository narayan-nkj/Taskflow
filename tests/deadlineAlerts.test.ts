import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeadlineAlerts } from '../src/hooks/useDeadlineAlerts';
import { UserTask } from '../src/types/task';
import { formatLocalYmd } from '../src/utils/dates';

describe('useDeadlineAlerts hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const today = new Date();
  const todayYmd = formatLocalYmd(today);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayYmd = formatLocalYmd(yesterday);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowYmd = formatLocalYmd(tomorrow);

  const future = new Date(today);
  future.setDate(today.getDate() + 10);
  const futureYmd = formatLocalYmd(future);

  it('correctly identifies overdue and due-today alerts for incomplete tasks', () => {
    const tasks: UserTask[] = [
      {
        id: 't1',
        title: 'Overdue Assignment',
        category: 'Academics',
        priority: 'High',
        dueDate: yesterdayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 't2',
        title: 'Submit Lab Report',
        category: 'Academics',
        priority: 'Medium',
        dueDate: todayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 't3',
        title: 'Tomorrow Prep',
        category: 'Personal',
        priority: 'Low',
        dueDate: tomorrowYmd,
        status: 'In Progress',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 't4',
        title: 'Completed Task in Past',
        category: 'Personal',
        priority: 'Low',
        dueDate: yesterdayYmd,
        status: 'Completed', // completed tasks must be excluded
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 't5',
        title: 'Undated task',
        category: 'Personal',
        priority: 'Low',
        dueDate: null, // undated tasks must be excluded
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 't6',
        title: 'Distant Future task',
        category: 'Work',
        priority: 'Low',
        dueDate: futureYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    const { result } = renderHook(() => useDeadlineAlerts(tasks));

    expect(result.current.alerts).toHaveLength(3);
    expect(result.current.alerts[0].taskId).toBe('t1');
    expect(result.current.alerts[0].urgency).toBe('overdue');

    expect(result.current.alerts[1].taskId).toBe('t2');
    expect(result.current.alerts[1].urgency).toBe('due-today');

    expect(result.current.alerts[2].taskId).toBe('t3');
    expect(result.current.alerts[2].urgency).toBe('due-soon');

    // Unseen count should be 3 initially
    expect(result.current.unseenCount).toBe(3);
  });

  it('marks all alerts as seen without dismissing them', () => {
    const tasks: UserTask[] = [
      {
        id: 't1',
        title: 'Due today',
        category: 'Personal',
        priority: 'High',
        dueDate: todayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    const { result } = renderHook(() => useDeadlineAlerts(tasks));
    expect(result.current.unseenCount).toBe(1);

    act(() => {
      result.current.markAllSeen();
    });

    expect(result.current.unseenCount).toBe(0);
    expect(result.current.alerts).toHaveLength(1);
  });

  it('dismisses a single alert without modifying the task', () => {
    const tasks: UserTask[] = [
      {
        id: 't1',
        title: 'Due today',
        category: 'Personal',
        priority: 'High',
        dueDate: todayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    const { result } = renderHook(() => useDeadlineAlerts(tasks));
    expect(result.current.alerts).toHaveLength(1);

    const alertId = result.current.alerts[0].id;
    act(() => {
      result.current.dismissAlert(alertId);
    });

    expect(result.current.alerts).toHaveLength(0);
  });
});
