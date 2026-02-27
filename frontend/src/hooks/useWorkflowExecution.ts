import { useState, useCallback } from 'react';
import { useWebhookLog } from '../contexts/WebhookLogContext';

export interface WorkflowResult {
  action_id: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data_logged: boolean;
  next_steps: string[];
}

export interface WorkflowExecution {
  timestamp: number;
  result: WorkflowResult;
}

export function generateActionId(): string {
  return `ACT_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function saveWorkflowExecution(workflowName: string, execution: WorkflowExecution): void {
  try {
    localStorage.setItem(`workflow_${workflowName}_lastExecution`, JSON.stringify(execution));
  } catch {
    // ignore
  }
}

export function getLastWorkflowExecution(workflowName: string): WorkflowExecution | null {
  try {
    const raw = localStorage.getItem(`workflow_${workflowName}_lastExecution`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function postToWebhook(
  url: string,
  payload: Record<string, unknown>,
  apiKey?: string,
  addLog?: (entry: {
    timestamp: number;
    url: string;
    eventName: string;
    payloadSummary: string;
    statusCode: number | null;
    responseSummary: string;
    isError: boolean;
  }) => void,
  eventName = 'webhook_post'
): Promise<{ ok: boolean; status: number | null; body: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const payloadStr = JSON.stringify(payload);
  const payloadSummary = payloadStr.slice(0, 200);

  try {
    const res = await fetch(url, { method: 'POST', headers, body: payloadStr });
    const body = await res.text().catch(() => '');
    const responseSummary = body.slice(0, 200);

    addLog?.({
      timestamp: Date.now(),
      url,
      eventName,
      payloadSummary,
      statusCode: res.status,
      responseSummary,
      isError: !res.ok,
    });

    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Network error';
    addLog?.({
      timestamp: Date.now(),
      url,
      eventName,
      payloadSummary,
      statusCode: null,
      responseSummary: errMsg.slice(0, 200),
      isError: true,
    });
    return { ok: false, status: null, body: errMsg };
  }
}

export function useWorkflowExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const { addLog } = useWebhookLog();

  const run = useCallback(async (fn: () => Promise<WorkflowResult>) => {
    setIsRunning(true);
    try {
      const res = await fn();
      setResult(res);
      return res;
    } catch (err) {
      const errResult: WorkflowResult = {
        action_id: generateActionId(),
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
        data_logged: false,
        next_steps: ['Check configuration and try again'],
      };
      setResult(errResult);
      return errResult;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { isRunning, result, run, addLog };
}
