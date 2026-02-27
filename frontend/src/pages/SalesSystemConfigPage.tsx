import React, { useState } from 'react';
import { useAIConfig, ConnectionStatus, WebhookConfig } from '../contexts/AIConfigContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Settings, Webhook, Key, MessageSquare, CreditCard, Mail, Link, Zap, Eye, EyeOff, Calendar } from 'lucide-react';

interface FieldConfig {
  key: keyof WebhookConfig;
  enabledKey: keyof WebhookConfig;
  statusKey?: keyof WebhookConfig;
  label: string;
  placeholder: string;
  isSecret?: boolean;
  isUrl?: boolean;
  canTest?: boolean;
  icon: React.ReactNode;
}

const FIELDS: FieldConfig[] = [
  {
    key: 'webhookUrl', enabledKey: 'webhookUrlEnabled', statusKey: 'webhookUrlStatus',
    label: 'Webhook URL (Make.com)', placeholder: 'https://hook.make.com/...', isUrl: true, canTest: true,
    icon: <Webhook className="h-4 w-4" />,
  },
  {
    key: 'apiEndpoint', enabledKey: 'apiEndpointEnabled', statusKey: 'apiEndpointStatus',
    label: 'API Endpoint', placeholder: 'https://api.example.com/v1', isUrl: true,
    icon: <Link className="h-4 w-4" />,
  },
  {
    key: 'apiKey', enabledKey: 'apiKeyEnabled', statusKey: 'apiKeyStatus',
    label: 'API Key', placeholder: 'sk-...', isSecret: true,
    icon: <Key className="h-4 w-4" />,
  },
  {
    key: 'whatsAppToken', enabledKey: 'whatsAppTokenEnabled', statusKey: 'whatsAppTokenStatus',
    label: 'WhatsApp Token', placeholder: 'EAAxxxxx...', isSecret: true,
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    key: 'razorpayKeyId', enabledKey: 'razorpayKeyIdEnabled', statusKey: 'razorpayKeyIdStatus',
    label: 'Razorpay Key ID', placeholder: 'rzp_live_...', isSecret: true,
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    key: 'razorpaySecret', enabledKey: 'razorpaySecretEnabled', statusKey: 'razorpaySecretStatus',
    label: 'Razorpay Secret', placeholder: 'Your Razorpay secret key', isSecret: true,
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    key: 'emailApiKey', enabledKey: 'emailApiKeyEnabled', statusKey: 'emailApiKeyStatus',
    label: 'Email API Key', placeholder: 'SG.xxxxx or key-xxxxx', isSecret: true,
    icon: <Mail className="h-4 w-4" />,
  },
  {
    key: 'crmWebhookUrl', enabledKey: 'crmWebhookUrlEnabled', statusKey: 'crmWebhookUrlStatus',
    label: 'CRM Webhook URL', placeholder: 'https://hook.make.com/crm/...', isUrl: true, canTest: true,
    icon: <Webhook className="h-4 w-4" />,
  },
  {
    key: 'automationWebhookUrl', enabledKey: 'automationWebhookUrlEnabled', statusKey: 'automationWebhookUrlStatus',
    label: 'Automation Webhook URL', placeholder: 'https://hook.make.com/automation/...', isUrl: true, canTest: true,
    icon: <Zap className="h-4 w-4" />,
  },
  {
    key: 'calendlyUrl', enabledKey: 'calendlyEnabled',
    label: 'Calendly URL', placeholder: 'https://calendly.com/your-link', isUrl: true,
    icon: <Calendar className="h-4 w-4" />,
  },
];

function StatusBadge({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') {
    return <Badge className="bg-success/20 text-success border-success/30 text-xs">● Connected</Badge>;
  }
  if (status === 'error') {
    return <Badge variant="destructive" className="text-xs">● Error</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground text-xs">○ Not Configured</Badge>;
}

export default function SalesSystemConfigPage() {
  const { config, setConfig, saveConfig, testConnection } = useAIConfig();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingFields, setTestingFields] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    saveConfig();
    toast.success('Configuration saved successfully!');
  };

  const handleTest = async (fieldKey: 'crmWebhookUrl' | 'automationWebhookUrl' | 'webhookUrl') => {
    setTestingFields(prev => ({ ...prev, [fieldKey]: true }));
    try {
      await testConnection(fieldKey);
      const statusKey = `${fieldKey}Status` as keyof WebhookConfig;
      const status = config[statusKey] as ConnectionStatus;
      if (status === 'connected') {
        toast.success(`Connection to ${fieldKey} successful!`);
      } else {
        toast.error(`Connection to ${fieldKey} failed.`);
      }
    } catch {
      toast.error(`Test connection failed.`);
    } finally {
      setTestingFields(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales System Configuration</h1>
          <p className="text-muted-foreground text-sm">Configure webhook URLs, API keys, and integration credentials for your no-code automation system.</p>
        </div>
      </div>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Integration Credentials
          </CardTitle>
          <CardDescription>
            All values are stored locally in your browser. Toggle each field ON to activate it. Use the Test Connection button to verify webhook URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {FIELDS.map((field, idx) => {
            const value = config[field.key] as string;
            const enabled = config[field.enabledKey] as boolean;
            const status = field.statusKey ? config[field.statusKey] as ConnectionStatus : (enabled && value ? 'connected' : 'not-configured');
            const isShown = showSecrets[field.key as string];

            return (
              <div key={field.key as string}>
                {idx > 0 && <Separator className="mb-6" />}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{field.icon}</span>
                      <Label className="font-medium text-sm">{field.label}</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={enabled && value ? status : 'not-configured'} />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{enabled ? 'ON' : 'OFF'}</span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => setConfig({ [field.enabledKey]: checked } as Partial<WebhookConfig>)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={field.isSecret && !isShown ? 'password' : 'text'}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => setConfig({ [field.key]: e.target.value } as Partial<WebhookConfig>)}
                        disabled={!enabled}
                        className={`pr-10 ${!enabled ? 'opacity-50' : ''}`}
                      />
                      {field.isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleShowSecret(field.key as string)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {isShown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    {field.canTest && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!enabled || !value || testingFields[field.key as string]}
                        onClick={() => handleTest(field.key as 'crmWebhookUrl' | 'automationWebhookUrl' | 'webhookUrl')}
                        className="shrink-0"
                      >
                        {testingFields[field.key as string] ? (
                          <><Loader2 className="h-3 w-3 animate-spin mr-1" />Testing...</>
                        ) : 'Test Connection'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => toast.info('Changes discarded.')}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Settings className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
