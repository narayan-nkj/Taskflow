import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSampleTodos } from '../src/hooks/useSampleTodos';
import * as sampleService from '../src/services/dummyjson';
import { SampleTodo } from '../src/types/api';

vi.mock('../src/services/dummyjson');

describe('useSampleTodos hook with stale-request guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSamples: SampleTodo[] = [
    { id: 1, todo: 'Do something nice for someone I care about', completed: true, userId: 26 },
    { id: 2, todo: 'Memorize the fifty states and their capitals', completed: false, userId: 48 },
  ];

  it('handles initial loading followed by success', async () => {
    vi.mocked(sampleService.fetchDummyJsonTodos).mockResolvedValueOnce(mockSamples);

    const { result } = renderHook(() => useSampleTodos());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.samples).toHaveLength(2);
    expect(result.current.samples[0].id).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('handles error and retry cleanly', async () => {
    vi.mocked(sampleService.fetchDummyJsonTodos).mockRejectedValueOnce(
      new Error('API rate limit')
    );

    const { result } = renderHook(() => useSampleTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('API rate limit');
    expect(result.current.samples).toEqual([]);

    // Retry
    vi.mocked(sampleService.fetchDummyJsonTodos).mockResolvedValueOnce(mockSamples);

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.samples).toHaveLength(2);
  });

  it('discards stale responses when refreshed while a request is pending', async () => {
    let resolveReq1: (val: SampleTodo[]) => void;
    let resolveReq2: (val: SampleTodo[]) => void;

    const promise1 = new Promise<SampleTodo[]>((resolve) => {
      resolveReq1 = resolve;
    });
    const promise2 = new Promise<SampleTodo[]>((resolve) => {
      resolveReq2 = resolve;
    });

    vi.mocked(sampleService.fetchDummyJsonTodos)
      .mockReturnValueOnce(promise1)
      .mockReturnValueOnce(promise2);

    const { result } = renderHook(() => useSampleTodos());
    expect(result.current.isLoading).toBe(true);

    // Refresh triggers second request
    act(() => {
      result.current.refresh();
    });

    // Resolve second request first
    await act(async () => {
      resolveReq2([{ id: 99, todo: 'Newest sample todo', completed: false, userId: 1 }]);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.samples[0].id).toBe(99);
    });

    // Resolve first request later (stale)
    await act(async () => {
      resolveReq1(mockSamples);
    });

    // Stale result must not overwrite the newer data
    expect(result.current.samples).toHaveLength(1);
    expect(result.current.samples[0].id).toBe(99);
  });

  it('cancels active request on unmount without warnings', () => {
    let signalCaptured: AbortSignal | undefined;
    vi.mocked(sampleService.fetchDummyJsonTodos).mockImplementation((signal) => {
      signalCaptured = signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useSampleTodos());
    expect(signalCaptured?.aborted).toBe(false);

    unmount();
    expect(signalCaptured?.aborted).toBe(true);
  });
});
