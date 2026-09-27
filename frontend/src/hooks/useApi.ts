import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  intervalMs?: number,
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Request failed';
      setError(message);
      // Keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetch();
  }, [fetch]);

  useEffect(() => {
    if (!intervalMs) return;
    const id = setInterval(() => void fetch(), intervalMs);
    return () => clearInterval(id);
  }, [fetch, intervalMs]);

  return { data, loading, error, lastUpdated, refresh: fetch };
}
