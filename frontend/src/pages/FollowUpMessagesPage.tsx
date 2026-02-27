import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Send, Copy, Download, Loader2, Check, AlertCircle } from 'lucide-react';
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

const pipelineStages = [
  'New Lead', 'Contacted', 'Qualified', 'Proposal Sent',
  'Negotiation', 'Closed Won', 'Closed Lost', 'Re-engagement'
];

const followUpGoals = [
  'Schedule a demo', 'Get a decision', 'Share case study',
  'Address objections', 'Upsell/Cross-sell', 'Re-engage cold lead',
  'Confirm next steps', 'Request referral'
];

export default function FollowUpMessagesPage() {
  const navigate = useNavigate();
  const { config, isFieldConfigured } = useAIConfig();
  const webhookPost = useWebhookPost();

  const [leadName, setLeadName] = useState('');
  const [pipelineStage, setPipelineStage] = useState('');
  const [lastInteraction, setLastInteraction] = useState('');
  const [followUpGoal, setFollowUpGoal] = useState('');

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const webhookConfigured = isFieldConfigured('webhookUrl') || isFieldConfigured('automationWebhookUrl');
  const apiConfigured = isFieldConfigured('apiEndpoint') && isFieldConfigured('apiKey');

  const handleGenerate = async () => {
    if (!leadName || !pipelineStage || !followUpGoal) {
      setError('Please fill in lead name, pipeline stage, and follow-up goal.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessages(null);

    const formData = { leadName, pipelineStage, lastInteraction, followUpGoal };

    // Send to webhook
    if (webhookConfigured) {
      try {
        await webhookPost.mutateAsync({ toolName: 'Follow-Up Messages', formData });
      } catch (err) {
        toast.error(`Webhook POST failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    const prompt = `You are an expert sales communication specialist. Generate a 5-message follow-up sequence for the following lead:

Lead Name: ${leadName}
Current Pipeline Stage: ${pipelineStage}
Last Interaction: ${lastInteraction || 'Not specified'}
Follow-up Goal: ${followUpGoal}

Please create 5 follow-up messages with increasing urgency and different angles:

Message 1 - Gentle Check-in (Day 1-2)
Message 2 - Value Add (Day 3-5)
Message 3 - Social Proof (Day 7-10)
Message 4 - Direct Ask (Day 14)
Message 5 - Final Attempt (Day 21-30)

For each message:
- Specify the timing
- Write the subject line (for email) or opening (for WhatsApp/SMS)
- Write the full message body
- Include a clear call-to-action

Keep messages concise, personalized to ${leadName}, and focused on ${followUpGoal}.`;

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
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content in API response');
        setMessages(content);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to generate follow-up messages.';
        setError(msg);
      }
    } else {
      // Demo fallback
      setMessages(`MESSAGE 1 — Gentle Check-in (Day 1-2)
Subject: Quick follow-up, ${leadName}
Hi ${leadName}, just checking in after our last conversation. I wanted to make sure you had everything you needed. Happy to answer any questions — just reply here!
CTA: Reply with any questions or let me know a good time to connect.

---

MESSAGE 2 — Value Add (Day 3-5)
Subject: Something that might help you, ${leadName}
Hi ${leadName}, I came across this resource that's directly relevant to your goal of "${followUpGoal}". Thought you'd find it useful. [Link/Resource]
CTA: Let me know if this resonates with your situation.

---

MESSAGE 3 — Social Proof (Day 7-10)
Subject: How [Similar Company] achieved their goals
Hi ${leadName}, a client in a similar position to yours recently achieved great results. I'd love to share their story with you.
CTA: Are you free for a 15-minute call this week?

---

MESSAGE 4 — Direct Ask (Day 14)
Subject: Still interested, ${leadName}?
Hi ${leadName}, I want to be respectful of your time. Are you still exploring options for "${followUpGoal}"? A simple yes or no helps me understand how to best support you.
CTA: Just reply YES or NO — no pressure either way.

---

MESSAGE 5 — Final Attempt (Day 21-30)
Subject: Closing the loop, ${leadName}
Hi ${leadName}, I'll stop reaching out after this — I don't want to be a bother. If the timing ever becomes right for "${followUpGoal}", I'm here. Wishing you all the best!
CTA: Feel free to reach out anytime.`);
    }

    setLoading(false);
  };

  const handleCopy = async () => {
    if (!messages) return;
    await navigator.clipboard.writeText(messages);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!messages) return;
    setIsExporting(true);
    try {
      exportToText(messages, `follow-up-messages-${leadName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`);
      toast.success('Messages exported!');
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
          <h1 className="text-2xl font-bold text-foreground">Auto Follow-Up Messages</h1>
          <p className="text-muted-foreground text-sm">AI-generated follow-up sequences for your leads</p>
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
              <Send className="h-4 w-4 text-primary" />
              Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Lead Name *</Label>
              <Input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="e.g. Priya Sharma" />
            </div>

            <div className="space-y-1.5">
              <Label>Pipeline Stage *</Label>
              <Select value={pipelineStage} onValueChange={setPipelineStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select current stage" />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStages.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Last Interaction</Label>
              <Textarea
                value={lastInteraction}
                onChange={e => setLastInteraction(e.target.value)}
                placeholder="Briefly describe your last interaction with this lead..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Follow-Up Goal *</Label>
              <Select value={followUpGoal} onValueChange={setFollowUpGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="What do you want to achieve?" />
                </SelectTrigger>
                <SelectContent>
                  {followUpGoals.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating Messages...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Generate Follow-Up Sequence</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {messages ? (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">5-Message Sequence</CardTitle>
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
                    {messages}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
              <CardContent className="text-center py-12">
                <Send className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Fill in the lead details and click<br />"Generate Follow-Up Sequence" to see results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
