import { useCallback } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';
import { generateActionId, postToWebhook, saveWorkflowExecution } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

export function useMeetingSchedulingWorkflow() {
  const { config } = useAIConfig();
  const { addLog } = useWebhookLog();

  const scheduleMeeting = useCallback(async (data: Record<string, unknown>): Promise<WorkflowResult & { calendlyLink: string }> => {
    const actionId = generateActionId();
    const calendlyLink = config.calendlyEnabled && config.calendlyUrl
      ? config.calendlyUrl
      : 'https://calendly.com/quickbeeagency';

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(calendlyLink);
    } catch {
      // ignore clipboard errors
    }

    let dataLogged = false;
    if (config.automationWebhookUrlEnabled && config.automationWebhookUrl) {
      const payload = { event: 'meeting_scheduled', calendly_link: calendlyLink, ...data, timestamp: Date.now() };
      await postToWebhook(config.automationWebhookUrl, payload, config.apiKey, addLog, 'MeetingScheduled');
      dataLogged = true;
    }

    const result = {
      action_id: actionId,
      status: 'success' as const,
      message: `Meeting link generated: ${calendlyLink}`,
      data_logged: dataLogged,
      next_steps: [
        'Share the Calendly link with the client',
        'Link has been copied to clipboard',
        'Follow up after meeting',
      ],
      calendlyLink,
    };

    saveWorkflowExecution('MeetingScheduling', { timestamp: Date.now(), result });
    return result;
  }, [config, addLog]);

  return { scheduleMeeting };
}
