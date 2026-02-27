import React, { useState, useCallback } from 'react';
import { useAIConfig, type ConnectionStatus } from '../contexts/AIConfigContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Settings, Key, Globe, MessageSquare, CreditCard, Mail,
  Webhook, Calendar, Save, TestTube, CheckCircle, XCircle,
  AlertCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  isSecret?: boolean;
  enabledKey: string;
  canTest?: boolean;
  description?: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: 'apiEndpoint',
    label: 'AI API Endpoint',
    placeholder: 'https://api.openai.com/v1/chat/completions',
    icon: <Globe className="w-4 h-4" />,
    enabledKey: 'apiEndpointEnabled',
    description: 'OpenAI-compatible API endpoint URL',
  },
  {
    key: 'apiKey',
    label: 'AI API Key',
    placeholder: 'sk-...',
    icon: <Key className="w-4 h-4" />,
    isSecret: true,
    enabledKey: 'apiKeyEnabled',
    description: 'Your OpenAI or compatible API key',
  },
  {
    key: 'whatsAppToken',
    label: 'WhatsApp Token',
    placeholder: 'EAAxxxxxxxx...',
    icon: <MessageSquare className="w-4 h-4" />,
    isSecret: true,
    enabledKey: 'whatsAppTokenEnabled',
    description: 'WhatsApp Business API token',
  },
  {
    key: 'razorpayKeyId',
    label: 'Razorpay Key ID',
    placeholder: 'rzp_live_...',
    icon: <CreditCard className="w-4 h-4" />,
    enabledKey: 'razorpayKeyIdEnabled',
    description: 'Razorpay API key ID',
  },
  {
    key: 'razorpaySecret',
    label: 'Razorpay Secret',
    placeholder: 'Your Razorpay secret key',
    icon: <CreditCard className="w-4 h-4" />,
    isSecret: true,
    enabledKey: 'razorpaySecretEnabled',
    description: 'Razorpay API secret key',
  },
  {
    key: 'emailApiKey',
    label: 'Email API Key',
    placeholder: 'SG.xxxxxxxx or your email API key',
    icon: <Mail className="w-4 h-4" />,
    isSecret: true,
    enabledKey: 'emailApiKeyEnabled',
    description: 'SendGrid or compatible email API key',
  },
  {
    key: 'crmWebhookUrl',
    label: 'CRM Webhook URL',
    placeholder: 'https://hooks.zapier.com/...',
    icon: <Webhook className="w-4 h-4" />,
    enabledKey: 'crmWebhookUrlEnabled',
    canTest: true,
    description: 'Webhook URL for CRM integrations (HubSpot, Notion, etc.)',
  },
  {
    key: 'automationWebhookUrl',
    label: 'Automation Webhook URL',
    placeholder: 'https://hooks.zapier.com/...',
    icon: <Webhook className="w-4 h-4" />,
    enabledKey: 'automationWebhookUrlEnabled',
    canTest: true,
    description: 'Webhook URL for automation triggers (Make, Zapier, n8n)',
  },
  {
    key: 'calendlyUrl',
    label: 'Calendly URL',
    placeholder: 'https://calendly.com/your-name',
    icon: <Calendar className="w-4 h-4" />,
    enabledKey: 'calendlyEnabled',
    description: 'Your Calendly scheduling link',
  },
];

type TestStatusMap = Record<string, ConnectionStatus>;

export default function SalesSystemConfigPage() {
  const { config, setConfig, saveConfig, testConnection } = useAIConfig();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testStatuses, setTestStatuses] = useState<TestStatusMap>({});
  const [isSaving, setIsSaving] = useState(false);

  const toggleSecret = useCallback((key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      saveConfig();
      toast.success('Configuration saved successfully!');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  }, [saveConfig]);

  const handleTest = useCallback(async (fieldKey: string) => {
    const url = config[fieldKey as keyof typeof config] as string;
    if (!url) {
      toast.error('Please enter a URL first');
      return;
    }
    setTestStatuses(prev => ({ ...prev, [fieldKey]: 'testing' }));
    const status = await testConnection(url);
    setTestStatuses(prev => ({ ...prev, [fieldKey]: status }));
    if (status === 'connected') {
      toast.success(`${fieldKey} connection successful!`);
    } else {
      toast.error(`${fieldKey} connection failed`);
    }
  }, [config, testConnection]);

  const getStatusBadge = (fieldConfig: FieldConfig) => {
    const value = config[fieldConfig.key as keyof typeof config] as string;
    const enabled = config[fieldConfig.enabledKey as keyof typeof config] as boolean;
    const testStatus = testStatuses[fieldConfig.key];

    if (testStatus === 'testing') {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Testing...</Badge>;
    }
    if (testStatus === 'connected') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
    }
    if (testStatus === 'error') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    if (!value || !enabled) {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs"><AlertCircle className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Configured</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Sales System Configuration
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your AI, automation, and integration credentials
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save Configuration</>
            )}
          </Button>
        </div>

        {/* Config Fields */}
        <div className="grid gap-4">
          {FIELDS.map((field) => {
            const value = config[field.key as keyof typeof config] as string;
            const enabled = config[field.enabledKey as keyof typeof config] as boolean;
            const isVisible = showSecrets[field.key] ?? false;

            return (
              <Card key={field.key} className="bg-card border-border gold-glow-hover transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {field.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-sm font-semibold text-foreground">{field.label}</Label>
                            {getStatusBadge(field)}
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{enabled ? 'ON' : 'OFF'}</span>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(val) => setConfig({ [field.enabledKey]: val } as Parameters<typeof setConfig>[0])}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={field.isSecret && !isVisible ? 'password' : 'text'}
                            value={value}
                            onChange={(e) => setConfig({ [field.key]: e.target.value } as Parameters<typeof setConfig>[0])}
                            placeholder={field.placeholder}
                            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                          />
                          {field.isSecret && (
                            <button
                              type="button"
                              onClick={() => toggleSecret(field.key)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                        {field.canTest && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTest(field.key)}
                            disabled={testStatuses[field.key] === 'testing' || !value}
                            className="border-border text-foreground hover:bg-primary/10 hover:text-primary whitespace-nowrap"
                          >
                            {testStatuses[field.key] === 'testing' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <><TestTube className="w-4 h-4 mr-1" />Test</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Save Button Bottom */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save All Configuration</>
            )}
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
          <p>© {new Date().getFullYear()} QuickBee Agency. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
