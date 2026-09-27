import { useState, useEffect, useRef } from 'react';
import { getHealth } from '../services/api';

export type BackendStatus = 'checking' | 'online' | 'offline';

export function useBackendHealth(intervalMs = 10000) {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const check = async () => {
    try {
      await getHealth();
      if (mountedRef.current) {
        setStatus('online');
        setLastChecked(new Date());
      }
    } catch {
      if (mountedRef.current) {
        setStatus('offline');
        setLastChecked(new Date());
      }
    }
  };

  useEffect(() => {
    void check();
    const id = setInterval(() => void check(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, lastChecked };
}
