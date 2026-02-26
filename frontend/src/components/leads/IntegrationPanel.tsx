import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetIntegrationSettings, useSaveIntegrationSettings } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import IntegrationConfigDialog from './IntegrationConfigDialog';
import { Settings2, Zap } from 'lucide-react';

interface IntegrationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IntegrationEntry {
  name: string;
  description: string;
  icon: string;
  settingKey: 'autoWhatsAppReplies' | 'proposalAutoSend' | 'paymentConfirmation' | 'projectOnboarding' | 'sequenceBuilder';
}

const INTEGRATIONS: IntegrationEntry[] = [
  { name: 'WhatsApp Cloud API', description: 'Auto-reply to incoming WhatsApp messages', icon: '💬', settingKey: 'autoWhatsAppReplies' },
  { name: 'Razorpay', description: 'Payment links and confirmation automation', icon: '💳', settingKey: 'paymentConfirmation' },
  { name: 'Airtable', description: 'Sync leads to Airtable database', icon: '📊', settingKey: 'sequenceBuilder' },
  { name: 'Google Sheets', description: 'Export leads to Google Sheets', icon: '📋', settingKey: 'proposalAutoSend' },
  { name: 'Resend', description: 'Email notifications for lead events', icon: '📧', settingKey: 'projectOnboarding' },
];

export default function IntegrationPanel({ open, onOpenChange }: IntegrationPanelProps) {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? Principal.anonymous();
  const { data: settings } = useGetIntegrationSettings(principal);
  const saveSettings = useSaveIntegrationSettings();
  const [configDialog, setConfigDialog] = useState<string | null>(null);

  const getEnabled = (key: IntegrationEntry['settingKey']): boolean => {
    return settings?.automations?.[key]?.enabled ?? false;
  };

  const handleToggle = async (key: IntegrationEntry['settingKey'], enabled: boolean) => {
    const current = settings ?? {
      stripeEnabled: false,
      razorpayEnabled: false,
      webhookUrl: undefined,
      automations: {
        autoWhatsAppReplies: { enabled: false, config: '' },
        sequenceBuilder: { enabled: false, config: '' },
        proposalAutoSend: { enabled: false, config: '' },
        paymentConfirmation: { enabled: false, config: '' },
        projectOnboarding: { enabled: false, config: '' },
      },
    };

    await saveSettings.mutateAsync({
      ...current,
      automations: {
        ...current.automations,
        [key]: { ...current.automations[key], enabled },
      },
    });
  };

  const handleConfigSave = async (integrationName: string, config: Record<string, string>) => {
    const entry = INTEGRATIONS.find(i => i.name === integrationName);
    if (!entry) return;
    const current = settings ?? {
      stripeEnabled: false,
      razorpayEnabled: false,
      webhookUrl: undefined,
      automations: {
        autoWhatsAppReplies: { enabled: false, config: '' },
        sequenceBuilder: { enabled: false, config: '' },
        proposalAutoSend: { enabled: false, config: '' },
        paymentConfirmation: { enabled: false, config: '' },
        projectOnboarding: { enabled: false, config: '' },
      },
    };
    await saveSettings.mutateAsync({
      ...current,
      automations: {
        ...current.automations,
        [entry.settingKey]: {
          ...current.automations[entry.settingKey],
          config: JSON.stringify(config),
        },
      },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Integrations
            </SheetTitle>
            <SheetDescription>
              Connect external services to automate your CRM workflows.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3">
            {INTEGRATIONS.map((integration, idx) => {
              const enabled = getEnabled(integration.settingKey);
              return (
                <div key={integration.name}>
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{integration.name}</span>
                          <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setConfigDialog(integration.name)}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                      <Switch
                        checked={enabled}
                        onCheckedChange={v => handleToggle(integration.settingKey, v)}
                        disabled={saveSettings.isPending}
                      />
                    </div>
                  </div>
                  {idx < INTEGRATIONS.length - 1 && <div className="h-1" />}
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="text-xs text-muted-foreground text-center">
            Toggling an integration saves settings to the backend. Configure API keys via the ⚙️ button.
          </div>
        </SheetContent>
      </Sheet>

      {configDialog && (
        <IntegrationConfigDialog
          open={!!configDialog}
          onOpenChange={open => !open && setConfigDialog(null)}
          integrationName={configDialog}
          onSave={config => handleConfigSave(configDialog, config)}
        />
      )}
    </>
  );
}
