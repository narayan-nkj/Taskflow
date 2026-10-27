import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LoadingScreen } from '../src/components/common/LoadingScreen';

describe('LoadingScreen Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders brand elements, wordmark, and status message', () => {
    render(<LoadingScreen isDark={false} isFadingOut={false} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading taskflow workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/TaskFlow/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Productivity Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /PREPARING YOUR WORKSPACE/i })).toBeInTheDocument();
  });

  it('renders cinematic typography, chevrons, and initial 01 numeral', () => {
    render(<LoadingScreen isDark={true} isFadingOut={false} />);

    // Editorial tagline and chevrons
    expect(screen.getByText(/THE ART OF GETTING THINGS DONE/i)).toBeInTheDocument();
    expect(screen.getByText(/›››/i)).toBeInTheDocument();

    // Film grain overlay
    expect(screen.getByTestId('film-grain')).toBeInTheDocument();

    // Initial oversized numeral starts at 01
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('progresses smoothly through 1 to 100 counter and triggers onComplete', () => {
    const onComplete = vi.fn();
    render(<LoadingScreen isDark={true} isFadingOut={false} onComplete={onComplete} />);

    expect(screen.getByText('01')).toBeInTheDocument();

    // Advance timers partially through loading progression
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Expect progress to have moved past initial stage (beyond 25%)
    expect(screen.queryByText('01')).not.toBeInTheDocument();

    // Advance timers to completion (total ~2.8s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Numeral should reach 100
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalled();
  });

  it('adapts surfaces for light and dark themes without blue backgrounds', () => {
    const { rerender } = render(<LoadingScreen isDark={false} isFadingOut={false} />);
    let container = screen.getByRole('status');
    expect(container.className).toContain('bg-[#F8FAFC]');

    rerender(<LoadingScreen isDark={true} isFadingOut={false} />);
    container = screen.getByRole('status');
    expect(container.className).toContain('bg-[#050505]');
    expect(container.className).not.toContain('bg-blue');
  });

  it('applies fading out classes for smooth dissolve transition', () => {
    render(<LoadingScreen isDark={true} isFadingOut={true} />);
    const container = screen.getByRole('status');
    expect(container.className).toContain('opacity-0');
    expect(container.className).toContain('pointer-events-none');
  });

  it('respects prefers-reduced-motion preference by starting directly at 100', () => {
    // Mock matchMedia for prefers-reduced-motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<LoadingScreen isDark={true} isFadingOut={false} />);
    expect(screen.getByText('100')).toBeInTheDocument();

    window.matchMedia = originalMatchMedia;
  });
});
