import { useState, useEffect, useCallback, useRef } from 'react';
import { SampleTodo } from '../types/api';
import { fetchDummyJsonTodos } from '../services/dummyjson';

export function useSampleTodos() {
  const [samples, setSamples] = useState<SampleTodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const loadSamples = useCallback(async () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDummyJsonTodos(controller.signal);

      // Guard: only apply state if this is still the active request and component is mounted
      if (!isMountedRef.current || activeControllerRef.current !== controller) {
        return;
      }

      setSamples(data);
      setError(null);
    } catch (err: unknown) {
      // Guard: ignore if stale or unmounted
      if (!isMountedRef.current || activeControllerRef.current !== controller) {
        return;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Ignore aborts silently
      }
      const msg = err instanceof Error ? err.message : 'Failed to fetch DummyJSON sample todos.';
      setError(msg);
    } finally {
      // Guard: only clear loading state if this request is still current
      if (isMountedRef.current && activeControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadSamples();
    return () => {
      isMountedRef.current = false;
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
  }, [loadSamples]);

  return {
    samples,
    isLoading,
    error,
    refresh: loadSamples,
  };
}
