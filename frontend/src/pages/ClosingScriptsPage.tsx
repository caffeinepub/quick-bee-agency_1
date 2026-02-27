import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageSquare, Copy, Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIConfig } from '@/contexts/AIConfigContext';
import { useWebhookPost } from '@/hooks/useWebhookPost';
import { toast } from 'sonner';
import { exportToText } from '../utils/exportUtils';

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Education',
  'Retail', 'Manufacturing', 'Consulting', 'Marketing', 'Legal', 'Other'
];

const commonObjections = [
  'Too expensive', 'Need to think about it', 'Not the right time',
  'Need to consult others', 'Already have a solution', 'Not sure about ROI',
  'Competitor offers better price', 'Budget constraints', 'Other'
];

export default function ClosingScriptsPage() {
  const navigate = useNavigate();
  const { config, isFieldConfigured } = useAIConfig();
  const webhookPost = useWebhookPost();

  const [prospectName, setProspectName] = useState('');
  const [industry, setIndustry] = useState('');
  const [objection, setObjection] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');

  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const webhookConfigured = isFieldConfigured('webhookUrl') || isFieldConfigured('automationWebhookUrl');
  const apiConfigured = isFieldConfigured('apiEndpoint') && isFieldConfigured('apiKey');

  const handleGenerate = async () => {
    if (!prospectName || !industry || !objection) {
      setError('Please fill in prospect name, industry, and primary objection.');
      return;
    }

    setLoading(true);
    setError(null);
    setScripts(null);

    const formData = { prospectName, industry, objection, desiredOutcome };

    // Send to webhook
    if (webhookConfigured) {
      try {
        await webhookPost.mutateAsync({ toolName: 'Closing Scripts', formData });
      } catch (err) {
        toast.error(`Webhook POST failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    const prompt = `You are an expert sales coach specializing in closing techniques. Generate tailored closing scripts for the following scenario:

Prospect Name: ${prospectName}
Industry: ${industry}
Primary Objection: ${objection}
Desired Outcome: ${desiredOutcome || 'Close the sale'}

Please provide 3 different closing scripts:

Script 1 - Empathy & Value Reframe
(Address the objection with empathy, then reframe the value proposition)

Script 2 - Social Proof & Urgency
(Use social proof and create appropriate urgency)

Script 3 - Direct Ask & Alternative Close
(Acknowledge the objection directly and offer alternatives)

For each script:
- Include the opening line
- The objection handling
- The closing ask
- A follow-up if they hesitate

Make the scripts conversational, natural, and specific to ${prospectName}'s situation in the ${industry} industry.`;

    if (apiConfigured) {
      try {
        const response = await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content in API response');
        setScripts(content);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to generate closing scripts.';
        setError(msg);
      }
    } else {
      // Demo fallback
      setScripts(`SCRIPT 1 — Empathy & Value Reframe
Opening: "I completely understand, ${prospectName}. ${objection} is a valid concern."
Objection Handling: "Many of our clients in ${industry} felt the same way initially. What they found was that the ROI far outweighed the initial investment."
Closing Ask: "Would you be open to a 30-day pilot so you can see the results firsthand?"
Follow-up: "If not now, when would be a better time to revisit this?"

---

SCRIPT 2 — Social Proof & Urgency
Opening: "I hear you, ${prospectName}. Let me share what happened with a similar ${industry} company."
Objection Handling: "They had the same concern about ${objection}, but after implementing our solution, they saw a 40% improvement in 60 days."
Closing Ask: "We have a limited onboarding slot this month — shall I reserve one for you?"
Follow-up: "I can hold the slot for 48 hours. What would help you make a decision today?"

---

SCRIPT 3 — Direct Ask & Alternative Close
Opening: "I appreciate your honesty about ${objection}, ${prospectName}. Let's address that directly."
Objection Handling: "We can structure this in a way that removes that barrier entirely."
Closing Ask: "Would you prefer to start with our basic package, or go straight to the full solution?"
Follow-up: "Which option feels more comfortable for you right now?"`);
    }

    setLoading(false);
  };

  const handleCopy = async () => {
    if (!scripts) return;
    await navigator.clipboard.writeText(scripts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!scripts) return;
    setIsExporting(true);
    try {
      exportToText(scripts, `closing-scripts-${prospectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`);
      toast.success('Scripts exported!');
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/authenticated/generators' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Closing Scripts</h1>
          <p className="text-muted-foreground text-sm">Proven closing scripts tailored to your prospect's objections</p>
        </div>
      </div>

      {!webhookConfigured && !apiConfigured && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Webhook URL not configured. Please{' '}
            <button
              className="underline font-medium"
              onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
            >
              configure in Sales System Config
            </button>{' '}
            to send data to Make.com.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Prospect Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Prospect Name *</Label>
              <Input value={prospectName} onChange={e => setProspectName(e.target.value)} placeholder="e.g. John Smith" />
            </div>

            <div className="space-y-1.5">
              <Label>Industry *</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Primary Objection *</Label>
              <Select value={objection} onValueChange={setObjection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select main objection" />
                </SelectTrigger>
                <SelectContent>
                  {commonObjections.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Desired Outcome</Label>
              <Textarea
                value={desiredOutcome}
                onChange={e => setDesiredOutcome(e.target.value)}
                placeholder="e.g. Schedule a follow-up call, close the deal today..."
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating Scripts...</>
              ) : (
                <><MessageSquare className="h-4 w-4 mr-2" />Generate Closing Scripts</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {scripts ? (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Generated Scripts</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <><Check className="h-3 w-3 mr-1" />Copied!</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload} disabled={isExporting}>
                    {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 max-h-[550px] overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {scripts}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Fill in the prospect details and click<br />"Generate Closing Scripts" to see results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
