import { useState, useEffect } from 'react';

const BOOTSTRAP_TIMEOUT_MS = 8000; // 8 seconds

export function useBootstrapWatchdog() {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setHasTimedOut(false);
    
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, BOOTSTRAP_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [resetKey]);

  const reset = () => {
    setResetKey(prev => prev + 1);
  };

  return { hasTimedOut, reset };
}
