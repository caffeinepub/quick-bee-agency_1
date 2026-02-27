import { useCallback } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { generateActionId, logWebhookEntry, postToWebhook } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

interface MeetingSchedulingInput {
  leadId?: string | number;
  leadEmail?: string;
  leadName?: string;
}

export function useMeetingSchedulingWorkflow() {
  const { config } = useAIConfig();

  const execute = useCallback(async (input: MeetingSchedulingInput): Promise<WorkflowResult> => {
    const actionId = generateActionId();

    if (!config.calendlyUrl || !config.calendlyEnabled) {
      return {
        action_id: actionId,
        status: 'error',
        message: 'Calendly URL is not configured or disabled.',
        data_logged: false,
        next_steps: 'Configure the Calendly URL in Sales System Configuration and enable it.',
      };
    }

    // Build booking link
    const bookingLink = input.leadEmail
      ? `${config.calendlyUrl}?email=${encodeURIComponent(input.leadEmail)}${input.leadName ? `&name=${encodeURIComponent(input.leadName)}` : ''}`
      : config.calendlyUrl;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(bookingLink);
    } catch {
      // clipboard may not be available in all contexts
    }

    let dataLogged = false;

    // POST to Automation Webhook
    if (config.automationWebhookUrl && config.automationWebhookUrlEnabled) {
      try {
        await postToWebhook(
          config.automationWebhookUrl,
          {
            tool: 'meeting_scheduling',
            calendly_url: bookingLink,
            lead_id: input.leadId,
            lead_email: input.leadEmail,
            timestamp: new Date().toISOString(),
          },
          config.apiKey,
          'Meeting Scheduling'
        );
        dataLogged = true;
      } catch {
        // log already handled in postToWebhook
      }
    } else {
      logWebhookEntry({
        id: generateActionId(),
        timestamp: new Date().toISOString(),
        url: config.automationWebhookUrl || 'not configured',
        payloadSummary: 'Automation webhook not configured or disabled',
        responseStatus: null,
        status: 'error',
        workflowName: 'Meeting Scheduling',
      });
    }

    return {
      action_id: actionId,
      status: 'success',
      message: `Booking link generated and copied to clipboard: ${bookingLink}`,
      data_logged: dataLogged,
      next_steps: 'Share the booking link with the lead via email or chat.',
    };
  }, [config]);

  return { execute, bookingLink: config.calendlyUrl };
}
