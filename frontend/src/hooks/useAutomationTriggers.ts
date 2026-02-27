import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';
import { generateActionId, postToWebhook } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

export function useAutomationTriggers() {
  const { config } = useAIConfig();
  const { addLog } = useWebhookLog();

  const triggerWhatsAppAutoReply = useCallback(async (data: Record<string, unknown>): Promise<WorkflowResult> => {
    if (!config.whatsAppAutoReplyEnabled) {
      return {
        action_id: generateActionId(),
        status: 'pending',
        message: 'WhatsApp Auto-Reply is disabled',
        data_logged: false,
        next_steps: ['Enable WhatsApp Auto-Reply in Automation settings'],
      };
    }

    const url = config.automationWebhookUrl;
    if (!url) {
      toast.error('Automation Webhook URL is not configured');
      return {
        action_id: generateActionId(),
        status: 'error',
        message: 'Automation Webhook URL not configured',
        data_logged: false,
        next_steps: ['Configure Automation Webhook URL in Settings'],
      };
    }

    const payload = { event: 'whatsapp_auto_reply', ...data, timestamp: Date.now() };
    const res = await postToWebhook(url, payload, config.apiKey, addLog, 'WhatsAppAutoReply');

    return {
      action_id: generateActionId(),
      status: res.ok ? 'success' : 'error',
      message: res.ok ? 'WhatsApp auto-reply triggered' : `Failed: ${res.body.slice(0, 100)}`,
      data_logged: true,
      next_steps: res.ok ? ['Monitor delivery status'] : ['Check webhook URL and retry'],
    };
  }, [config, addLog]);

  const triggerProposalAutoSend = useCallback(async (data: Record<string, unknown>): Promise<WorkflowResult> => {
    if (!config.proposalAutoSendEnabled) {
      return {
        action_id: generateActionId(),
        status: 'pending',
        message: 'Proposal Auto-Send is disabled',
        data_logged: false,
        next_steps: ['Enable Proposal Auto-Send in Automation settings'],
      };
    }

    const url = config.automationWebhookUrl;
    if (!url) {
      toast.error('Automation Webhook URL is not configured');
      return {
        action_id: generateActionId(),
        status: 'error',
        message: 'Automation Webhook URL not configured',
        data_logged: false,
        next_steps: ['Configure Automation Webhook URL in Settings'],
      };
    }

    const payload = { event: 'proposal_auto_send', ...data, timestamp: Date.now() };
    const res = await postToWebhook(url, payload, config.apiKey, addLog, 'ProposalAutoSend');

    return {
      action_id: generateActionId(),
      status: res.ok ? 'success' : 'error',
      message: res.ok ? 'Proposal auto-send triggered' : `Failed: ${res.body.slice(0, 100)}`,
      data_logged: true,
      next_steps: res.ok ? ['Check email delivery'] : ['Check webhook URL and retry'],
    };
  }, [config, addLog]);

  const triggerLeadFollowUp = useCallback(async (data: Record<string, unknown>): Promise<WorkflowResult> => {
    if (!config.leadFollowUpEnabled) {
      return {
        action_id: generateActionId(),
        status: 'pending',
        message: 'Lead Follow-Up is disabled',
        data_logged: false,
        next_steps: ['Enable Lead Follow-Up in Automation settings'],
      };
    }

    const url = config.automationWebhookUrl;
    if (!url) {
      toast.error('Automation Webhook URL is not configured');
      return {
        action_id: generateActionId(),
        status: 'error',
        message: 'Automation Webhook URL not configured',
        data_logged: false,
        next_steps: ['Configure Automation Webhook URL in Settings'],
      };
    }

    const payload = { event: 'lead_follow_up', ...data, timestamp: Date.now() };
    const res = await postToWebhook(url, payload, config.apiKey, addLog, 'LeadFollowUp');

    return {
      action_id: generateActionId(),
      status: res.ok ? 'success' : 'error',
      message: res.ok ? 'Lead follow-up triggered' : `Failed: ${res.body.slice(0, 100)}`,
      data_logged: true,
      next_steps: res.ok ? ['Monitor follow-up sequence'] : ['Check webhook URL and retry'],
    };
  }, [config, addLog]);

  const triggerPaymentConfirmation = useCallback(async (data: Record<string, unknown>): Promise<WorkflowResult> => {
    if (!config.paymentConfirmationEnabled) {
      return {
        action_id: generateActionId(),
        status: 'pending',
        message: 'Payment Confirmation is disabled',
        data_logged: false,
        next_steps: ['Enable Payment Confirmation in Automation settings'],
      };
    }

    const url = config.automationWebhookUrl;
    if (!url) {
      toast.error('Automation Webhook URL is not configured');
      return {
        action_id: generateActionId(),
        status: 'error',
        message: 'Automation Webhook URL not configured',
        data_logged: false,
        next_steps: ['Configure Automation Webhook URL in Settings'],
      };
    }

    const payload = { event: 'payment_confirmation', ...data, timestamp: Date.now() };
    const res = await postToWebhook(url, payload, config.apiKey, addLog, 'PaymentConfirmation');

    return {
      action_id: generateActionId(),
      status: res.ok ? 'success' : 'error',
      message: res.ok ? 'Payment confirmation triggered' : `Failed: ${res.body.slice(0, 100)}`,
      data_logged: true,
      next_steps: res.ok ? ['Invoice will be generated'] : ['Check webhook URL and retry'],
    };
  }, [config, addLog]);

  const triggerProjectOnboarding = useCallback(async (data: Record<string, unknown>): Promise<WorkflowResult> => {
    if (!config.projectOnboardingEnabled) {
      return {
        action_id: generateActionId(),
        status: 'pending',
        message: 'Project Onboarding is disabled',
        data_logged: false,
        next_steps: ['Enable Project Onboarding in Automation settings'],
      };
    }

    const url = config.automationWebhookUrl;
    if (!url) {
      toast.error('Automation Webhook URL is not configured');
      return {
        action_id: generateActionId(),
        status: 'error',
        message: 'Automation Webhook URL not configured',
        data_logged: false,
        next_steps: ['Configure Automation Webhook URL in Settings'],
      };
    }

    const payload = { event: 'project_onboarding', ...data, timestamp: Date.now() };
    const res = await postToWebhook(url, payload, config.apiKey, addLog, 'ProjectOnboarding');

    return {
      action_id: generateActionId(),
      status: res.ok ? 'success' : 'error',
      message: res.ok ? 'Project onboarding triggered' : `Failed: ${res.body.slice(0, 100)}`,
      data_logged: true,
      next_steps: res.ok ? ['Client will receive onboarding email'] : ['Check webhook URL and retry'],
    };
  }, [config, addLog]);

  return {
    triggerWhatsAppAutoReply,
    triggerProposalAutoSend,
    triggerLeadFollowUp,
    triggerPaymentConfirmation,
    triggerProjectOnboarding,
  };
}
