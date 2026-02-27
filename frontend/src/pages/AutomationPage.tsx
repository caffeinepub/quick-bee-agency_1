import React from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import {
  MessageSquare, FileText, Users, CreditCard, Rocket,
  Settings, Zap, CheckCircle, XCircle,
} from 'lucide-react';

export default function AutomationPage() {
  const {
    config,
    setWhatsAppAutoReplyEnabled,
    setProposalAutoSendEnabled,
    setLeadFollowUpEnabled,
    setPaymentConfirmationEnabled,
    setProjectOnboardingEnabled,
  } = useAIConfig();
  const navigate = useNavigate();

  const automations = [
    {
      id: 'whatsapp',
      title: 'WhatsApp Auto-Reply',
      description: 'Automatically reply to WhatsApp messages from leads using AI-generated responses based on your service catalog.',
      icon: <MessageSquare className="w-6 h-6" />,
      enabled: config.whatsAppAutoReplyEnabled,
      onToggle: setWhatsAppAutoReplyEnabled,
      color: 'text-green-400',
    },
    {
      id: 'proposal',
      title: 'Proposal Auto-Send',
      description: 'Automatically generate and send proposals to qualified leads when they reach a certain qualification score.',
      icon: <FileText className="w-6 h-6" />,
      enabled: config.proposalAutoSendEnabled,
      onToggle: setProposalAutoSendEnabled,
      color: 'text-primary',
    },
    {
      id: 'followup',
      title: 'Lead Follow-Up Sequences',
      description: "Trigger automated follow-up email and WhatsApp sequences for leads that haven't responded in 24-48 hours.",
      icon: <Users className="w-6 h-6" />,
      enabled: config.leadFollowUpEnabled,
      onToggle: setLeadFollowUpEnabled,
      color: 'text-blue-400',
    },
    {
      id: 'payment',
      title: 'Payment Confirmation',
      description: 'Send automated payment confirmation messages and generate invoices when a payment is successfully processed.',
      icon: <CreditCard className="w-6 h-6" />,
      enabled: config.paymentConfirmationEnabled,
      onToggle: setPaymentConfirmationEnabled,
      color: 'text-yellow-400',
    },
    {
      id: 'onboarding',
      title: 'Project Onboarding',
      description: 'Automatically trigger the client onboarding workflow when a new project is created after payment.',
      icon: <Rocket className="w-6 h-6" />,
      enabled: config.projectOnboardingEnabled,
      onToggle: setProjectOnboardingEnabled,
      color: 'text-purple-400',
    },
  ] as const;

  const enabledCount = automations.filter(a => a.enabled).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              Automation Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Control your automated workflows and triggers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
              {enabledCount}/{automations.length} Active
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
              className="border-border text-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border stat-card-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{enabledCount}</p>
                <p className="text-xs text-muted-foreground">Active Automations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border stat-card-gold">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{automations.length - enabledCount}</p>
                <p className="text-xs text-muted-foreground">Inactive Automations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Cards */}
        <div className="space-y-4">
          {automations.map((automation) => (
            <Card
              key={automation.id}
              className={`bg-card border-border transition-all duration-200 gold-glow-hover ${
                automation.enabled ? 'border-primary/30' : ''
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl bg-card border border-border ${automation.color}`}>
                      {automation.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{automation.title}</h3>
                        <Badge
                          className={automation.enabled
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs'
                          }
                        >
                          {automation.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{automation.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={automation.enabled}
                    onCheckedChange={(checked: boolean) => automation.onToggle(checked)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Webhook Config Notice */}
        {!config.automationWebhookUrl && (
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Settings className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-400">Webhook URL Required</p>
                <p className="text-xs text-muted-foreground">
                  Configure your Automation Webhook URL to enable these automations to fire.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 whitespace-nowrap"
              >
                Configure Now
              </Button>
            </CardContent>
          </Card>
        )}

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
