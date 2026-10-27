import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDailyAdvice, AdviceResult } from '../services/advice';

export function useAdvice() {
  const [data, setData] = useState<AdviceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const loadAdvice = useCallback(async () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchDailyAdvice(controller.signal);

      // Guard: only apply state if this is still the active request and component is mounted
      if (!isMountedRef.current || activeControllerRef.current !== controller) {
        return;
      }

      setData(res);
      setError(null);
    } catch (err: unknown) {
      // Guard: ignore if stale or unmounted
      if (!isMountedRef.current || activeControllerRef.current !== controller) {
        return;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Ignore aborts silently
      }
      const msg = err instanceof Error ? err.message : 'Failed to load daily advice.';
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
    loadAdvice();
    return () => {
      isMountedRef.current = false;
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
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
