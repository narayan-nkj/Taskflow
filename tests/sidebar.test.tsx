import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../src/components/navigation/Sidebar';

describe('Sidebar navigation rail component', () => {
  const defaultProps = {
    currentTab: 'tasks' as const,
    onSelectTab: vi.fn(),
    onAddTask: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    isDark: false,
    onToggleTheme: vi.fn(),
    userTasksCount: 0,
  };

  it('does not display a numeric badge when user task count is 0', () => {
    render(<Sidebar {...defaultProps} userTasksCount={0} />);

    const dashboardBtn = screen.getByRole('button', {
      name: /my tasks dashboard, 0 tasks/i,
    });
    expect(dashboardBtn).toBeInTheDocument();
    // Badge span with aria-hidden="true" containing numbers should not exist
    expect(dashboardBtn.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  it('displays count badge "1" and singular accessible label for 1 task', () => {
    render(<Sidebar {...defaultProps} userTasksCount={1} />);

    const dashboardBtn = screen.getByRole('button', {
      name: /my tasks dashboard, 1 task/i,
    });
    expect(dashboardBtn).toBeInTheDocument();

    const badge = dashboardBtn.querySelector('span[aria-hidden="true"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe('1');
  });

  it('displays capped badge "99+" for large counts while retaining full count in accessible label', () => {
    render(<Sidebar {...defaultProps} userTasksCount={125} />);

    const dashboardBtn = screen.getByRole('button', {
      name: /my tasks dashboard, 125 tasks/i,
    });
    expect(dashboardBtn).toBeInTheDocument();

    const badge = dashboardBtn.querySelector('span[aria-hidden="true"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe('99+');
  });

  it('correctly sets aria-current="page" on the active navigation item', () => {
    const { rerender } = render(<Sidebar {...defaultProps} currentTab="tasks" />);

    const tasksBtn = screen.getByRole('button', { name: /my tasks dashboard/i });
    expect(tasksBtn).toHaveAttribute('aria-current', 'page');

    const samplesBtn = screen.getByRole('button', { name: /sample tasks/i });
    expect(samplesBtn).not.toHaveAttribute('aria-current');

    rerender(<Sidebar {...defaultProps} currentTab="samples" />);
    expect(tasksBtn).not.toHaveAttribute('aria-current');
    expect(samplesBtn).toHaveAttribute('aria-current', 'page');
  });

  it('calls onSelectTab when navigation tab buttons are clicked', () => {
    const onSelectTab = vi.fn();
    render(<Sidebar {...defaultProps} onSelectTab={onSelectTab} />);

    const samplesBtn = screen.getByRole('button', { name: /sample tasks/i });
    fireEvent.click(samplesBtn);
    expect(onSelectTab).toHaveBeenCalledWith('samples');
  });

  it('triggers quick actions: add task, export, import, and theme toggle', () => {
    const onAddTask = vi.fn();
    const onExport = vi.fn();
    const onImport = vi.fn();
    const onToggleTheme = vi.fn();

    render(
      <Sidebar
        {...defaultProps}
        onAddTask={onAddTask}
        onExport={onExport}
        onImport={onImport}
        onToggleTheme={onToggleTheme}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^add new task$/i }));
    expect(onAddTask).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /export.*json/i }));
    expect(onExport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /import.*json/i }));
    expect(onImport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
