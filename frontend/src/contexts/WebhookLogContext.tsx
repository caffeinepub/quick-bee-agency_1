import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface WebhookLogEntry {
  id: string;
  timestamp: number;
  url: string;
  eventName: string;
  payloadSummary: string;
  statusCode: number | null;
  responseSummary: string;
  isError: boolean;
}

interface WebhookLogContextType {
  logs: WebhookLogEntry[];
  addLog: (entry: Omit<WebhookLogEntry, 'id'>) => void;
  clearLogs: () => void;
}

const STORAGE_KEY = 'qba_webhook_logs';
const MAX_LOGS = 500;

function loadLogs(): WebhookLogEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLogs(logs: WebhookLogEntry[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch {
    // ignore
  }
}

const WebhookLogContext = createContext<WebhookLogContextType | null>(null);

export function WebhookLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<WebhookLogEntry[]>(loadLogs);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  const addLog = useCallback((entry: Omit<WebhookLogEntry, 'id'>) => {
    const newEntry: WebhookLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    setLogs(prev => [newEntry, ...prev].slice(0, MAX_LOGS));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <WebhookLogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </WebhookLogContext.Provider>
  );
}

export function useWebhookLog(): WebhookLogContextType {
  const ctx = useContext(WebhookLogContext);
  if (!ctx) throw new Error('useWebhookLog must be used within WebhookLogProvider');
  return ctx;
}
