import { useState, useCallback } from 'react';

export interface WorkflowResult {
  action_id: string;
  status: 'success' | 'error' | 'pending_review';
  message: string;
  data_logged: boolean;
  next_steps: string;
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  url: string;
  payloadSummary: string;
  responseStatus: number | null;
  status: 'success' | 'error';
  workflowName: string;
}

const WEBHOOK_LOG_KEY = 'webhook_logs';
const WORKFLOW_EXECUTIONS_KEY = 'workflow_executions';
const MAX_LOG_ENTRIES = 100;
const MAX_EXECUTIONS_PER_WORKFLOW = 50;

export function generateActionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function logWebhookEntry(entry: WebhookLogEntry): void {
  try {
    const stored = localStorage.getItem(WEBHOOK_LOG_KEY);
    const logs: WebhookLogEntry[] = stored ? JSON.parse(stored) : [];
    logs.unshift(entry);
    if (logs.length > MAX_LOG_ENTRIES) logs.splice(MAX_LOG_ENTRIES);
    localStorage.setItem(WEBHOOK_LOG_KEY, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

export function getWebhookLogs(): WebhookLogEntry[] {
  try {
    const stored = localStorage.getItem(WEBHOOK_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWorkflowExecution(workflowId: string, result: WorkflowResult): void {
  try {
    const stored = localStorage.getItem(WORKFLOW_EXECUTIONS_KEY);
    const all: Record<string, WorkflowResult[]> = stored ? JSON.parse(stored) : {};
    if (!all[workflowId]) all[workflowId] = [];
    all[workflowId].unshift(result);
    if (all[workflowId].length > MAX_EXECUTIONS_PER_WORKFLOW) {
      all[workflowId].splice(MAX_EXECUTIONS_PER_WORKFLOW);
    }
    localStorage.setItem(WORKFLOW_EXECUTIONS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getLastWorkflowExecution(workflowId: string): WorkflowResult | null {
  try {
    const stored = localStorage.getItem(WORKFLOW_EXECUTIONS_KEY);
    if (!stored) return null;
    const all: Record<string, WorkflowResult[]> = JSON.parse(stored);
    return all[workflowId]?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function postToWebhook(
  url: string,
  payload: Record<string, unknown>,
  apiKey: string,
  workflowName: string
): Promise<{ ok: boolean; status: number; body: string }> {
  const logEntry: WebhookLogEntry = {
    id: generateActionId(),
    timestamp: new Date().toISOString(),
    url,
    payloadSummary: JSON.stringify(payload).substring(0, 200),
    responseStatus: null,
    status: 'error',
    workflowName,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const body = await response.text();
    logEntry.responseStatus = response.status;
    logEntry.status = response.ok ? 'success' : 'error';
    logWebhookEntry(logEntry);
    return { ok: response.ok, status: response.status, body };
  } catch (err) {
    logEntry.responseStatus = null;
    logEntry.status = 'error';
    logWebhookEntry(logEntry);
    throw err;
  }
}

export function useWorkflowExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);

  const execute = useCallback(async (
    workflowId: string,
    fn: () => Promise<WorkflowResult>
  ): Promise<WorkflowResult> => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fn();
      setResult(res);
      saveWorkflowExecution(workflowId, res);
      return res;
    } catch (err) {
      const errResult: WorkflowResult = {
        action_id: generateActionId(),
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        data_logged: false,
        next_steps: 'Check your configuration and try again.',
      };
      setResult(errResult);
      saveWorkflowExecution(workflowId, errResult);
      return errResult;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { isRunning, result, execute, setResult };
}
