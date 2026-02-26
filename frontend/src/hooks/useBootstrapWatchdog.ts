import { useState, useEffect, useCallback } from 'react';

export function useBootstrapWatchdog(timeoutMs = 5000) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [startTime] = useState(Date.now());

  const reset = useCallback(() => {
    setHasTimedOut(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [timeoutMs, startTime]);

  return { hasTimedOut, reset };
}
