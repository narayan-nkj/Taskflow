import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileHeader } from '../src/components/navigation/MobileHeader';

describe('MobileHeader accessibility and selected-state navigation', () => {
  const defaultProps = {
    currentTab: 'tasks',
    onSelectTab: vi.fn(),
    onAddTask: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    isDark: false,
    onToggleTheme: vi.fn(),
    userTasksCount: 5,
  };

  it('renders menu button with aria-expanded="false" when collapsed', () => {
    render(<MobileHeader {...defaultProps} />);

    const menuToggle = screen.getByRole('button', { name: /open navigation menu/i });
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles menu open/close and displays navigation with accessible aria-current state', () => {
    const onSelectTab = vi.fn();
    render(<MobileHeader {...defaultProps} onSelectTab={onSelectTab} currentTab="tasks" />);

    const menuToggle = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuToggle);

    expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    // Tab buttons
    const myTasksTab = screen.getByRole('button', { name: /my tasks/i });
    const samplesTab = screen.getByRole('button', { name: /sample tasks \(dummyjson\)/i });

    // "My Tasks" is selected
    expect(myTasksTab).toHaveAttribute('aria-current', 'page');
    expect(samplesTab).not.toHaveAttribute('aria-current');

    // Click sample tab
    fireEvent.click(samplesTab);
    expect(onSelectTab).toHaveBeenCalledWith('samples');

    // Menu closes upon selection
    expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it('correctly marks samples tab with aria-current="page" when currentTab="samples"', () => {
    render(<MobileHeader {...defaultProps} currentTab="samples" />);

    const menuToggle = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(menuToggle);

    const myTasksTab = screen.getByRole('button', { name: /my tasks/i });
    const samplesTab = screen.getByRole('button', { name: /sample tasks \(dummyjson\)/i });

    expect(samplesTab).toHaveAttribute('aria-current', 'page');
    expect(myTasksTab).not.toHaveAttribute('aria-current');
  });
});
