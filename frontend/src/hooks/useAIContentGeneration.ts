import { useCallback, useState } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';
import { generateActionId, postToWebhook, saveWorkflowExecution } from './useWorkflowExecution';
import type { WorkflowResult } from './useWorkflowExecution';

export function useAIContentGeneration() {
  const { config } = useAIConfig();
  const { addLog } = useWebhookLog();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = useCallback(async (prompt: string, toolName = 'AIContentGeneration'): Promise<WorkflowResult & { content: string }> => {
    const actionId = generateActionId();
    setIsGenerating(true);

    try {
      if (!config.apiEndpoint || !config.apiEndpointEnabled || !config.apiKey || !config.apiKeyEnabled) {
        return {
          action_id: actionId,
          status: 'error',
          message: 'AI API credentials not configured',
          data_logged: false,
          next_steps: ['Configure API Endpoint and API Key in Settings'],
          content: '',
        };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      };

      const body = JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      const payloadSummary = body.slice(0, 200);

      const res = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers,
        body,
      });

      const responseText = await res.text().catch(() => '');

      addLog({
        timestamp: Date.now(),
        url: config.apiEndpoint,
        eventName: toolName,
        payloadSummary,
        statusCode: res.status,
        responseSummary: responseText.slice(0, 200),
        isError: !res.ok,
      });

      if (!res.ok) {
        throw new Error(`AI API failed with status ${res.status}`);
      }

      let content = '';
      try {
        const json = JSON.parse(responseText);
        content = json?.choices?.[0]?.message?.content ?? responseText;
      } catch {
        content = responseText;
      }

      // Post to automation webhook if configured
      if (config.automationWebhookUrlEnabled && config.automationWebhookUrl) {
        const webhookPayload = {
          event: toolName,
          prompt: prompt.slice(0, 200),
          content_length: content.length,
          timestamp: Date.now(),
        };
        await postToWebhook(config.automationWebhookUrl, webhookPayload, config.apiKey, addLog, toolName);
      }

      const result = {
        action_id: actionId,
        status: 'success' as const,
        message: 'Content generated successfully',
        data_logged: true,
        next_steps: ['Review generated content', 'Edit as needed', 'Export or use directly'],
        content,
      };

      saveWorkflowExecution(toolName, { timestamp: Date.now(), result });
      return result;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      return {
        action_id: actionId,
        status: 'error',
        message: errMsg,
        data_logged: false,
        next_steps: ['Check API credentials', 'Verify endpoint URL', 'Try again'],
        content: '',
      };
    } finally {
      setIsGenerating(false);
    }
  }, [config, addLog]);

  return { generateContent, isGenerating };
}
