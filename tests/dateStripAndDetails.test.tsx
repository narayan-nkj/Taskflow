import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateStrip } from '../src/components/dashboard/DateStrip';
import { TaskDetailPanel } from '../src/components/dashboard/TaskDetailPanel';
import { UserTask } from '../src/types/task';
import { formatLocalYmd } from '../src/utils/dates';

describe('DateStrip interactive calendar component', () => {
  const mockTasks: UserTask[] = [
    {
      id: 'task-1',
      title: 'Review PRs',
      priority: 'High',
      category: 'GDG',
      dueDate: formatLocalYmd(new Date()),
      status: 'In Progress',
      createdAt: '2026-10-25T10:00:00.000Z',
      updatedAt: '2026-10-25T10:00:00.000Z',
    },
  ];

  it('renders 7 days and allows selecting a date', () => {
    const handleSelectDate = vi.fn();
    const todayYmd = formatLocalYmd(new Date());

    render(
      <DateStrip
        selectedDate={todayYmd}
        onSelectDate={handleSelectDate}
        tasks={mockTasks}
      />
    );

    // Should render 7 date buttons with aria-pressed
    const dayButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-pressed') !== null
    );
    expect(dayButtons.length).toBe(7);

    // The selected day should have aria-pressed="true"
    const selectedBtn = dayButtons.find((btn) => btn.getAttribute('aria-pressed') === 'true');
    expect(selectedBtn).toBeDefined();

    // Clear filter button should be present when a date is selected
    const clearBtn = screen.getByRole('button', { name: /clear date filter/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(handleSelectDate).toHaveBeenCalledWith(null);
  });

  it('supports previous and next week pagination and today shortcut', () => {
    const handleSelectDate = vi.fn();
    render(
      <DateStrip
        selectedDate={null}
        onSelectDate={handleSelectDate}
        tasks={[]}
      />
    );

    const prevWeekBtn = screen.getByRole('button', { name: /previous week/i });
    const nextWeekBtn = screen.getByRole('button', { name: /next week/i });
    expect(prevWeekBtn).toBeInTheDocument();
    expect(nextWeekBtn).toBeInTheDocument();

    fireEvent.click(nextWeekBtn);
    fireEvent.click(prevWeekBtn);

    const todayBtn = screen.getByRole('button', { name: /^today$/i });
    fireEvent.click(todayBtn);
    expect(handleSelectDate).toHaveBeenCalled();
  });
});

describe('TaskDetailPanel component', () => {
  const mockTask: UserTask = {
    id: 'task-1',
    title: 'Complete GDG Assignment',
    priority: 'High',
    category: 'GDG',
    dueDate: '2026-10-27',
    status: 'In Progress',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-25T10:00:00.000Z',
  };

  it('renders empty fallback when no task is selected', () => {
    const handleAddTask = vi.fn();
    render(
      <TaskDetailPanel
        task={null}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAddNewTask={handleAddTask}
        advice="Keep going!"
        isAdviceLoading={false}
        adviceError={null}
        onRefreshAdvice={vi.fn()}
      />
    );

    expect(screen.getByText('No Task Selected')).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: /create new task/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(handleAddTask).toHaveBeenCalledTimes(1);
  });

  it('renders task details, actions, and responds to click events', () => {
    const handleToggle = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    const handleRefreshAdvice = vi.fn();

    render(
      <TaskDetailPanel
        task={mockTask}
        onToggleStatus={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNewTask={vi.fn()}
        advice="Practice makes progress."
        isAdviceLoading={false}
        adviceError={null}
        onRefreshAdvice={handleRefreshAdvice}
      />
    );

    // Title and badges
    expect(screen.getByRole('heading', { level: 2, name: 'Complete GDG Assignment' })).toBeInTheDocument();
    expect(screen.getByLabelText('Priority: High')).toBeInTheDocument();
    expect(screen.getByLabelText('Category: GDG')).toBeInTheDocument();

    // Action buttons
    const markCompleteBtn = screen.getByRole('button', { name: /mark completed/i });
    expect(markCompleteBtn).toBeInTheDocument();
    fireEvent.click(markCompleteBtn);
    expect(handleToggle).toHaveBeenCalledWith('task-1');

    const editBtn = screen.getByRole('button', { name: /edit task details/i });
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockTask);

    const deleteBtn = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(mockTask);
  });
});
