import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../src/components/common/LoadingScreen';
import { App } from '../src/App';

describe('LoadingScreen Component', () => {
  it('renders accessible status role and message truthfully without fake counters', () => {
    render(<LoadingScreen isDark={false} message="Synchronizing workspace..." />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.getByLabelText(/synchronizing workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/synchronizing workspace/i)).toBeInTheDocument();

    // Verify there is NO simulated 1-100 counter or fake percentage text
    expect(screen.queryByText(/OPTIMIZING PERFORMANCE/i)).not.toBeInTheDocument();
    expect(screen.queryByText('01')).not.toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
  });

  it('adapts surfaces for light and dark themes', () => {
    const { rerender } = render(<LoadingScreen isDark={false} />);
    let container = screen.getByRole('status');
    expect(container.className).toContain('bg-[#FAFAFA]');

    rerender(<LoadingScreen isDark={true} />);
    container = screen.getByRole('status');
    expect(container.className).toContain('bg-[#0B0B0B]');
  });
});

describe('Dashboard Startup Performance (No Artificial Timer)', () => {
  it('mounts App and immediately renders the workspace without delay', () => {
    render(<App />);

    // Dashboard headings and primary controls must be immediately present
    expect(screen.getByRole('heading', { name: /Task Overview Statistics/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();

    // No full-screen splash or loading screen blocking user interaction
    expect(screen.queryByText(/PREPARING YOUR WORKSPACE/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SYNCHRONIZING ENVIRONMENT/i)).not.toBeInTheDocument();
  });
});
