import React, { useState } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookPost } from '../hooks/useWebhookPost';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, FileText, Download, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { exportToText } from '../utils/exportUtils';

interface ProposalResult {
  title: string;
  executiveSummary: string;
  scope: string;
  deliverables: string[];
  timeline: string;
  investment: string;
  terms: string;
}

export default function ProposalGeneratorPage() {
  const navigate = useNavigate();
  const { config, isFieldConfigured } = useAIConfig();
  const webhookPost = useWebhookPost();

  const [form, setForm] = useState({
    clientName: '',
    projectType: '',
    scope: '',
    deliverables: '',
    timeline: '',
    budget: '',
  });
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const webhookConfigured = isFieldConfigured('webhookUrl') || isFieldConfigured('automationWebhookUrl');
  const apiConfigured = isFieldConfigured('apiEndpoint') && isFieldConfigured('apiKey');

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!form.clientName || !form.projectType) {
      toast.error('Please fill in client name and project type.');
      return;
    }
    setIsLoading(true);
    setResult(null);

    const formData = { ...form };

    if (webhookConfigured) {
      try {
        await webhookPost.mutateAsync({ toolName: 'Proposal Generator', formData });
      } catch (err) {
        toast.error(`Webhook POST failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    if (apiConfigured) {
      try {
        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a professional proposal writer. Generate a detailed business proposal. Respond with JSON: { title, executiveSummary, scope, deliverables (array), timeline, investment, terms }' },
              { role: 'user', content: `Client: ${form.clientName}. Project: ${form.projectType}. Scope: ${form.scope}. Deliverables: ${form.deliverables}. Timeline: ${form.timeline}. Budget: ${form.budget}.` },
            ],
            response_format: { type: 'json_object' },
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) setResult(JSON.parse(content));
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (err) {
        toast.error(`AI API failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setResult({
          title: `Proposal for ${form.clientName} - ${form.projectType}`,
          executiveSummary: `We are pleased to present this proposal for ${form.projectType} services to ${form.clientName}.`,
          scope: form.scope || 'Full project scope as discussed.',
          deliverables: form.deliverables ? form.deliverables.split(',').map(d => d.trim()) : ['Deliverable 1', 'Deliverable 2'],
          timeline: form.timeline || '4-6 weeks',
          investment: form.budget || 'To be discussed',
          terms: 'Net 30 payment terms. 50% upfront, 50% on completion.',
        });
      }
    } else {
      setResult({
        title: `Proposal for ${form.clientName} - ${form.projectType}`,
        executiveSummary: `We are pleased to present this proposal for ${form.projectType} services to ${form.clientName}.`,
        scope: form.scope || 'Full project scope as discussed.',
        deliverables: form.deliverables ? form.deliverables.split(',').map(d => d.trim()) : ['Deliverable 1', 'Deliverable 2'],
        timeline: form.timeline || '4-6 weeks',
        investment: form.budget || 'To be discussed',
        terms: 'Net 30 payment terms. 50% upfront, 50% on completion.',
      });
    }

    setIsLoading(false);
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      const content = `${result.title}
${'='.repeat(result.title.length)}

EXECUTIVE SUMMARY
${result.executiveSummary}

SCOPE OF WORK
${result.scope}

DELIVERABLES
${result.deliverables.map((d, i) => `${i + 1}. ${d}`).join('\n')}

TIMELINE
${result.timeline}

INVESTMENT
${result.investment}

TERMS & CONDITIONS
${result.terms}

---
Generated by QuickBee Sales System on ${new Date().toLocaleString()}
`;
      exportToText(content, `proposal-${form.clientName.replace(/\s+/g, '-')}-${Date.now()}.txt`);
      toast.success('Proposal exported!');
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposal Generator</h1>
          <p className="text-muted-foreground text-sm">Generate professional client proposals with AI</p>
        </div>
      </div>

      {!webhookConfigured && !apiConfigured && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Webhook URL not configured.{' '}
            <button className="underline font-medium" onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}>
              Configure in Sales System Config
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-base">Proposal Details</CardTitle>
            <CardDescription>Fill in the client and project information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Client Name *</Label>
              <Input placeholder="Acme Corp" value={form.clientName} onChange={e => handleChange('clientName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Project Type *</Label>
              <Select value={form.projectType} onValueChange={v => handleChange('projectType', v)}>
                <SelectTrigger><SelectValue placeholder="Select project type" /></SelectTrigger>
                <SelectContent>
                  {['Web Development', 'Mobile App', 'Digital Marketing', 'SEO', 'Branding', 'Consulting', 'E-commerce', 'Custom Software'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scope of Work</Label>
              <Textarea placeholder="Describe the project scope..." value={form.scope} onChange={e => handleChange('scope', e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Deliverables (comma-separated)</Label>
              <Input placeholder="Website, Mobile App, Documentation" value={form.deliverables} onChange={e => handleChange('deliverables', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Timeline</Label>
                <Input placeholder="4-6 weeks" value={form.timeline} onChange={e => handleChange('timeline', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Budget</Label>
                <Input placeholder="₹1,50,000" value={form.budget} onChange={e => handleChange('budget', e.target.value)} />
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !form.clientName || !form.projectType} className="w-full gap-2">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><FileText className="h-4 w-4" />Generate Proposal</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-base">Generated Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                <p className="text-sm">Crafting your proposal...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-primary">{result.title}</h3>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Executive Summary</p>
                  <p className="text-sm text-foreground">{result.executiveSummary}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Scope</p>
                  <p className="text-sm text-foreground">{result.scope}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Deliverables</p>
                  <ul className="text-sm space-y-1">
                    {result.deliverables.map((d, i) => <li key={i} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{d}</li>)}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="font-semibold text-sm">{result.timeline}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-xs text-muted-foreground">Investment</p>
                    <p className="font-semibold text-sm text-success">{result.investment}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Terms</p>
                  <p className="text-sm text-muted-foreground">{result.terms}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="w-full gap-2">
                  {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  Export as PDF/Text
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Fill in the details and generate your proposal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
