import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDailyAdvice, AdviceResult } from '../services/advice';

export function useAdvice() {
  const [data, setData] = useState<AdviceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadAdvice = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchDailyAdvice(controller.signal);
      setData(res);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Ignore aborts
      }
      const msg = err instanceof Error ? err.message : 'Failed to load daily advice.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdvice();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadAdvice]);

  return {
    advice: data?.advice || null,
    id: data?.id || null,
    isLoading,
    error,
    refresh: loadAdvice,
  };
}
