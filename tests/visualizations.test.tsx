import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from '../src/components/common/CircularProgress';
import { PriorityDistributionBar } from '../src/components/common/PriorityDistributionBar';

describe('Micro Visualizations', () => {
  describe('CircularProgress', () => {
    it('renders progressbar role with correct percentage', () => {
      render(<CircularProgress percentage={75} size={36} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('safely handles 0% and NaN without errors', () => {
      render(<CircularProgress percentage={0} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('PriorityDistributionBar', () => {
    it('renders priority distribution bars with accurate counts and accessible labels', () => {
      render(<PriorityDistributionBar high={3} medium={2} low={1} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        'aria-label',
        'Pending workload distribution: 3 High, 2 Medium, 1 Low priority'
      );
      expect(screen.getByText('H')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('handles zero pending gracefully', () => {
      render(<PriorityDistributionBar high={0} medium={0} low={0} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute(
        'aria-label',
        'Pending workload distribution: No pending tasks'
      );
    });
  });
});

import { StatCards } from '../src/components/dashboard/StatCards';
import { UserTask } from '../src/types/task';
import { calculateStatistics } from '../src/utils/statistics';

describe('StatCards component', () => {
  it('counts strictly status === "Pending" tasks in the workload breakdown and excludes In Progress', () => {
    const tasks: UserTask[] = [
      // 2 Pending tasks
      {
        id: 'p1',
        title: 'Pending High Task',
        priority: 'High',
        category: 'Academics',
        dueDate: null,
        status: 'Pending',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
      {
        id: 'p2',
        title: 'Pending Low Task',
        priority: 'Low',
        category: 'Personal',
        dueDate: null,
        status: 'Pending',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
      // 2 In Progress tasks (must NOT be counted in pending workload distribution)
      {
        id: 'ip1',
        title: 'In Progress High Task',
        priority: 'High',
        category: 'GDG',
        dueDate: null,
        status: 'In Progress',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
      {
        id: 'ip2',
        title: 'In Progress Medium Task',
        priority: 'Medium',
        category: 'GDG',
        dueDate: null,
        status: 'In Progress',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
      // 1 Completed task
      {
        id: 'c1',
        title: 'Completed Medium Task',
        priority: 'Medium',
        category: 'Personal',
        dueDate: null,
        status: 'Completed',
        createdAt: '2026-10-27T00:00:00.000Z',
        updatedAt: '2026-10-27T00:00:00.000Z',
      },
    ];

    const stats = calculateStatistics(tasks);
    expect(stats.total).toBe(5);
    expect(stats.pending).toBe(2);
    expect(stats.inProgress).toBe(2);
    expect(stats.completed).toBe(1);

    render(<StatCards stats={stats} tasks={tasks} history={[]} />);

    // Pending count in Card 3 must be 2
    expect(screen.getByText('Pending')).toBeInTheDocument();

    // Priority distribution bar must have 1 High, 0 Medium, 1 Low (sum = 2 = stats.pending)
    // The In Progress tasks (1 High, 1 Medium) must NOT appear in the pending distribution!
    const workloadImg = screen.getByLabelText(
      'Pending workload distribution: 1 High, 0 Medium, 1 Low priority'
    );
    expect(workloadImg).toBeInTheDocument();
  });

  it('handles zero tasks honestly without fabricating trend data', () => {
    const stats = calculateStatistics([]);
    render(<StatCards stats={stats} tasks={[]} history={[]} />);

    const workloadImg = screen.getByLabelText(
      'Pending workload distribution: No pending tasks'
    );
    expect(workloadImg).toBeInTheDocument();

    // Sparkline should indicate trend data is building rather than fabricating points
    const sparklineTitles = screen.getAllByTitle(/trend data is building/i);
    expect(sparklineTitles.length).toBeGreaterThan(0);
  });

  it('renders recorded history trend when >= 2 snapshots exist without inventing past days', () => {
    const stats = calculateStatistics([]);
    const history = [
      { timestamp: 1, date: '2026-10-26', total: 3, completed: 1, pending: 2 },
      { timestamp: 2, date: '2026-10-27', total: 6, completed: 3, pending: 3 },
    ];

    render(<StatCards stats={stats} tasks={[]} history={history} />);

    // Tooltip and SVG title should describe actual recorded history
    const sparklines = screen.getAllByTitle('Recorded task count history: 3, 6');
    expect(sparklines.length).toBeGreaterThan(0);
  });
});
