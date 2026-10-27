import { useState, useEffect, useCallback, useRef } from 'react';
import { SampleTodo } from '../types/api';
import { fetchDummyJsonTodos } from '../services/dummyjson';

export function useSampleTodos() {
  const [samples, setSamples] = useState<SampleTodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadSamples = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDummyJsonTodos(controller.signal);
      setSamples(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const msg = err instanceof Error ? err.message : 'Failed to fetch DummyJSON sample todos.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSamples();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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
