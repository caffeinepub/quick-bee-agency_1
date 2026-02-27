import { useCallback } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';
import { generateActionId, postToWebhook, saveWorkflowExecution } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

export function usePaymentProcessingWorkflow() {
  const { config } = useAIConfig();
  const { addLog } = useWebhookLog();

  const triggerPaymentSuccess = useCallback(async (data: {
    payment_id?: string;
    lead_id?: string;
    order_id?: string;
    amount?: string;
  }): Promise<WorkflowResult & { invoiceRef: string }> => {
    const invoiceRef = `QBA-${Date.now()}`;
    const actionId = generateActionId();

    const url = config.automationWebhookUrl;
    if (!url) {
      const result = {
        action_id: actionId,
        status: 'success' as const,
        message: `Payment recorded. Invoice: ${invoiceRef}`,
        data_logged: false,
        next_steps: ['Configure Automation Webhook URL to enable notifications'],
        invoiceRef,
      };
      saveWorkflowExecution('PaymentProcessing', { timestamp: Date.now(), result });
      return result;
    }

    const payload = {
      event: 'payment_success',
      invoice_ref: invoiceRef,
      ...data,
      timestamp: Date.now(),
    };

    const res = await postToWebhook(url, payload, config.apiKey, addLog, 'PaymentSuccess');

    const result = {
      action_id: actionId,
      status: res.ok ? 'success' as const : 'error' as const,
      message: res.ok
        ? `Payment confirmed. Invoice: ${invoiceRef}`
        : `Payment recorded but notification failed: ${res.body.slice(0, 100)}`,
      data_logged: res.ok,
      next_steps: res.ok
        ? ['Invoice has been generated', 'Client will receive confirmation']
        : ['Check webhook configuration'],
      invoiceRef,
    };

    saveWorkflowExecution('PaymentProcessing', { timestamp: Date.now(), result });
    return result;
  }, [config, addLog]);

  const triggerPaymentFailure = useCallback(async (data: {
    payment_id?: string;
    lead_id?: string;
    order_id?: string;
  }): Promise<WorkflowResult> => {
    const actionId = generateActionId();

    const url = config.automationWebhookUrl;
    if (!url) {
      return {
        action_id: actionId,
        status: 'error',
        message: 'Payment failed. Webhook not configured.',
        data_logged: false,
        next_steps: ['Configure Automation Webhook URL', 'Retry payment'],
      };
    }

    const payload = {
      event: 'payment_failure',
      ...data,
      timestamp: Date.now(),
    };

    const res = await postToWebhook(url, payload, config.apiKey, addLog, 'PaymentFailure');

    return {
      action_id: actionId,
      status: 'error',
      message: res.ok ? 'Payment failure logged' : `Failed to log payment failure: ${res.body.slice(0, 100)}`,
      data_logged: res.ok,
      next_steps: ['Retry payment', 'Contact support if issue persists'],
    };
  }, [config, addLog]);

  return { triggerPaymentSuccess, triggerPaymentFailure };
}
