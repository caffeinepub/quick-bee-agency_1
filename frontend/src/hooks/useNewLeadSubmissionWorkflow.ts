import { useCallback } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { generateActionId, logWebhookEntry, postToWebhook } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

interface LeadData {
  name: string;
  email: string;
  serviceInterest: string;
  phone?: string;
  channel?: string;
  microNiche?: string;
}

export function useNewLeadSubmissionWorkflow() {
  const { config } = useAIConfig();

  const execute = useCallback(async (leadData: LeadData): Promise<WorkflowResult> => {
    const actionId = generateActionId();

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.serviceInterest) {
      return {
        action_id: actionId,
        status: 'error',
        message: 'Validation failed: name, email, and service interest are required.',
        data_logged: false,
        next_steps: 'Please provide all required fields: name, email, and service interest.',
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return {
        action_id: actionId,
        status: 'error',
        message: 'Validation failed: invalid email address.',
        data_logged: false,
        next_steps: 'Please provide a valid email address.',
      };
    }

    let dataLogged = false;
    const errors: string[] = [];

    // POST to CRM Webhook
    if (config.crmWebhookUrl && config.crmWebhookUrlEnabled) {
      try {
        await postToWebhook(
          config.crmWebhookUrl,
          {
            tool: 'new_lead_submission',
            lead: leadData,
            deduplication: true,
            timestamp: new Date().toISOString(),
          },
          config.apiKey,
          'New Lead Submission (CRM)'
        );
        dataLogged = true;
      } catch {
        errors.push('CRM webhook failed');
      }
    } else {
      logWebhookEntry({
        id: generateActionId(),
        timestamp: new Date().toISOString(),
        url: config.crmWebhookUrl || 'not configured',
        payloadSummary: 'CRM webhook not configured or disabled',
        responseStatus: null,
        status: 'error',
        workflowName: 'New Lead Submission (CRM)',
      });
    }

    // POST to Automation Webhook
    if (config.automationWebhookUrl && config.automationWebhookUrlEnabled) {
      try {
        await postToWebhook(
          config.automationWebhookUrl,
          {
            tool: 'new_lead_submission',
            contact: leadData,
            tags: ['New Lead', leadData.serviceInterest],
            timestamp: new Date().toISOString(),
          },
          config.apiKey,
          'New Lead Submission (Automation)'
        );
        dataLogged = true;
      } catch {
        errors.push('Automation webhook failed');
      }
    } else {
      logWebhookEntry({
        id: generateActionId(),
        timestamp: new Date().toISOString(),
        url: config.automationWebhookUrl || 'not configured',
        payloadSummary: 'Automation webhook not configured or disabled',
        responseStatus: null,
        status: 'error',
        workflowName: 'New Lead Submission (Automation)',
      });
    }

    if (errors.length > 0) {
      return {
        action_id: actionId,
        status: 'pending_review',
        message: `Lead processed with warnings: ${errors.join(', ')}. Configure webhooks for full automation.`,
        data_logged: dataLogged,
        next_steps: 'Configure CRM and Automation webhook URLs in Sales System Configuration to enable full automation.',
      };
    }

    return {
      action_id: actionId,
      status: 'success',
      message: 'Thank you for contacting Quick Bee AI Growth Engine. Our team will review your request and contact you shortly.',
      data_logged: dataLogged,
      next_steps: config.calendlyUrl && config.calendlyEnabled
        ? `You can also book a strategy call here: ${config.calendlyUrl}`
        : 'Our team will contact you within 24 hours.',
    };
  }, [config]);

  return { execute };
}
