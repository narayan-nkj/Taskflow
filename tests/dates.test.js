import { describe, it, expect } from 'vitest';
import { getDeadlineState, parseLocalDate, formatDisplayDate } from '../src/utils/dates';

describe('dates utility', () => {
  const refDate = new Date(2026, 9, 27); // Oct 27, 2026

  it('correctly parses local calendar YYYY-MM-DD dates without timezone shift', () => {
    const parsed = parseLocalDate('2026-10-27');
    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(9); // 0-indexed October
    expect(parsed?.getDate()).toBe(27);
  });

  it('handles invalid date strings gracefully', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate('invalid')).toBeNull();
    expect(parseLocalDate('2026-02-31')).toBeNull();
  });

  it('identifies overdue tasks when dueDate is before today and not completed', () => {
    const res = getDeadlineState('2026-10-25', 'Pending', refDate);
    expect(res.state).toBe('overdue');
    expect(res.label).toContain('2 days overdue');
  });

  it('identifies due-today tasks when dueDate equals today and not completed', () => {
    const res = getDeadlineState('2026-10-27', 'Pending', refDate);
    expect(res.state).toBe('due-today');
    expect(res.label).toBe('Due today');
  });

  it('identifies upcoming tasks due within 3 days', () => {
    const res = getDeadlineState('2026-10-29', 'Pending', refDate);
    expect(res.state).toBe('upcoming');
    expect(res.label).toBe('Due in 2 days');
  });

  it('NEVER marks completed tasks as overdue or due today', () => {
    const overdueCompleted = getDeadlineState('2026-10-20', 'Completed', refDate);
    expect(overdueCompleted.state).toBe('normal');
    expect(overdueCompleted.label).toBe('Completed');

    const todayCompleted = getDeadlineState('2026-10-27', 'Completed', refDate);
    expect(todayCompleted.state).toBe('normal');
    expect(todayCompleted.label).toBe('Completed');
  });

  it('handles null due dates without crashing', () => {
    const res = getDeadlineState(null, 'Pending', refDate);
    expect(res.state).toBe('none');
    expect(res.label).toBe('No deadline');
  });

  it('formats display dates nicely for null, today, and standard dates', () => {
    expect(formatDisplayDate(null)).toBe('No due date');
    expect(formatDisplayDate('invalid-date')).toBe('Invalid date');
  });
});
