import { useMutation } from '@tanstack/react-query';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookLog } from '../contexts/WebhookLogContext';

interface WebhookPostPayload {
  toolName: string;
  formData: Record<string, unknown>;
  timestamp?: number;
}

export function useWebhookPost() {
  const { config } = useAIConfig();
  const { addLog } = useWebhookLog();

  return useMutation({
    mutationFn: async (payload: WebhookPostPayload) => {
      const url = config.automationWebhookUrlEnabled && config.automationWebhookUrl
        ? config.automationWebhookUrl
        : config.webhookUrlEnabled && config.webhookUrl
        ? config.webhookUrl
        : null;

      if (!url) throw new Error('No webhook URL configured');

      const body = {
        tool: payload.toolName,
        data: payload.formData,
        timestamp: payload.timestamp ?? Date.now(),
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.apiKeyEnabled && config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const payloadStr = JSON.stringify(body);

      try {
        const res = await fetch(url, { method: 'POST', headers, body: payloadStr });
        const responseText = await res.text().catch(() => '');

        addLog({
          timestamp: Date.now(),
          url,
          eventName: payload.toolName,
          payloadSummary: payloadStr.slice(0, 200),
          statusCode: res.status,
          responseSummary: responseText.slice(0, 200),
          isError: !res.ok,
        });

        if (!res.ok) throw new Error(`Webhook failed with status ${res.status}`);
        return responseText;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Network error';
        addLog({
          timestamp: Date.now(),
          url,
          eventName: payload.toolName,
          payloadSummary: payloadStr.slice(0, 200),
          statusCode: null,
          responseSummary: errMsg.slice(0, 200),
          isError: true,
        });
        throw err;
      }
    },
  });
}
