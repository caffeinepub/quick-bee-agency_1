import { useMutation } from '@tanstack/react-query';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';

interface WebhookPostPayload {
  toolName: string;
  formData: Record<string, unknown>;
}

interface WebhookPostResult {
  status: number;
  data: unknown;
}

export function useWebhookPost() {
  const { config } = useAIConfig();
  const { addLogEntry } = useWebhookLog();

  return useMutation<WebhookPostResult, Error, WebhookPostPayload>({
    mutationFn: async ({ toolName, formData }) => {
      const url = (config.webhookUrlEnabled && config.webhookUrl)
        ? config.webhookUrl
        : (config.automationWebhookUrlEnabled && config.automationWebhookUrl)
          ? config.automationWebhookUrl
          : null;

      if (!url) {
        throw new Error('Webhook URL not configured. Please configure in Sales System Config.');
      }

      const apiKey = config.apiKeyEnabled ? config.apiKey : '';
      const payload = {
        toolName,
        timestamp: Date.now(),
        ...formData,
      };

      const payloadSummary = JSON.stringify(payload).slice(0, 200);
      let statusCode: number | null = null;
      let responseSummary = '';
      let isSuccess = false;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        statusCode = response.status;
        isSuccess = response.ok;

        let responseData: unknown;
        try {
          responseData = await response.json();
        } catch {
          responseData = await response.text().catch(() => '');
        }

        responseSummary = JSON.stringify(responseData).slice(0, 200);

        addLogEntry({
          timestamp: Date.now(),
          url,
          eventName: toolName,
          payloadSummary,
          statusCode,
          responseSummary,
          isSuccess,
        });

        if (!response.ok) {
          throw new Error(`Webhook POST to ${url} failed: ${response.status} ${response.statusText}`);
        }

        return { status: response.status, data: responseData };
      } catch (err) {
        if (statusCode === null) {
          addLogEntry({
            timestamp: Date.now(),
            url,
            eventName: toolName,
            payloadSummary,
            statusCode: null,
            responseSummary: err instanceof Error ? err.message : 'Network error',
            isSuccess: false,
          });
        }
        throw err;
      }
    },
  });
}
