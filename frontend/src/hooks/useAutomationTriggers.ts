import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';

interface LeadData {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  [key: string]: unknown;
}

interface PaymentData {
  amount?: number;
  orderId?: string;
  leadId?: string | number;
  [key: string]: unknown;
}

interface ProjectData {
  projectId?: string | number;
  serviceId?: string | number;
  clientId?: string;
  [key: string]: unknown;
}

export function useAutomationTriggers() {
  const { config } = useAIConfig();
  const { addLogEntry } = useWebhookLog();

  const postToAutomationWebhook = async (
    type: string,
    data: unknown,
    authToken?: string,
  ) => {
    const url = config.automationWebhookUrlEnabled && config.automationWebhookUrl
      ? config.automationWebhookUrl
      : null;

    if (!url) return;

    const payload = { type, timestamp: Date.now(), data };
    const payloadSummary = JSON.stringify(payload).slice(0, 200);
    let statusCode: number | null = null;
    let isSuccess = false;
    let responseSummary = '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      statusCode = response.status;
      isSuccess = response.ok;
      try {
        const rd = await response.json();
        responseSummary = JSON.stringify(rd).slice(0, 200);
      } catch {
        responseSummary = String(response.status);
      }

      addLogEntry({ timestamp: Date.now(), url, eventName: type, payloadSummary, statusCode, responseSummary, isSuccess });

      if (!response.ok) {
        throw new Error(`Automation trigger "${type}" failed: ${response.status}`);
      }
    } catch (err) {
      if (statusCode === null) {
        addLogEntry({
          timestamp: Date.now(), url, eventName: type, payloadSummary,
          statusCode: null, responseSummary: err instanceof Error ? err.message : 'Network error', isSuccess: false,
        });
      }
      throw err;
    }
  };

  const triggerWhatsAppAutoReply = async (leadData: LeadData) => {
    if (!config.whatsAppAutoReplyEnabled) return;
    if (!config.automationWebhookUrlEnabled || !config.automationWebhookUrl) return;
    const token = config.whatsAppTokenEnabled ? config.whatsAppToken : undefined;
    await postToAutomationWebhook('whatsapp_auto_reply', leadData, token);
  };

  const triggerProposalAutoSend = async (leadData: LeadData) => {
    if (!config.proposalAutoSendEnabled) return;
    if (!config.automationWebhookUrlEnabled || !config.automationWebhookUrl) return;
    await postToAutomationWebhook('proposal_auto_send', leadData);
  };

  const triggerLeadFollowUp = async (leadData: LeadData) => {
    if (!config.leadFollowUpEnabled) return;
    if (!config.automationWebhookUrlEnabled || !config.automationWebhookUrl) return;
    await postToAutomationWebhook('lead_follow_up', leadData);
  };

  const triggerPaymentConfirmation = async (paymentData: PaymentData) => {
    if (!config.paymentConfirmationEnabled) return;
    if (!config.automationWebhookUrlEnabled || !config.automationWebhookUrl) return;
    await postToAutomationWebhook('payment_confirmation', paymentData);
  };

  const triggerProjectOnboarding = async (projectData: ProjectData) => {
    if (!config.projectOnboardingEnabled) return;
    if (!config.automationWebhookUrlEnabled || !config.automationWebhookUrl) return;
    await postToAutomationWebhook('project_onboarding', projectData);
  };

  return {
    triggerWhatsAppAutoReply,
    triggerProposalAutoSend,
    triggerLeadFollowUp,
    triggerPaymentConfirmation,
    triggerProjectOnboarding,
  };
}
