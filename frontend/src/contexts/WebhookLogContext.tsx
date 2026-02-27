import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WebhookLogEntry {
  id: string;
  timestamp: number;
  url: string;
  eventName: string;
  payloadSummary: string;
  statusCode: number | null;
  responseSummary: string;
  isSuccess: boolean;
}

interface WebhookLogContextType {
  logs: WebhookLogEntry[];
  addLogEntry: (entry: Omit<WebhookLogEntry, 'id'>) => void;
  clearLogs: () => void;
  getFilteredLogs: (filters: { eventType?: string; status?: 'success' | 'error' }) => WebhookLogEntry[];
}

const WebhookLogContext = createContext<WebhookLogContextType | null>(null);

export function WebhookLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<WebhookLogEntry[]>(() => {
    try {
      const stored = sessionStorage.getItem('quickbee-webhook-logs');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
  });

  const addLogEntry = (entry: Omit<WebhookLogEntry, 'id'>) => {
    const newEntry: WebhookLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    setLogs(prev => {
      const updated = [newEntry, ...prev].slice(0, 500); // keep last 500
      try { sessionStorage.setItem('quickbee-webhook-logs', JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  };

  const clearLogs = () => {
    setLogs([]);
    try { sessionStorage.removeItem('quickbee-webhook-logs'); } catch { /* ignore */ }
  };

  const getFilteredLogs = (filters: { eventType?: string; status?: 'success' | 'error' }) => {
    return logs.filter(log => {
      if (filters.eventType && filters.eventType !== 'all' && log.eventName !== filters.eventType) return false;
      if (filters.status === 'success' && !log.isSuccess) return false;
      if (filters.status === 'error' && log.isSuccess) return false;
      return true;
    });
  };

  return (
    <WebhookLogContext.Provider value={{ logs, addLogEntry, clearLogs, getFilteredLogs }}>
      {children}
    </WebhookLogContext.Provider>
  );
}

export function useWebhookLog() {
  const ctx = useContext(WebhookLogContext);
  if (!ctx) throw new Error('useWebhookLog must be used within WebhookLogProvider');
  return ctx;
}
