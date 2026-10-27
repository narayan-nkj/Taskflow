import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopBar } from '../src/components/navigation/TopBar';

describe('TopBar and NotificationCenter', () => {
  const sampleAlerts = [
    {
      id: 'task-1:2026-10-27:due-today',
      taskId: 'task-1',
      taskTitle: 'Math Assignment 4',
      dueDate: '2026-10-27',
      urgency: 'due-today',
      urgencyLabel: 'Due today',
      category: 'Academics',
      priority: 'High',
      isDismissed: false,
    },
  ];

  it('renders personalized greeting for Narayan with Student Dashboard subtitle', () => {
    render(
      <TopBar
        searchQuery=""
        onSearchChange={vi.fn()}
        alerts={[]}
        unseenCount={0}
      />
    );

    expect(screen.getByText('Welcome back, Narayan')).toBeInTheDocument();
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
  });

  it('opens notification popover when bell button is clicked', () => {
    const onSelectTask = vi.fn();
    const onDismissAlert = vi.fn();
    const onMarkAllSeen = vi.fn();

    render(
      <TopBar
        searchQuery=""
        onSearchChange={vi.fn()}
        alerts={sampleAlerts}
        unseenCount={1}
        onSelectTask={onSelectTask}
        onDismissAlert={onDismissAlert}
        onMarkAllSeen={onMarkAllSeen}
      />
    );

    // Bell button should exist
    const bellBtn = screen.getByLabelText(/Deadline notifications/i);
    expect(bellBtn).toBeInTheDocument();

    // Click bell
    fireEvent.click(bellBtn);
    expect(onMarkAllSeen).toHaveBeenCalledTimes(1);

    // Popover content should now be visible
    expect(screen.getByText('Deadline Alerts')).toBeInTheDocument();
    expect(screen.getByText('Math Assignment 4')).toBeInTheDocument();
    expect(screen.getByText('Due today')).toBeInTheDocument();
  });

  it('displays empty state when there are no alerts', () => {
    render(
      <TopBar
        searchQuery=""
        onSearchChange={vi.fn()}
        alerts={[]}
        unseenCount={0}
      />
    );

    const bellBtn = screen.getByLabelText(/Deadline notifications/i);
    fireEvent.click(bellBtn);

    expect(screen.getByText('No upcoming deadline alerts')).toBeInTheDocument();
  });
});
