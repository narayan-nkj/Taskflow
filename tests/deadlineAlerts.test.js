import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeadlineAlerts } from '../src/hooks/useDeadlineAlerts';
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
    const tasks = [
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
    const tasks = [
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
    const tasks = [
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

  it('triggers proactive in-app toast for new active alerts and delivers action', () => {
    const onNotifyToast = vi.fn();
    const onSelectTask = vi.fn();

    const tasks = [
      {
        id: 't-due',
        title: 'Urgent Project',
        category: 'GDG',
        priority: 'High',
        dueDate: todayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    renderHook(() =>
      useDeadlineAlerts(tasks, {
        onNotifyToast,
        onSelectTask,
      })
    );

    expect(onNotifyToast).toHaveBeenCalledTimes(1);
    expect(onNotifyToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'info',
        message: '"Urgent Project" is due today',
        action: expect.objectContaining({
          label: 'View task',
        }),
      })
    );

    // Click toast action
    const toastCall = onNotifyToast.mock.calls[0][0];
    toastCall.action?.onClick();
    expect(onSelectTask).toHaveBeenCalledWith('t-due');
  });

  it('suppresses duplicate notifications across rerenders and reloads', () => {
    const onNotifyToast = vi.fn();

    const tasks = [
      {
        id: 't-dup',
        title: 'Project Alpha',
        category: 'GDG',
        priority: 'High',
        dueDate: todayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    const { rerender } = renderHook(
      ({ taskList }) =>
        useDeadlineAlerts(taskList, {
          onNotifyToast,
        }),
      { initialProps: { taskList: tasks } }
    );

    expect(onNotifyToast).toHaveBeenCalledTimes(1);

    // Rerender with identical tasks: must NOT fire duplicate toast
    rerender({ taskList: [...tasks] });
    expect(onNotifyToast).toHaveBeenCalledTimes(1);

    // Simulate page reload by mounting a new hook instance: stored deduplication key suppresses popup
    const secondHookNotify = vi.fn();
    renderHook(() =>
      useDeadlineAlerts(tasks, {
        onNotifyToast: secondHookNotify,
      })
    );
    expect(secondHookNotify).not.toHaveBeenCalled();
  });

  it('triggers a fresh notification when due date or urgency changes', () => {
    const onNotifyToast = vi.fn();

    const initialTasks = [
      {
        id: 't-datechange',
        title: 'Flexible Task',
        category: 'Personal',
        priority: 'Medium',
        dueDate: tomorrowYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    const { rerender } = renderHook(
      ({ taskList }) =>
        useDeadlineAlerts(taskList, {
          onNotifyToast,
        }),
      { initialProps: { taskList: initialTasks } }
    );

    expect(onNotifyToast).toHaveBeenCalledTimes(1);
    expect(onNotifyToast.mock.calls[0][0].message).toContain('due soon');

    // Change due date to yesterday (escalates to overdue!)
    const updatedTasks = [
      {
        ...initialTasks[0],
        dueDate: yesterdayYmd,
      },
    ];

    rerender({ taskList: updatedTasks });
    expect(onNotifyToast).toHaveBeenCalledTimes(2);
    expect(onNotifyToast.mock.calls[1][0].type).toBe('error');
    expect(onNotifyToast.mock.calls[1][0].message).toContain('overdue');
  });

  it('coalesces multiple alerts into a concise summary at startup', () => {
    const onNotifyToast = vi.fn();

    const multipleTasks = [
      {
        id: 't-overdue',
        title: 'Crucial Assignment',
        category: 'Academics',
        priority: 'High',
        dueDate: yesterdayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 't-today',
        title: 'Lab Report',
        category: 'Academics',
        priority: 'Medium',
        dueDate: todayYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 't-soon',
        title: 'GDG Event Slides',
        category: 'GDG',
        priority: 'Low',
        dueDate: tomorrowYmd,
        status: 'Pending',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
    ];

    renderHook(() =>
      useDeadlineAlerts(multipleTasks, {
        onNotifyToast,
      })
    );

    // Coalescing: exactly 1 toast shown with most urgent alert + count of additional alerts
    expect(onNotifyToast).toHaveBeenCalledTimes(1);
    const toastMsg = onNotifyToast.mock.calls[0][0].message;
    expect(toastMsg).toContain('Crucial Assignment');
    expect(toastMsg).toContain('+2 more deadlines');
  });

  it('requests notification permission only after explicit user gesture', async () => {
    const requestPermissionMock = vi.fn().mockResolvedValue('granted');
    const originalNotification = window.Notification;

    // Mock Notification API
    window.Notification = {
      permission: 'default',
      requestPermission: requestPermissionMock,
    };

    const { result } = renderHook(() => useDeadlineAlerts([]));

    // Must NOT prompt on load
    expect(requestPermissionMock).not.toHaveBeenCalled();
    expect(result.current.browserPermission).toBe('default');

    // Prompt only upon explicit invocation
    await act(async () => {
      await result.current.requestBrowserPermission();
    });

    expect(requestPermissionMock).toHaveBeenCalledTimes(1);
    expect(result.current.browserPermission).toBe('granted');

    window.Notification = originalNotification;
  });

  it('handles unsupported or denied permission states gracefully without throwing', async () => {
    const originalNotification = window.Notification;

    // Simulate unsupported environment
    delete window.Notification;

    const { result } = renderHook(() => useDeadlineAlerts([]));
    expect(result.current.browserPermission).toBe('unsupported');

    let permissionResult = true;
    await act(async () => {
      permissionResult = await result.current.requestBrowserPermission();
    });
    expect(permissionResult).toBe(false);

    window.Notification = originalNotification;
  });

  it('tolerates corrupt or unavailable storage without runtime errors', () => {
    localStorage.setItem('taskflow_notified_alerts_v1', 'corrupt-json{{{');
    localStorage.setItem('taskflow_dismissed_alerts_v1', 'corrupt-json{{{');

    expect(() => {
      renderHook(() => useDeadlineAlerts([]));
    }).not.toThrow();
  });
});
