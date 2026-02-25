import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Zap,
  Link2,
  Webhook,
  Key,
  Copy,
  Check,
  Save,
  Loader2,
  RefreshCw,
  Globe,
  Table2,
  MessageSquare,
  Code2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Send,
  CreditCard,
  Users,
  ListOrdered,
} from 'lucide-react';
import { SiZapier, SiSlack, SiGooglesheets, SiWhatsapp } from 'react-icons/si';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetIntegrationSettings, useSaveIntegrationSettings } from '../hooks/useQueries';
import type { IntegrationSettings, AutomationConfig } from '../backend';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SequenceStep {
  name: string;
  delayDays: number;
}

interface WhatsAppConfig {
  apiKey: string;
  webhookUrl: string;
}

interface ProposalConfig {
  triggerStatus: string;
}

interface PaymentConfirmConfig {
  notifyInApp: boolean;
  notifyEmail: boolean;
}

interface OnboardingConfig {
  triggerEvent: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateApiKey(seed: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  let result = 'qb_live_';
  let h = Math.abs(hash);
  for (let i = 0; i < 32; i++) {
    result += chars[h % chars.length];
    h = Math.floor(h / chars.length) + (i * 7919);
    if (h === 0) h = seed.charCodeAt(i % seed.length) + i + 1;
  }
  return result;
}

function safeParseJson<T>(json: string, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ─── Default config values ────────────────────────────────────────────────────

const defaultWhatsApp: WhatsAppConfig = { apiKey: '', webhookUrl: '' };
const defaultSequenceSteps: SequenceStep[] = [];
const defaultProposal: ProposalConfig = { triggerStatus: 'Qualified' };
const defaultPaymentConfirm: PaymentConfirmConfig = { notifyInApp: true, notifyEmail: false };
const defaultOnboarding: OnboardingConfig = { triggerEvent: 'payment_confirmed' };

const defaultAutomationConfig: AutomationConfig = { enabled: false, config: '' };

const defaultAutomations = {
  autoWhatsAppReplies: defaultAutomationConfig,
  sequenceBuilder: defaultAutomationConfig,
  proposalAutoSend: defaultAutomationConfig,
  paymentConfirmation: defaultAutomationConfig,
  projectOnboarding: defaultAutomationConfig,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface AutomationCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  isSaving: boolean;
  children?: React.ReactNode;
}

function AutomationCard({
  icon,
  iconColor,
  title,
  description,
  enabled,
  onToggle,
  isSaving,
  children,
}: AutomationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="glass-panel border-border transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ${iconColor}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-foreground text-base">{title}</CardTitle>
                <Badge
                  variant={enabled ? 'default' : 'outline'}
                  className={`text-xs px-1.5 py-0 ${enabled ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground'}`}
                >
                  {enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground text-sm mt-0.5">
                {description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            <Switch checked={enabled} onCheckedChange={onToggle} disabled={isSaving} />
            {children && (
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                onClick={() => setExpanded((p) => !p)}
                title={expanded ? 'Collapse' : 'Configure'}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {children && expanded && (
        <CardContent className="pt-0 border-t border-border/50 mt-1">
          <div className="pt-4">{children}</div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Integration cards (Zapier, Slack, etc.) ──────────────────────────────────

interface IntegrationCardDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const INTEGRATIONS: IntegrationCardDef[] = [
  {
    id: 'zapierEnabled',
    name: 'Zapier',
    description: 'Connect with 5,000+ apps via Zapier workflows and automate repetitive tasks.',
    icon: <SiZapier className="w-5 h-5" />,
    color: 'text-orange-400',
  },
  {
    id: 'googleSheetsEnabled',
    name: 'Google Sheets',
    description: 'Sync leads and CRM data automatically to Google Sheets for reporting.',
    icon: <SiGooglesheets className="w-5 h-5" />,
    color: 'text-green-400',
  },
  {
    id: 'slackEnabled',
    name: 'Slack',
    description: 'Get real-time notifications in Slack for new leads, payments, and updates.',
    icon: <SiSlack className="w-5 h-5" />,
    color: 'text-purple-400',
  },
  {
    id: 'webhooksEnabled',
    name: 'Webhooks',
    description: 'Send HTTP POST events to any endpoint when key actions occur in your account.',
    icon: <Webhook className="w-5 h-5" />,
    color: 'text-primary',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AutomationPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;

  const { data: savedSettings, isLoading: settingsLoading } = useGetIntegrationSettings(principal);
  const saveSettings = useSaveIntegrationSettings();

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [zapierEnabled, setZapierEnabled] = useState(false);
  const [googleSheetsEnabled, setGoogleSheetsEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [webhooksEnabled, setWebhooksEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookUrlDraft, setWebhookUrlDraft] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // ── Automation states ───────────────────────────────────────────────────────
  // WhatsApp
  const [waEnabled, setWaEnabled] = useState(false);
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(defaultWhatsApp);

  // Sequence Builder
  const [seqEnabled, setSeqEnabled] = useState(false);
  const [seqSteps, setSeqSteps] = useState<SequenceStep[]>(defaultSequenceSteps);

  // Proposal Auto-Send
  const [propEnabled, setPropEnabled] = useState(false);
  const [propConfig, setPropConfig] = useState<ProposalConfig>(defaultProposal);

  // Payment Confirmation
  const [payEnabled, setPayEnabled] = useState(false);
  const [payConfig, setPayConfig] = useState<PaymentConfirmConfig>(defaultPaymentConfirm);

  // Project Onboarding
  const [onbEnabled, setOnbEnabled] = useState(false);
  const [onbConfig, setOnbConfig] = useState<OnboardingConfig>(defaultOnboarding);

  const apiKey = principal ? generateApiKey(principal.toString()) : 'qb_live_••••••••••••••••••••••••••••••••';

  // ── Sync saved settings → local state ──────────────────────────────────────
  useEffect(() => {
    if (!savedSettings) return;
    setWebhookUrl(savedSettings.webhookUrl ?? '');
    setWebhookUrlDraft(savedSettings.webhookUrl ?? '');

    const automations = savedSettings.automations ?? defaultAutomations;

    // WhatsApp
    setWaEnabled(automations.autoWhatsAppReplies?.enabled ?? false);
    setWaConfig(safeParseJson(automations.autoWhatsAppReplies?.config ?? '', defaultWhatsApp));

    // Sequence
    setSeqEnabled(automations.sequenceBuilder?.enabled ?? false);
    setSeqSteps(safeParseJson(automations.sequenceBuilder?.config ?? '', defaultSequenceSteps));

    // Proposal
    setPropEnabled(automations.proposalAutoSend?.enabled ?? false);
    setPropConfig(safeParseJson(automations.proposalAutoSend?.config ?? '', defaultProposal));

    // Payment
    setPayEnabled(automations.paymentConfirmation?.enabled ?? false);
    setPayConfig(safeParseJson(automations.paymentConfirmation?.config ?? '', defaultPaymentConfirm));

    // Onboarding
    setOnbEnabled(automations.projectOnboarding?.enabled ?? false);
    setOnbConfig(safeParseJson(automations.projectOnboarding?.config ?? '', defaultOnboarding));
  }, [savedSettings]);

  // ── Build full settings object ──────────────────────────────────────────────
  const buildSettings = useCallback(
    (overrides?: Partial<{
      waEnabled: boolean; waConfig: WhatsAppConfig;
      seqEnabled: boolean; seqSteps: SequenceStep[];
      propEnabled: boolean; propConfig: ProposalConfig;
      payEnabled: boolean; payConfig: PaymentConfirmConfig;
      onbEnabled: boolean; onbConfig: OnboardingConfig;
      webhookUrlDraft: string;
    }>): IntegrationSettings => {
      const wa = overrides?.waEnabled ?? waEnabled;
      const waCfg = overrides?.waConfig ?? waConfig;
      const seq = overrides?.seqEnabled ?? seqEnabled;
      const seqCfg = overrides?.seqSteps ?? seqSteps;
      const prop = overrides?.propEnabled ?? propEnabled;
      const propCfg = overrides?.propConfig ?? propConfig;
      const pay = overrides?.payEnabled ?? payEnabled;
      const payCfg = overrides?.payConfig ?? payConfig;
      const onb = overrides?.onbEnabled ?? onbEnabled;
      const onbCfg = overrides?.onbConfig ?? onbConfig;
      const whu = overrides?.webhookUrlDraft ?? webhookUrlDraft;

      return {
        stripeEnabled: savedSettings?.stripeEnabled ?? false,
        razorpayEnabled: savedSettings?.razorpayEnabled ?? false,
        webhookUrl: whu || undefined,
        automations: {
          autoWhatsAppReplies: { enabled: wa, config: JSON.stringify(waCfg) },
          sequenceBuilder: { enabled: seq, config: JSON.stringify(seqCfg) },
          proposalAutoSend: { enabled: prop, config: JSON.stringify(propCfg) },
          paymentConfirmation: { enabled: pay, config: JSON.stringify(payCfg) },
          projectOnboarding: { enabled: onb, config: JSON.stringify(onbCfg) },
        },
      };
    },
    [waEnabled, waConfig, seqEnabled, seqSteps, propEnabled, propConfig, payEnabled, payConfig, onbEnabled, onbConfig, webhookUrlDraft, savedSettings]
  );

  // ── Save helpers ────────────────────────────────────────────────────────────
  const handleSaveWebhookUrl = useCallback(() => {
    saveSettings.mutate(buildSettings(), {
      onSuccess: () => setWebhookUrl(webhookUrlDraft),
    });
  }, [buildSettings, saveSettings, webhookUrlDraft]);

  const handleSaveAutomation = useCallback(
    (overrides: Parameters<typeof buildSettings>[0]) => {
      saveSettings.mutate(buildSettings(overrides));
    },
    [buildSettings, saveSettings]
  );

  // ── WhatsApp toggle/save ────────────────────────────────────────────────────
  const handleWaToggle = (v: boolean) => {
    setWaEnabled(v);
    handleSaveAutomation({ waEnabled: v });
  };
  const handleWaSave = () => handleSaveAutomation({ waConfig });

  // ── Sequence toggle/save ────────────────────────────────────────────────────
  const handleSeqToggle = (v: boolean) => {
    setSeqEnabled(v);
    handleSaveAutomation({ seqEnabled: v });
  };
  const handleSeqSave = () => handleSaveAutomation({ seqSteps });

  const addSeqStep = () => setSeqSteps((p) => [...p, { name: '', delayDays: 1 }]);
  const removeSeqStep = (i: number) => setSeqSteps((p) => p.filter((_, idx) => idx !== i));
  const updateSeqStep = (i: number, field: keyof SequenceStep, value: string | number) =>
    setSeqSteps((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  // ── Proposal toggle/save ────────────────────────────────────────────────────
  const handlePropToggle = (v: boolean) => {
    setPropEnabled(v);
    handleSaveAutomation({ propEnabled: v });
  };
  const handlePropSave = () => handleSaveAutomation({ propConfig });

  // ── Payment toggle/save ─────────────────────────────────────────────────────
  const handlePayToggle = (v: boolean) => {
    setPayEnabled(v);
    handleSaveAutomation({ payEnabled: v });
  };
  const handlePaySave = () => handleSaveAutomation({ payConfig });

  // ── Onboarding toggle/save ──────────────────────────────────────────────────
  const handleOnbToggle = (v: boolean) => {
    setOnbEnabled(v);
    handleSaveAutomation({ onbEnabled: v });
  };
  const handleOnbSave = () => handleSaveAutomation({ onbConfig });

  // ── Clipboard ───────────────────────────────────────────────────────────────
  const handleCopyApiKey = useCallback(async () => {
    if (!principal) return;
    await navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }, [apiKey, principal]);

  const handleCopyWebhookUrl = useCallback(async () => {
    if (!webhookUrl) return;
    await navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }, [webhookUrl]);

  // ── Integration toggles (local only) ───────────────────────────────────────
  const getIntegrationEnabled = (id: string): boolean => {
    switch (id) {
      case 'zapierEnabled': return zapierEnabled;
      case 'googleSheetsEnabled': return googleSheetsEnabled;
      case 'slackEnabled': return slackEnabled;
      case 'webhooksEnabled': return webhooksEnabled;
      default: return false;
    }
  };
  const handleIntegrationToggle = (id: string, value: boolean) => {
    switch (id) {
      case 'zapierEnabled': setZapierEnabled(value); break;
      case 'googleSheetsEnabled': setGoogleSheetsEnabled(value); break;
      case 'slackEnabled': setSlackEnabled(value); break;
      case 'webhooksEnabled': setWebhooksEnabled(value); break;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Automation Center</h1>
        <p className="text-muted-foreground mt-1">Configure your business automations and integrations</p>
      </div>

      {/* ── Automation Rules (simple toggles) ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Automation Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'whatsapp', name: 'Auto WhatsApp Replies', description: 'Automated responses for WhatsApp messages' },
            { id: 'sequence', name: 'Sequence Builder', description: 'Create automated in-app task sequences' },
            { id: 'proposal', name: 'Proposal Auto-Send', description: 'Auto-generate proposals when leads are qualified' },
            { id: 'payment', name: 'Payment Confirmation', description: 'Automated payment confirmation notifications' },
            { id: 'onboarding', name: 'Project Onboarding', description: 'Auto-trigger onboarding after payment' },
          ].map((auto) => {
            const enabled =
              auto.id === 'whatsapp' ? waEnabled :
              auto.id === 'sequence' ? seqEnabled :
              auto.id === 'proposal' ? propEnabled :
              auto.id === 'payment' ? payEnabled :
              onbEnabled;
            const toggle =
              auto.id === 'whatsapp' ? handleWaToggle :
              auto.id === 'sequence' ? handleSeqToggle :
              auto.id === 'proposal' ? handlePropToggle :
              auto.id === 'payment' ? handlePayToggle :
              handleOnbToggle;
            return (
              <Card key={auto.id} className="glass-panel border-border hover:scale-[1.02] transition-transform duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground text-base">{auto.name}</CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">{auto.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {saveSettings.isPending && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      <Switch checked={enabled} onCheckedChange={toggle} disabled={saveSettings.isPending} />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator className="border-border" />

      {/* ── Integrations & API ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Integrations & API</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6 ml-10">
          Connect your favourite tools and manage API access for your QuickBee account.
        </p>

        {/* ── Automation Integration Cards ── */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">
            Automation Integrations
          </h3>
          <div className="space-y-4">

            {/* Auto WhatsApp Replies */}
            <AutomationCard
              icon={<SiWhatsapp className="w-5 h-5" />}
              iconColor="text-green-400"
              title="Auto WhatsApp Replies"
              description="Automated responses for WhatsApp messages"
              enabled={waEnabled}
              onToggle={handleWaToggle}
              isSaving={saveSettings.isPending}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">WhatsApp API Key</Label>
                  <Input
                    placeholder="Enter your WhatsApp Business API key"
                    value={waConfig.apiKey}
                    onChange={(e) => setWaConfig((p) => ({ ...p, apiKey: e.target.value }))}
                    className="bg-background/50 border-border font-mono text-xs focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Webhook URL</Label>
                  <Input
                    placeholder="https://your-server.com/whatsapp-webhook"
                    value={waConfig.webhookUrl}
                    onChange={(e) => setWaConfig((p) => ({ ...p, webhookUrl: e.target.value }))}
                    className="bg-background/50 border-border font-mono text-xs focus:border-primary/50"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleWaSave}
                  disabled={saveSettings.isPending || !principal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saveSettings.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="w-3 h-3 mr-2" />Save Configuration</>
                  )}
                </Button>
              </div>
            </AutomationCard>

            {/* Sequence Builder */}
            <AutomationCard
              icon={<ListOrdered className="w-5 h-5" />}
              iconColor="text-blue-400"
              title="Sequence Builder"
              description="Create automated in-app task sequences"
              enabled={seqEnabled}
              onToggle={handleSeqToggle}
              isSaving={saveSettings.isPending}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-foreground">Task Sequence Steps</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addSeqStep}
                    className="border-border hover:bg-primary/10 hover:border-primary/50 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Step
                  </Button>
                </div>
                {seqSteps.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No steps yet. Click "Add Step" to create your first task.
                  </p>
                )}
                <div className="space-y-2">
                  {seqSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/40 border border-border/60">
                      <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                      <Input
                        placeholder="Task name"
                        value={step.name}
                        onChange={(e) => updateSeqStep(i, 'name', e.target.value)}
                        className="flex-1 bg-background/50 border-border text-xs h-8 focus:border-primary/50"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          value={step.delayDays}
                          onChange={(e) => updateSeqStep(i, 'delayDays', parseInt(e.target.value) || 0)}
                          className="w-16 bg-background/50 border-border text-xs h-8 focus:border-primary/50"
                        />
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeSeqStep(i)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleSeqSave}
                  disabled={saveSettings.isPending || !principal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saveSettings.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="w-3 h-3 mr-2" />Save Sequence</>
                  )}
                </Button>
              </div>
            </AutomationCard>

            {/* Proposal Auto-Send */}
            <AutomationCard
              icon={<Send className="w-5 h-5" />}
              iconColor="text-amber-400"
              title="Proposal Auto-Send"
              description="Auto-generate proposals when leads are qualified"
              enabled={propEnabled}
              onToggle={handlePropToggle}
              isSaving={saveSettings.isPending}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Trigger Condition</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically send a proposal when a lead reaches the selected status.
                  </p>
                  <Select
                    value={propConfig.triggerStatus}
                    onValueChange={(v) => setPropConfig({ triggerStatus: v })}
                  >
                    <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                      <SelectValue placeholder="Select trigger status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Qualified">Lead Status = Qualified</SelectItem>
                      <SelectItem value="Contacted">Lead Status = Contacted</SelectItem>
                      <SelectItem value="Proposal Sent">Lead Status = Proposal Sent</SelectItem>
                      <SelectItem value="Closed">Lead Status = Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  onClick={handlePropSave}
                  disabled={saveSettings.isPending || !principal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saveSettings.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="w-3 h-3 mr-2" />Save Configuration</>
                  )}
                </Button>
              </div>
            </AutomationCard>

            {/* Payment Confirmation */}
            <AutomationCard
              icon={<CreditCard className="w-5 h-5" />}
              iconColor="text-teal-400"
              title="Payment Confirmation"
              description="Automated payment confirmation notifications"
              enabled={payEnabled}
              onToggle={handlePayToggle}
              isSaving={saveSettings.isPending}
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm text-foreground">Notification Channels</Label>
                  <p className="text-xs text-muted-foreground">
                    Choose where to send payment confirmation notifications.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-background/40 border border-border/60">
                      <Checkbox
                        id="notify-inapp"
                        checked={payConfig.notifyInApp}
                        onCheckedChange={(v) => setPayConfig((p) => ({ ...p, notifyInApp: !!v }))}
                      />
                      <Label htmlFor="notify-inapp" className="text-sm text-foreground cursor-pointer">
                        In-App Notification
                      </Label>
                      <Badge variant="outline" className="ml-auto text-xs text-primary border-primary/30">
                        Recommended
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-background/40 border border-border/60">
                      <Checkbox
                        id="notify-email"
                        checked={payConfig.notifyEmail}
                        onCheckedChange={(v) => setPayConfig((p) => ({ ...p, notifyEmail: !!v }))}
                      />
                      <Label htmlFor="notify-email" className="text-sm text-foreground cursor-pointer">
                        Email Notification
                      </Label>
                      <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">
                        Coming Soon
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handlePaySave}
                  disabled={saveSettings.isPending || !principal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saveSettings.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="w-3 h-3 mr-2" />Save Configuration</>
                  )}
                </Button>
              </div>
            </AutomationCard>

            {/* Project Onboarding */}
            <AutomationCard
              icon={<Users className="w-5 h-5" />}
              iconColor="text-violet-400"
              title="Project Onboarding"
              description="Auto-trigger onboarding after payment"
              enabled={onbEnabled}
              onToggle={handleOnbToggle}
              isSaving={saveSettings.isPending}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Payment Trigger Event</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start the client onboarding flow when this payment event occurs.
                  </p>
                  <Select
                    value={onbConfig.triggerEvent}
                    onValueChange={(v) => setOnbConfig({ triggerEvent: v })}
                  >
                    <SelectTrigger className="bg-background/50 border-border focus:border-primary/50">
                      <SelectValue placeholder="Select trigger event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_confirmed">On Payment Confirmed</SelectItem>
                      <SelectItem value="payment_link_paid">On Payment Link Paid</SelectItem>
                      <SelectItem value="stripe_checkout_completed">On Stripe Checkout Completed</SelectItem>
                      <SelectItem value="razorpay_payment_success">On Razorpay Payment Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  onClick={handleOnbSave}
                  disabled={saveSettings.isPending || !principal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saveSettings.isPending ? (
                    <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="w-3 h-3 mr-2" />Save Configuration</>
                  )}
                </Button>
              </div>
            </AutomationCard>

          </div>
        </div>

        {/* ── Third-party Integration Cards ── */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">
            Third-Party Integrations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRATIONS.map((integration) => {
              const enabled = getIntegrationEnabled(integration.id);
              return (
                <Card
                  key={integration.id}
                  className="glass-panel border-border hover:scale-[1.02] transition-transform duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${integration.color}`}>
                          {integration.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-foreground text-base">{integration.name}</CardTitle>
                            <Badge
                              variant={enabled ? 'default' : 'outline'}
                              className={`text-xs px-1.5 py-0 ${enabled ? 'bg-primary/20 text-primary border-primary/30' : 'text-muted-foreground'}`}
                            >
                              {enabled ? 'Connected' : 'Disabled'}
                            </Badge>
                          </div>
                          <CardDescription className="text-muted-foreground text-sm mt-0.5">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(v) => handleIntegrationToggle(integration.id, v)}
                      />
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── API Keys & Webhook ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Key Card */}
          <Card className="glass-panel border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-base">API Key</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    Use this key to authenticate API requests
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground truncate select-all">
                  {principal ? apiKey : 'Login to view your API key'}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0 border-border hover:bg-primary/10 hover:border-primary/50"
                  onClick={handleCopyApiKey}
                  disabled={!principal}
                  title="Copy API key"
                >
                  {copiedKey ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                <Code2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Include this key in the <span className="font-mono text-primary">Authorization: Bearer</span> header for all API requests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Webhook URL Card */}
          <Card className="glass-panel border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-base">Webhook Endpoint</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    Receive real-time event notifications at your URL
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://your-server.com/webhook"
                  value={webhookUrlDraft}
                  onChange={(e) => setWebhookUrlDraft(e.target.value)}
                  className="flex-1 bg-background/50 border-border font-mono text-xs focus:border-primary/50"
                  disabled={settingsLoading}
                />
                {webhookUrl && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="shrink-0 border-border hover:bg-primary/10 hover:border-primary/50"
                    onClick={handleCopyWebhookUrl}
                    title="Copy webhook URL"
                  >
                    {copiedUrl ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSaveWebhookUrl}
                disabled={saveSettings.isPending || settingsLoading || !principal}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                {saveSettings.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Webhook URL
                  </>
                )}
              </Button>
              {webhookUrl && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">
                    Active: <span className="font-mono text-primary">{webhookUrl}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── API Reference Quick Links ── */}
        <Card className="glass-panel border-border mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground text-base">API Reference</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Available event types and endpoints for your integrations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: <MessageSquare className="w-4 h-4" />, label: 'Lead Events', desc: 'lead.created, lead.updated, lead.qualified' },
                { icon: <Table2 className="w-4 h-4" />, label: 'Project Events', desc: 'project.created, project.status_changed' },
                { icon: <Zap className="w-4 h-4" />, label: 'Payment Events', desc: 'payment.confirmed, payment.failed' },
                { icon: <RefreshCw className="w-4 h-4" />, label: 'CRM Events', desc: 'crm.activity_created, crm.stage_changed' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-lg bg-background/40 border border-border/60 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-primary">
                    {item.icon}
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
