import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Star, Loader2, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIConfig } from '@/contexts/AIConfigContext';
import { useWebhookPost } from '@/hooks/useWebhookPost';
import { toast } from 'sonner';
import { exportToJSON } from '../utils/exportUtils';

interface QualificationResult {
  score: number;
  tier: 'Hot' | 'Warm' | 'Cold';
  reasoning: string;
  nextSteps: string;
  keyStrengths: string[];
  keyRisks: string[];
}

const companySizes = ['Small (1-50)', 'Medium (51-500)', 'Large (501-5000)', 'Enterprise (5000+)'];
const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

export default function LeadQualificationPage() {
  const navigate = useNavigate();
  const { config, isFieldConfigured } = useAIConfig();
  const webhookPost = useWebhookPost();

  const [companySize, setCompanySize] = useState('');
  const [budgetRange, setBudgetRange] = useState([5000]);
  const [urgency, setUrgency] = useState('');
  const [isDecisionMaker, setIsDecisionMaker] = useState(false);
  const [needsDescription, setNeedsDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const webhookConfigured = isFieldConfigured('webhookUrl') || isFieldConfigured('automationWebhookUrl');
  const apiConfigured = isFieldConfigured('apiEndpoint') && isFieldConfigured('apiKey');

  const handleQualify = async () => {
    if (!companySize || !urgency || !needsDescription) {
      setError('Please fill in company size, urgency, and needs description.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = {
      companySize,
      budgetRange: budgetRange[0],
      urgency,
      isDecisionMaker,
      needsDescription,
    };

    // Send to webhook
    if (webhookConfigured) {
      try {
        await webhookPost.mutateAsync({ toolName: 'Lead Qualification', formData });
      } catch (err) {
        toast.error(`Webhook POST failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    const prompt = `You are an expert sales qualification specialist using the BANT framework. Analyze this lead and provide a qualification assessment.

Lead Details:
- Company Size: ${companySize}
- Budget Range: $${budgetRange[0].toLocaleString()} - $${(budgetRange[0] * 2).toLocaleString()}
- Urgency Level: ${urgency}
- Is Decision Maker: ${isDecisionMaker ? 'Yes' : 'No'}
- Needs Description: ${needsDescription}

Please provide a comprehensive qualification assessment as JSON with these exact keys:
- score: number from 0-100
- tier: exactly one of "Hot", "Warm", or "Cold"
- reasoning: 2-3 sentence explanation of the score
- nextSteps: specific recommended next action
- keyStrengths: array of 2-3 positive qualification factors
- keyRisks: array of 1-2 risk factors or concerns

Scoring guide:
- Hot (75-100): Strong budget, high urgency, decision maker, clear need
- Warm (40-74): Some budget, moderate urgency, or indirect decision maker
- Cold (0-39): Limited budget, low urgency, not decision maker, vague need`;

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
            temperature: 0.5,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('No content in API response');
        const parsed = JSON.parse(content) as QualificationResult;
        setResult(parsed);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to qualify lead.';
        setError(msg);
        // Demo fallback
        setResult({
          score: urgency === 'Critical' ? 82 : urgency === 'High' ? 65 : urgency === 'Medium' ? 45 : 25,
          tier: urgency === 'Critical' ? 'Hot' : urgency === 'High' ? 'Warm' : 'Cold',
          reasoning: `Based on the ${companySize} company profile with ${urgency} urgency and a budget of $${budgetRange[0].toLocaleString()}, this lead shows ${urgency === 'Critical' || urgency === 'High' ? 'strong' : 'moderate'} qualification signals.`,
          nextSteps: urgency === 'Critical' ? 'Schedule a demo call within 24 hours.' : 'Send a value-add email and follow up in 3 days.',
          keyStrengths: ['Clear need identified', isDecisionMaker ? 'Direct decision maker' : 'Has budget authority', `${companySize} company size`],
          keyRisks: [isDecisionMaker ? 'Timeline uncertainty' : 'Not the final decision maker', 'Budget not fully confirmed'],
        });
      }
    } else {
      // Demo fallback
      setResult({
        score: urgency === 'Critical' ? 82 : urgency === 'High' ? 65 : urgency === 'Medium' ? 45 : 25,
        tier: urgency === 'Critical' ? 'Hot' : urgency === 'High' ? 'Warm' : 'Cold',
        reasoning: `Based on the ${companySize} company profile with ${urgency} urgency and a budget of $${budgetRange[0].toLocaleString()}, this lead shows ${urgency === 'Critical' || urgency === 'High' ? 'strong' : 'moderate'} qualification signals.`,
        nextSteps: urgency === 'Critical' ? 'Schedule a demo call within 24 hours.' : 'Send a value-add email and follow up in 3 days.',
        keyStrengths: ['Clear need identified', isDecisionMaker ? 'Direct decision maker' : 'Has budget authority', `${companySize} company size`],
        keyRisks: [isDecisionMaker ? 'Timeline uncertainty' : 'Not the final decision maker', 'Budget not fully confirmed'],
      });
    }

    setLoading(false);
  };

  const handleExport = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      exportToJSON({
        ...result,
        formData: { companySize, budgetRange: budgetRange[0], urgency, isDecisionMaker, needsDescription },
        generatedAt: new Date().toISOString(),
      }, `lead-qualification-${Date.now()}.json`);
      toast.success('Qualification result exported!');
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const tierColor = (tier: string) => {
    if (tier === 'Hot') return 'bg-red-500/10 text-red-600 border-red-500/30';
    if (tier === 'Warm') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return 'text-red-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-blue-500';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/authenticated/generators' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smart Lead Qualification</h1>
          <p className="text-muted-foreground text-sm">AI-powered lead scoring based on BANT framework</p>
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
              <Users className="h-4 w-4 text-primary" />
              Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Company Size *</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Budget Range: <span className="text-primary font-semibold">${budgetRange[0].toLocaleString()} – ${(budgetRange[0] * 2).toLocaleString()}</span>
              </Label>
              <Slider
                value={budgetRange}
                onValueChange={setBudgetRange}
                min={500}
                max={100000}
                step={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$500</span>
                <span>$100,000+</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Urgency Level *</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <Label className="text-sm font-medium">Decision Maker</Label>
                <p className="text-xs text-muted-foreground">Is this contact the final decision maker?</p>
              </div>
              <Switch checked={isDecisionMaker} onCheckedChange={setIsDecisionMaker} />
            </div>

            <div className="space-y-1.5">
              <Label>Needs Description *</Label>
              <Textarea
                value={needsDescription}
                onChange={e => setNeedsDescription(e.target.value)}
                placeholder="Describe the lead's specific needs, pain points, and what they're looking to achieve..."
                rows={4}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button onClick={handleQualify} disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Qualifying Lead...</>
              ) : (
                <><Star className="h-4 w-4 mr-2" />Qualify Lead</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result ? (
            <>
              <Card className={`border ${tierColor(result.tier)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Qualification Score</p>
                      <p className={`text-5xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
                      <p className="text-xs text-muted-foreground">out of 100</p>
                    </div>
                    <Badge className={`text-lg px-4 py-2 border ${tierColor(result.tier)}`} variant="outline">
                      {result.tier === 'Hot' ? '🔥' : result.tier === 'Warm' ? '☀️' : '❄️'} {result.tier} Lead
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all ${result.score >= 75 ? 'bg-red-500' : result.score >= 40 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="w-full gap-2">
                    {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    Export Result
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.reasoning}</p>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Recommended Next Step
                    </p>
                    <p className="text-sm text-foreground">{result.nextSteps}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {result.keyStrengths?.map((s, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-500/20 bg-red-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-red-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Key Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {result.keyRisks?.map((r, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1">
                          <span className="text-red-500 mt-0.5">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
              <CardContent className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Fill in the lead details and click<br />"Qualify Lead" to see the AI assessment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
