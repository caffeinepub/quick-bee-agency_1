import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetIntegrationSettings, useSaveIntegrationSettings, useGetSalesSystemConfig } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Zap,
  MessageSquare,
  FileText,
  UserCheck,
  CreditCard,
  FolderOpen,
  Settings2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Wand2,
  Brain,
  TrendingUp,
  MessageCircle,
  Star,
} from 'lucide-react';
import SalesSystemConfigDialog from '../components/automation/SalesSystemConfigDialog';
import type { IntegrationSettings, SalesSystemConfig } from '../backend';
import { toast } from 'sonner';

const defaultAutomationConfig = { enabled: false, config: '' };

const defaultIntegrationSettings: IntegrationSettings = {
  stripeEnabled: false,
  razorpayEnabled: false,
  webhookUrl: undefined,
  automations: {
    autoWhatsAppReplies: defaultAutomationConfig,
    sequenceBuilder: defaultAutomationConfig,
    proposalAutoSend: defaultAutomationConfig,
    paymentConfirmation: defaultAutomationConfig,
    projectOnboarding: defaultAutomationConfig,
  },
};

const defaultSalesSystemConfig: SalesSystemConfig = {
  systemName: 'AI Sales System',
  description: 'Configure your AI-powered sales automation',
  enabled: true,
  apiEndpoint: '',
  apiKey: '',
  systemSettings: '',
};

interface AutomationRule {
  key: keyof IntegrationSettings['automations'];
  label: string;
  description: string;
  icon: React.ReactNode;
}

const automationRules: AutomationRule[] = [
  {
    key: 'autoWhatsAppReplies',
    label: 'WhatsApp Auto-Reply',
    description: 'Automatically respond to WhatsApp messages from leads and clients',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    key: 'proposalAutoSend',
    label: 'Proposal Auto-Send',
    description: 'Automatically send proposals when leads reach qualified status',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    key: 'sequenceBuilder',
    label: 'Lead Follow-Up Sequences',
    description: 'Automated follow-up message sequences for nurturing leads',
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    key: 'paymentConfirmation',
    label: 'Payment Confirmation',
    description: 'Send automated payment confirmation and receipt messages',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    key: 'projectOnboarding',
    label: 'Project Onboarding',
    description: 'Trigger onboarding workflows when new projects are created',
    icon: <FolderOpen className="h-5 w-5" />,
  },
];

interface AISalesSystem {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const aiSalesSystems: AISalesSystem[] = [
  {
    key: 'serviceRecommendation',
    label: 'Service Recommendation',
    description: 'AI-powered service matching based on client needs and budget',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    key: 'proposalGenerator',
    label: 'Proposal Generator',
    description: 'Generate professional proposals automatically from client data',
    icon: <Wand2 className="h-5 w-5" />,
  },
  {
    key: 'pricingStrategy',
    label: 'Pricing Strategy',
    description: 'AI-driven pricing recommendations based on market data',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    key: 'closingScript',
    label: 'Closing Scripts',
    description: 'Generate personalized closing scripts for each prospect',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    key: 'followUpMessages',
    label: 'Follow-Up Messages',
    description: 'Automated follow-up message generation and scheduling',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    key: 'leadQualification',
    label: 'Lead Qualification',
    description: 'AI-powered lead scoring and qualification analysis',
    icon: <Star className="h-5 w-5" />,
  },
];

export default function AutomationPage() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal().toString();

  const { data: integrationSettings, isLoading: settingsLoading } = useGetIntegrationSettings(userId);
  const { data: salesSystemConfig, isLoading: configLoading } = useGetSalesSystemConfig(userId);
  const saveIntegrationSettings = useSaveIntegrationSettings();

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<{ label: string; config: SalesSystemConfig } | null>(null);

  const currentSettings: IntegrationSettings = integrationSettings ?? defaultIntegrationSettings;
  const currentConfig: SalesSystemConfig = salesSystemConfig ?? defaultSalesSystemConfig;

  const handleToggleAutomation = async (key: keyof IntegrationSettings['automations'], enabled: boolean) => {
    const updated: IntegrationSettings = {
      ...currentSettings,
      automations: {
        ...currentSettings.automations,
        [key]: {
          ...currentSettings.automations[key],
          enabled,
        },
      },
    };

    try {
      await saveIntegrationSettings.mutateAsync(updated);
      toast.success(`${automationRules.find((r) => r.key === key)?.label} ${enabled ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update automation setting');
    }
  };

  const handleOpenSystemConfig = (system: AISalesSystem) => {
    setSelectedSystem({
      label: system.label,
      config: {
        ...currentConfig,
        systemName: system.label,
        description: system.description,
      },
    });
    setConfigDialogOpen(true);
  };

  const isLoading = settingsLoading || configLoading;

  const getIntegrationStatus = () => {
    const hasEndpoint = currentConfig.apiEndpoint && currentConfig.apiEndpoint !== '' && currentConfig.apiEndpoint !== 'YOUR_API_KEY';
    const hasKey = currentConfig.apiKey && currentConfig.apiKey !== '' && currentConfig.apiKey !== 'YOUR_API_KEY';
    if (hasEndpoint && hasKey) return 'connected';
    if (hasEndpoint || hasKey) return 'partial';
    return 'disconnected';
  };

  const integrationStatus = getIntegrationStatus();
  const activeAutomationsCount = Object.values(currentSettings.automations).filter((a) => a.enabled).length;

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            Automation Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure AI-powered sales automation and integration settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              integrationStatus === 'connected'
                ? 'border-primary text-primary bg-primary/10'
                : integrationStatus === 'partial'
                ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                : 'border-muted-foreground text-muted-foreground'
            }
          >
            {integrationStatus === 'connected' ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : integrationStatus === 'partial' ? (
              <AlertCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {integrationStatus === 'connected' ? 'AI Connected' : integrationStatus === 'partial' ? 'Partial Config' : 'Not Configured'}
          </Badge>
          <Badge variant="outline" className="border-primary text-primary bg-primary/10">
            {activeAutomationsCount} Active Rules
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sales System Config + Integration Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sales System Configuration Panel */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Sales System Config
              </CardTitle>
              <CardDescription>Configure your AI sales API credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">API Endpoint</span>
                      <span className={`text-xs font-mono truncate max-w-[120px] ${currentConfig.apiEndpoint && currentConfig.apiEndpoint !== 'YOUR_API_KEY' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {currentConfig.apiEndpoint && currentConfig.apiEndpoint !== 'YOUR_API_KEY'
                          ? currentConfig.apiEndpoint.replace(/^https?:\/\//, '').substring(0, 20) + '...'
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">API Key</span>
                      <span className={`text-xs ${currentConfig.apiKey && currentConfig.apiKey !== 'YOUR_API_KEY' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {currentConfig.apiKey && currentConfig.apiKey !== 'YOUR_API_KEY' ? '••••••••' : 'Not set'}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Integration Status */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Integration Status</p>
                    <div className="flex items-center gap-2">
                      {integrationStatus === 'connected' ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : integrationStatus === 'partial' ? (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-foreground">
                        {integrationStatus === 'connected'
                          ? 'AI system connected and ready'
                          : integrationStatus === 'partial'
                          ? 'Incomplete configuration'
                          : 'No AI system configured'}
                      </span>
                    </div>
                    {integrationStatus !== 'connected' && (
                      <p className="text-xs text-muted-foreground">
                        Configure your API endpoint and key to enable AI-powered features
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                    onClick={() => {
                      setSelectedSystem({
                        label: 'AI Sales System',
                        config: currentConfig,
                      });
                      setConfigDialogOpen(true);
                    }}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Configure API
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Automations</span>
                <span className="text-sm font-semibold text-primary">{activeAutomationsCount} / {automationRules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Systems</span>
                <span className="text-sm font-semibold text-primary">{aiSalesSystems.length} Available</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <span className={`text-sm font-semibold ${integrationStatus === 'connected' ? 'text-primary' : 'text-muted-foreground'}`}>
                  {integrationStatus === 'connected' ? 'Online' : 'Offline'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Automation Rules + AI Systems */}
        <div className="lg:col-span-2 space-y-6">
          {/* Automation Rules */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Automation Rules
              </CardTitle>
              <CardDescription>Toggle automated workflows for your sales pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                      <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                automationRules.map((rule, idx) => {
                  const isEnabled = currentSettings.automations[rule.key]?.enabled ?? false;
                  return (
                    <React.Fragment key={rule.key}>
                      {idx > 0 && <Separator className="my-1" />}
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-0.5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                            {rule.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{rule.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {isEnabled && (
                            <Badge variant="outline" className="text-xs border-primary text-primary bg-primary/10 hidden sm:flex">
                              Active
                            </Badge>
                          )}
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleToggleAutomation(rule.key, checked)}
                            disabled={saveIntegrationSettings.isPending}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* AI Sales Systems */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Sales Systems
              </CardTitle>
              <CardDescription>Configure individual AI-powered sales tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiSalesSystems.map((system) => (
                  <div
                    key={system.key}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                    onClick={() => handleOpenSystemConfig(system)}
                  >
                    <div className="text-primary mt-0.5 group-hover:scale-110 transition-transform">
                      {system.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{system.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{system.description}</p>
                    </div>
                    <Settings2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Config Dialog */}
      {selectedSystem && (
        <SalesSystemConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          systemLabel={selectedSystem.label}
          config={{ apiEndpoint: selectedSystem.config.apiEndpoint, apiKey: selectedSystem.config.apiKey }}
          onSave={() => {
            setConfigDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
