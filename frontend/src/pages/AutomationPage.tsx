import React from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  MessageSquare, FileText, Users, CreditCard, Rocket,
  Zap, Settings, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface AutomationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  webhookConfigured: boolean;
  color: string;
}

function AutomationCard({ icon, title, description, enabled, onToggle, webhookConfigured, color }: AutomationCardProps) {
  return (
    <Card className={`card-glass transition-all duration-200 ${enabled ? 'ring-1 ring-primary/30' : ''}`}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2.5 rounded-lg ${color} shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                {enabled ? (
                  <Badge className="bg-success/20 text-success border-success/30 text-xs">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-xs">Inactive</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              {!webhookConfigured && enabled && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>Automation Webhook URL not configured</span>
                </div>
              )}
              {webhookConfigured && enabled && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Ready to fire</span>
                </div>
              )}
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="shrink-0 mt-0.5"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AutomationPage() {
  const navigate = useNavigate();
  const {
    config,
    setWhatsAppAutoReplyEnabled,
    setProposalAutoSendEnabled,
    setLeadFollowUpEnabled,
    setPaymentConfirmationEnabled,
    setProjectOnboardingEnabled,
  } = useAIConfig();

  const webhookConfigured = config.automationWebhookUrlEnabled && !!config.automationWebhookUrl;

  const handleToggle = (setter: (v: boolean) => void, name: string) => (enabled: boolean) => {
    setter(enabled);
    toast.success(`${name} ${enabled ? 'enabled' : 'disabled'}`);
  };

  const automations = [
    {
      icon: <MessageSquare className="h-5 w-5 text-green-600" />,
      title: 'WhatsApp Auto-Reply',
      description: 'Automatically send WhatsApp messages when a new lead is created or updated. Requires WhatsApp Token to be configured.',
      enabled: config.whatsAppAutoReplyEnabled,
      onToggle: handleToggle(setWhatsAppAutoReplyEnabled, 'WhatsApp Auto-Reply'),
      color: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      title: 'Proposal Auto-Send',
      description: 'Automatically send a proposal via webhook when a lead is marked as Qualified.',
      enabled: config.proposalAutoSendEnabled,
      onToggle: handleToggle(setProposalAutoSendEnabled, 'Proposal Auto-Send'),
      color: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      title: 'Lead Follow-Up Sequences',
      description: 'Trigger automated follow-up message sequences for leads at any pipeline stage.',
      enabled: config.leadFollowUpEnabled,
      onToggle: handleToggle(setLeadFollowUpEnabled, 'Lead Follow-Up Sequences'),
      color: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: <CreditCard className="h-5 w-5 text-orange-600" />,
      title: 'Payment Confirmation',
      description: 'Send payment confirmation notifications via webhook after a successful Razorpay payment.',
      enabled: config.paymentConfirmationEnabled,
      onToggle: handleToggle(setPaymentConfirmationEnabled, 'Payment Confirmation'),
      color: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      icon: <Rocket className="h-5 w-5 text-cyan-600" />,
      title: 'Project Onboarding',
      description: 'Trigger project onboarding workflow via webhook after payment is confirmed.',
      enabled: config.projectOnboardingEnabled,
      onToggle: handleToggle(setProjectOnboardingEnabled, 'Project Onboarding'),
      color: 'bg-cyan-100 dark:bg-cyan-900/30',
    },
  ];

  const activeCount = automations.filter(a => a.enabled).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automation Center</h1>
            <p className="text-muted-foreground text-sm">Configure webhook-driven automations powered by Make.com</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{activeCount}/{automations.length} Active</Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
          >
            <Settings className="h-4 w-4" />
            Configure Webhooks
          </Button>
        </div>
      </div>

      {!webhookConfigured && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-amber-800 dark:text-amber-200">Automation Webhook URL not configured</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Automations will not fire until you configure the Automation Webhook URL in Sales System Config.
                  <button
                    className="ml-1 underline font-medium"
                    onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
                  >
                    Configure now →
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {automations.map((automation) => (
          <AutomationCard
            key={automation.title}
            {...automation}
            webhookConfigured={webhookConfigured}
          />
        ))}
      </div>

      <Separator />

      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            How It Works
          </CardTitle>
          <CardDescription>
            This is a no-code webhook-driven automation system. QuickBee handles the UI and Make.com handles the automation logic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Configure your Make.com webhook URL in <strong className="text-foreground">Sales System Config</strong></li>
            <li>Toggle ON the automations you want to activate above</li>
            <li>When a trigger event occurs (lead created, payment confirmed, etc.), QuickBee sends a POST request to your webhook</li>
            <li>Make.com receives the payload and executes your automation scenario</li>
            <li>Monitor all webhook calls in the <strong className="text-foreground">Webhook Logs</strong> page</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
