import { useCallback } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';
import { generateActionId, postToWebhook, saveWorkflowExecution } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

export function useNewLeadSubmissionWorkflow() {
  const { config } = useAIConfig();
  const { addLog } = useWebhookLog();

  const submitLead = useCallback(async (leadData: Record<string, unknown>): Promise<WorkflowResult> => {
    const actionId = generateActionId();
    let dataLogged = false;

    // Post to CRM webhook if configured
    if (config.crmWebhookUrlEnabled && config.crmWebhookUrl) {
      const payload = { event: 'new_lead', ...leadData, timestamp: Date.now() };
      await postToWebhook(config.crmWebhookUrl, payload, config.apiKey, addLog, 'NewLeadCRM');
      dataLogged = true;
    }

    // Post to automation webhook if configured
    if (config.automationWebhookUrlEnabled && config.automationWebhookUrl) {
      const payload = { event: 'new_lead_automation', ...leadData, timestamp: Date.now() };
      await postToWebhook(config.automationWebhookUrl, payload, config.apiKey, addLog, 'NewLeadAutomation');
      dataLogged = true;
    }

    const result: WorkflowResult = {
      action_id: actionId,
      status: 'success',
      message: 'Lead submitted successfully',
      data_logged: dataLogged,
      next_steps: [
        'Lead has been added to CRM',
        'Follow-up sequence will begin',
        'Assign to sales rep',
      ],
    };

    saveWorkflowExecution('NewLeadSubmission', { timestamp: Date.now(), result });
    return result;
  }, [config, addLog]);

  return { submitLead };
}
