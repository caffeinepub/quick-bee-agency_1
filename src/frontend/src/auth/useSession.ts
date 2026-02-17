import { useState, useEffect } from 'react';
import type { DemoRole } from './demoCredentials';

const SESSION_KEY = 'quickbee_session';

interface SessionData {
  email: string;
  role: DemoRole;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const saveSession = (email: string, role: DemoRole) => {
    setSession({ email, role });
  };

  const clearSession = () => {
    setSession(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return { session, saveSession, clearSession };
}
