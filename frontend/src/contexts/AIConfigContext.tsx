import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface WebhookConfig {
  // Core AI API
  apiEndpoint: string;
  apiEndpointEnabled: boolean;
  apiKey: string;
  apiKeyEnabled: boolean;

  // WhatsApp
  whatsAppToken: string;
  whatsAppTokenEnabled: boolean;

  // Razorpay
  razorpayKeyId: string;
  razorpayKeyIdEnabled: boolean;
  razorpaySecret: string;
  razorpaySecretEnabled: boolean;

  // Email
  emailApiKey: string;
  emailApiKeyEnabled: boolean;

  // CRM Webhook
  crmWebhookUrl: string;
  crmWebhookUrlEnabled: boolean;

  // Automation Webhook
  automationWebhookUrl: string;
  automationWebhookUrlEnabled: boolean;

  // Calendly
  calendlyUrl: string;
  calendlyEnabled: boolean;

  // Legacy webhookUrl
  webhookUrl: string;
  webhookUrlEnabled: boolean;

  // Automation toggles
  whatsAppAutoReplyEnabled: boolean;
  proposalAutoSendEnabled: boolean;
  leadFollowUpEnabled: boolean;
  paymentConfirmationEnabled: boolean;
  projectOnboardingEnabled: boolean;
}

export type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'error';

export interface AIConfigContextType {
  config: WebhookConfig;
  setConfig: (updates: Partial<WebhookConfig>) => void;
  saveConfig: () => void;
  isConfigured: () => boolean;
  isFieldConfigured: (field: keyof WebhookConfig) => boolean;
  testConnection: (url: string) => Promise<ConnectionStatus>;

  // Automation toggle setters
  setWhatsAppAutoReplyEnabled: (val: boolean) => void;
  setProposalAutoSendEnabled: (val: boolean) => void;
  setLeadFollowUpEnabled: (val: boolean) => void;
  setPaymentConfirmationEnabled: (val: boolean) => void;
  setProjectOnboardingEnabled: (val: boolean) => void;

  // Calendly helpers
  setCalendlyUrl: (url: string) => void;
  setCalendlyEnabled: (val: boolean) => void;
}

const STORAGE_KEY = 'qba_ai_config';

const defaultConfig: WebhookConfig = {
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
  webhookUrl: '',
  webhookUrlEnabled: false,
  whatsAppAutoReplyEnabled: false,
  proposalAutoSendEnabled: false,
  leadFollowUpEnabled: false,
  paymentConfirmationEnabled: false,
  projectOnboardingEnabled: false,
};

function loadFromStorage(): WebhookConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw);
    return { ...defaultConfig, ...parsed };
  } catch {
    return defaultConfig;
  }
}

function saveToStorage(config: WebhookConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

const AIConfigContext = createContext<AIConfigContextType | null>(null);

export function AIConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<WebhookConfig>(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    saveToStorage(config);
  }, [config]);

  const setConfig = useCallback((updates: Partial<WebhookConfig>) => {
    setConfigState(prev => ({ ...prev, ...updates }));
  }, []);

  const saveConfig = useCallback(() => {
    saveToStorage(config);
  }, [config]);

  const isConfigured = useCallback(() => {
    return !!(config.apiEndpoint && config.apiEndpointEnabled && config.apiKey && config.apiKeyEnabled);
  }, [config]);

  const isFieldConfigured = useCallback((field: keyof WebhookConfig) => {
    const val = config[field];
    if (typeof val === 'boolean') return val;
    return typeof val === 'string' && val.trim().length > 0;
  }, [config]);

  const testConnection = useCallback(async (url: string): Promise<ConnectionStatus> => {
    if (!url) return 'error';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test', timestamp: Date.now() }),
      });
      return res.ok ? 'connected' : 'error';
    } catch {
      return 'error';
    }
  }, []);

  const setWhatsAppAutoReplyEnabled = useCallback((val: boolean) => {
    setConfigState(prev => ({ ...prev, whatsAppAutoReplyEnabled: val }));
  }, []);

  const setProposalAutoSendEnabled = useCallback((val: boolean) => {
    setConfigState(prev => ({ ...prev, proposalAutoSendEnabled: val }));
  }, []);

  const setLeadFollowUpEnabled = useCallback((val: boolean) => {
    setConfigState(prev => ({ ...prev, leadFollowUpEnabled: val }));
  }, []);

  const setPaymentConfirmationEnabled = useCallback((val: boolean) => {
    setConfigState(prev => ({ ...prev, paymentConfirmationEnabled: val }));
  }, []);

  const setProjectOnboardingEnabled = useCallback((val: boolean) => {
    setConfigState(prev => ({ ...prev, projectOnboardingEnabled: val }));
  }, []);

  const setCalendlyUrl = useCallback((url: string) => {
    setConfigState(prev => ({ ...prev, calendlyUrl: url }));
  }, []);

  const setCalendlyEnabled = useCallback((val: boolean) => {
    setConfigState(prev => ({ ...prev, calendlyEnabled: val }));
  }, []);

  return (
    <AIConfigContext.Provider
      value={{
        config,
        setConfig,
        saveConfig,
        isConfigured,
        isFieldConfigured,
        testConnection,
        setWhatsAppAutoReplyEnabled,
        setProposalAutoSendEnabled,
        setLeadFollowUpEnabled,
        setPaymentConfirmationEnabled,
        setProjectOnboardingEnabled,
        setCalendlyUrl,
        setCalendlyEnabled,
      }}
    >
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig(): AIConfigContextType {
  const ctx = useContext(AIConfigContext);
  if (!ctx) throw new Error('useAIConfig must be used within AIConfigProvider');
  return ctx;
}
