import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdviceCard } from '../src/components/dashboard/AdviceCard';

describe('AdviceCard component accessibility & live region announcements', () => {
  it('announces loading state and marks container aria-busy', () => {
    render(
      <AdviceCard
        advice={null}
        isLoading={true}
        error={null}
        onRefresh={vi.fn()}
      />
    );

    const liveRegion = screen.getByText('Loading daily advice...');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

    // Container should have aria-busy="true"
    const container = liveRegion.closest('[aria-busy="true"]');
    expect(container).toBeInTheDocument();

    // Refresh button should be disabled while loading
    const refreshBtn = screen.getByRole('button', { name: /refresh daily advice/i });
    expect(refreshBtn).toBeDisabled();
  });

  it('announces loaded advice and marks container aria-busy false', () => {
    const handleRefresh = vi.fn();
    render(
      <AdviceCard
        advice="Small steps each day lead to big achievements."
        isLoading={false}
        error={null}
        onRefresh={handleRefresh}
      />
    );

    const liveRegion = screen.getByText('Daily advice: "Small steps each day lead to big achievements."');
    expect(liveRegion).toBeInTheDocument();

    const container = liveRegion.closest('[aria-busy="false"]');
    expect(container).toBeInTheDocument();

    // Refresh button is enabled and named
    const refreshBtn = screen.getByRole('button', { name: /refresh daily advice/i });
    expect(refreshBtn).not.toBeDisabled();

    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('announces error state accessibly', () => {
    render(
      <AdviceCard
        advice={null}
        isLoading={false}
        error="Network unavailable"
        onRefresh={vi.fn()}
      />
    );

    const liveRegion = screen.getByText('Advice error: Network unavailable');
    expect(liveRegion).toBeInTheDocument();

    // Visual error element is also present
    expect(screen.getByText('Network unavailable')).toBeInTheDocument();
  });
});
