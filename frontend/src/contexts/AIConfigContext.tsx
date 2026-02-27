import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const STORAGE_KEY = 'quickbee-webhook-config';

export type ConnectionStatus = 'connected' | 'error' | 'not-configured';

export interface WebhookConfig {
  // Core webhook fields
  webhookUrl: string;
  webhookUrlEnabled: boolean;
  apiEndpoint: string;
  apiEndpointEnabled: boolean;
  apiKey: string;
  apiKeyEnabled: boolean;
  whatsAppToken: string;
  whatsAppTokenEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeyIdEnabled: boolean;
  razorpaySecret: string;
  razorpaySecretEnabled: boolean;
  emailApiKey: string;
  emailApiKeyEnabled: boolean;
  crmWebhookUrl: string;
  crmWebhookUrlEnabled: boolean;
  automationWebhookUrl: string;
  automationWebhookUrlEnabled: boolean;

  // Calendly
  calendlyUrl: string;
  calendlyEnabled: boolean;

  // Automation toggles
  whatsAppAutoReplyEnabled: boolean;
  proposalAutoSendEnabled: boolean;
  leadFollowUpEnabled: boolean;
  paymentConfirmationEnabled: boolean;
  projectOnboardingEnabled: boolean;

  // Connection statuses
  webhookUrlStatus: ConnectionStatus;
  apiEndpointStatus: ConnectionStatus;
  apiKeyStatus: ConnectionStatus;
  whatsAppTokenStatus: ConnectionStatus;
  razorpayKeyIdStatus: ConnectionStatus;
  razorpaySecretStatus: ConnectionStatus;
  emailApiKeyStatus: ConnectionStatus;
  crmWebhookUrlStatus: ConnectionStatus;
  automationWebhookUrlStatus: ConnectionStatus;
}

const defaultConfig: WebhookConfig = {
  webhookUrl: '',
  webhookUrlEnabled: false,
  apiEndpoint: '',
  apiEndpointEnabled: false,
  apiKey: '',
  apiKeyEnabled: false,
  whatsAppToken: '',
  whatsAppTokenEnabled: false,
  razorpayKeyId: '',
  razorpayKeyIdEnabled: false,
  razorpaySecret: '',
  razorpaySecretEnabled: false,
  emailApiKey: '',
  emailApiKeyEnabled: false,
  crmWebhookUrl: '',
  crmWebhookUrlEnabled: false,
  automationWebhookUrl: '',
  automationWebhookUrlEnabled: false,

  calendlyUrl: '',
  calendlyEnabled: false,

  whatsAppAutoReplyEnabled: false,
  proposalAutoSendEnabled: false,
  leadFollowUpEnabled: false,
  paymentConfirmationEnabled: false,
  projectOnboardingEnabled: false,

  webhookUrlStatus: 'not-configured',
  apiEndpointStatus: 'not-configured',
  apiKeyStatus: 'not-configured',
  whatsAppTokenStatus: 'not-configured',
  razorpayKeyIdStatus: 'not-configured',
  razorpaySecretStatus: 'not-configured',
  emailApiKeyStatus: 'not-configured',
  crmWebhookUrlStatus: 'not-configured',
  automationWebhookUrlStatus: 'not-configured',
};

interface AIConfigContextType {
  config: WebhookConfig;
  setConfig: (config: Partial<WebhookConfig>) => void;
  saveConfig: () => void;
  isConfigured: () => boolean;
  isFieldConfigured: (fieldName: keyof WebhookConfig) => boolean;
  getFieldValue: (fieldName: keyof WebhookConfig) => string | null;
  clearConfig: () => void;
  testConnection: (fieldName: 'crmWebhookUrl' | 'automationWebhookUrl' | 'webhookUrl') => Promise<void>;
  updateConnectionStatus: (fieldName: keyof WebhookConfig, status: ConnectionStatus) => void;

  // Automation toggle setters
  setWhatsAppAutoReplyEnabled: (enabled: boolean) => void;
  setProposalAutoSendEnabled: (enabled: boolean) => void;
  setLeadFollowUpEnabled: (enabled: boolean) => void;
  setPaymentConfirmationEnabled: (enabled: boolean) => void;
  setProjectOnboardingEnabled: (enabled: boolean) => void;

  // Calendly helpers
  getCalendlyUrl: () => string;
  getCalendlyEnabled: () => boolean;
  setCalendlyUrl: (url: string) => void;
  setCalendlyEnabled: (enabled: boolean) => void;
}

const AIConfigContext = createContext<AIConfigContextType | null>(null);

function loadFromStorage(): WebhookConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultConfig, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaultConfig };
}

export function AIConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<WebhookConfig>(loadFromStorage);

  useEffect(() => {
    // Recompute statuses on load
    const updated = { ...config };
    const fields: Array<{ field: keyof WebhookConfig; statusField: keyof WebhookConfig; enabledField: keyof WebhookConfig }> = [
      { field: 'webhookUrl', statusField: 'webhookUrlStatus', enabledField: 'webhookUrlEnabled' },
      { field: 'apiEndpoint', statusField: 'apiEndpointStatus', enabledField: 'apiEndpointEnabled' },
      { field: 'apiKey', statusField: 'apiKeyStatus', enabledField: 'apiKeyEnabled' },
      { field: 'whatsAppToken', statusField: 'whatsAppTokenStatus', enabledField: 'whatsAppTokenEnabled' },
      { field: 'razorpayKeyId', statusField: 'razorpayKeyIdStatus', enabledField: 'razorpayKeyIdEnabled' },
      { field: 'razorpaySecret', statusField: 'razorpaySecretStatus', enabledField: 'razorpaySecretEnabled' },
      { field: 'emailApiKey', statusField: 'emailApiKeyStatus', enabledField: 'emailApiKeyEnabled' },
      { field: 'crmWebhookUrl', statusField: 'crmWebhookUrlStatus', enabledField: 'crmWebhookUrlEnabled' },
      { field: 'automationWebhookUrl', statusField: 'automationWebhookUrlStatus', enabledField: 'automationWebhookUrlEnabled' },
    ];
    fields.forEach(({ field, statusField, enabledField }) => {
      const val = updated[field] as string;
      const enabled = updated[enabledField] as boolean;
      if (!enabled || !val) {
        (updated as Record<string, unknown>)[statusField as string] = 'not-configured';
      }
    });
    setConfigState(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setConfig = (partial: Partial<WebhookConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...partial };
      return updated;
    });
  };

  const saveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  };

  const isConfigured = () => {
    return (config.webhookUrlEnabled && !!config.webhookUrl) ||
      (config.apiEndpointEnabled && !!config.apiEndpoint && config.apiKeyEnabled && !!config.apiKey);
  };

  const isFieldConfigured = (fieldName: keyof WebhookConfig): boolean => {
    const enabledKey = `${fieldName as string}Enabled` as keyof WebhookConfig;
    const val = config[fieldName] as string;
    const enabled = config[enabledKey] as boolean;
    return enabled && !!val;
  };

  const getFieldValue = (fieldName: keyof WebhookConfig): string | null => {
    const enabledKey = `${fieldName as string}Enabled` as keyof WebhookConfig;
    const val = config[fieldName] as string;
    const enabled = config[enabledKey] as boolean;
    if (!enabled || !val) return null;
    return val;
  };

  const clearConfig = () => {
    setConfigState({ ...defaultConfig });
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateConnectionStatus = (fieldName: keyof WebhookConfig, status: ConnectionStatus) => {
    setConfigState(prev => ({ ...prev, [fieldName]: status }));
  };

  const testConnection = async (fieldName: 'crmWebhookUrl' | 'automationWebhookUrl' | 'webhookUrl') => {
    const statusField = `${fieldName}Status` as keyof WebhookConfig;
    const url = config[fieldName] as string;
    if (!url) {
      updateConnectionStatus(statusField, 'not-configured');
      return;
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test', timestamp: Date.now() }),
      });
      if (response.ok) {
        updateConnectionStatus(statusField, 'connected');
      } else {
        updateConnectionStatus(statusField, 'error');
      }
    } catch {
      updateConnectionStatus(statusField, 'error');
    }
  };

  const setWhatsAppAutoReplyEnabled = (enabled: boolean) => {
    setConfigState(prev => {
      const updated = { ...prev, whatsAppAutoReplyEnabled: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setProposalAutoSendEnabled = (enabled: boolean) => {
    setConfigState(prev => {
      const updated = { ...prev, proposalAutoSendEnabled: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setLeadFollowUpEnabled = (enabled: boolean) => {
    setConfigState(prev => {
      const updated = { ...prev, leadFollowUpEnabled: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setPaymentConfirmationEnabled = (enabled: boolean) => {
    setConfigState(prev => {
      const updated = { ...prev, paymentConfirmationEnabled: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setProjectOnboardingEnabled = (enabled: boolean) => {
    setConfigState(prev => {
      const updated = { ...prev, projectOnboardingEnabled: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getCalendlyUrl = () => config.calendlyUrl;
  const getCalendlyEnabled = () => config.calendlyEnabled;

  const setCalendlyUrl = (calendlyUrl: string) => {
    setConfigState(prev => {
      const updated = { ...prev, calendlyUrl };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setCalendlyEnabled = (calendlyEnabled: boolean) => {
    setConfigState(prev => {
      const updated = { ...prev, calendlyEnabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AIConfigContext.Provider value={{
      config,
      setConfig,
      saveConfig,
      isConfigured,
      isFieldConfigured,
      getFieldValue,
      clearConfig,
      testConnection,
      updateConnectionStatus,
      setWhatsAppAutoReplyEnabled,
      setProposalAutoSendEnabled,
      setLeadFollowUpEnabled,
      setPaymentConfirmationEnabled,
      setProjectOnboardingEnabled,
      getCalendlyUrl,
      getCalendlyEnabled,
      setCalendlyUrl,
      setCalendlyEnabled,
    }}>
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig() {
  const ctx = useContext(AIConfigContext);
  if (!ctx) throw new Error('useAIConfig must be used within AIConfigProvider');
  return ctx;
}
