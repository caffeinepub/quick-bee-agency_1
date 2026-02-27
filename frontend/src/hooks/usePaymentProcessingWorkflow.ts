import { useCallback } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { generateActionId, logWebhookEntry, postToWebhook } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

interface PaymentSuccessInput {
  paymentId?: string;
  leadId?: string;
  orderId?: string;
  amount?: number;
}

interface PaymentFailureInput {
  paymentId?: string;
  errorMessage?: string;
}

export function usePaymentProcessingWorkflow() {
  const { config } = useAIConfig();

  const triggerPaymentSuccess = useCallback(async (input: PaymentSuccessInput): Promise<WorkflowResult & { invoiceRef: string }> => {
    const actionId = generateActionId();
    const invoiceRef = `QBA-${Date.now()}`;
    let dataLogged = false;

    if (config.automationWebhookUrl && config.automationWebhookUrlEnabled) {
      try {
        await postToWebhook(
          config.automationWebhookUrl,
          {
            tool: 'payment_processing',
            status: 'paid',
            payment_id: input.paymentId,
            lead_id: input.leadId,
            order_id: input.orderId,
            amount: input.amount,
            invoice_ref: invoiceRef,
            timestamp: new Date().toISOString(),
          },
          config.apiKey,
          'Payment Processing (Success)'
        );
        dataLogged = true;
      } catch {
        // log handled in postToWebhook
      }
    } else {
      logWebhookEntry({
        id: generateActionId(),
        timestamp: new Date().toISOString(),
        url: config.automationWebhookUrl || 'not configured',
        payloadSummary: 'Automation webhook not configured or disabled - payment success skipped',
        responseStatus: null,
        status: 'error',
        workflowName: 'Payment Processing (Success)',
      });
    }

    return {
      action_id: actionId,
      status: 'success',
      message: `Payment confirmed. Invoice reference: ${invoiceRef}`,
      data_logged: dataLogged,
      next_steps: 'Receipt confirmation has been queued. Check your email for the invoice.',
      invoiceRef,
    };
  }, [config]);

  const triggerPaymentFailure = useCallback(async (input: PaymentFailureInput): Promise<WorkflowResult> => {
    const actionId = generateActionId();
    let dataLogged = false;

    if (config.automationWebhookUrl && config.automationWebhookUrlEnabled) {
      try {
        await postToWebhook(
          config.automationWebhookUrl,
          {
            tool: 'payment_processing',
            status: 'failed',
            payment_id: input.paymentId,
            error_message: input.errorMessage,
            timestamp: new Date().toISOString(),
          },
          config.apiKey,
          'Payment Processing (Failure)'
        );
        dataLogged = true;
      } catch {
        // log handled in postToWebhook
      }
    } else {
      logWebhookEntry({
        id: generateActionId(),
        timestamp: new Date().toISOString(),
        url: config.automationWebhookUrl || 'not configured',
        payloadSummary: 'Automation webhook not configured or disabled - payment failure skipped',
        responseStatus: null,
        status: 'error',
        workflowName: 'Payment Processing (Failure)',
      });
    }

    return {
      action_id: actionId,
      status: 'error',
      message: `Payment failed: ${input.errorMessage || 'Unknown error'}`,
      data_logged: dataLogged,
      next_steps: 'Please retry the payment or contact support. A retry email has been queued.',
    };
  }, [config]);

  return { triggerPaymentSuccess, triggerPaymentFailure };
}
