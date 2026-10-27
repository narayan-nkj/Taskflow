import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdvice } from '../src/hooks/useAdvice';
import * as adviceService from '../src/services/advice';

vi.mock('../src/services/advice');

describe('useAdvice hook with stale-request guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles initial loading followed by success', async () => {
    vi.mocked(adviceService.fetchDailyAdvice).mockResolvedValueOnce({
      id: 42,
      advice: 'Take breaks often.',
    });

    const { result } = renderHook(() => useAdvice());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.advice).toBe('Take breaks often.');
    expect(result.current.id).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('handles error and subsequent retry', async () => {
    vi.mocked(adviceService.fetchDailyAdvice).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useAdvice());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.advice).toBeNull();

    // Now mock retry success
    vi.mocked(adviceService.fetchDailyAdvice).mockResolvedValueOnce({
      id: 101,
      advice: 'Stay hydrated.',
    });

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.advice).toBe('Stay hydrated.');
    expect(result.current.id).toBe(101);
  });

  it('discards stale responses when refreshed while a request is pending', async () => {
    let resolveReq1;
    let resolveReq2;

    const promise1 = new Promise((resolve) => {
      resolveReq1 = resolve;
    });
    const promise2 = new Promise((resolve) => {
      resolveReq2 = resolve;
    });

    vi.mocked(adviceService.fetchDailyAdvice)
      .mockReturnValueOnce(promise1)
      .mockReturnValueOnce(promise2);

    const { result } = renderHook(() => useAdvice());
    expect(result.current.isLoading).toBe(true);

    // Trigger second request before first finishes
    act(() => {
      result.current.refresh();
    });
    expect(result.current.isLoading).toBe(true);

    // Resolve second request first
    await act(async () => {
      resolveReq2({ id: 2, advice: 'Newest Advice' });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.advice).toBe('Newest Advice');
    });

    // Now resolve first request later (stale)
    await act(async () => {
      resolveReq1({ id: 1, advice: 'Stale Old Advice' });
    });

    // Stale advice must NOT overwrite the newer data
    expect(result.current.advice).toBe('Newest Advice');
    expect(result.current.id).toBe(2);
  });

  it('cancels active request on unmount without warning or state update', () => {
    let signalCaptured;
    vi.mocked(adviceService.fetchDailyAdvice).mockImplementation((signal) => {
      signalCaptured = signal;
      return new Promise(() => {}); // never resolves
    });

    const { unmount } = renderHook(() => useAdvice());
    expect(signalCaptured?.aborted).toBe(false);

    unmount();
    expect(signalCaptured?.aborted).toBe(true);
  });
});
