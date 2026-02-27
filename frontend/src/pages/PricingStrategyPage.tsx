import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, DollarSign, TrendingUp, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIConfig } from '@/contexts/AIConfigContext';
import { useWebhookPost } from '@/hooks/useWebhookPost';
import { toast } from 'sonner';
import { exportObjectsToCSV } from '../utils/exportUtils';

const addOns = [
  { id: 'rush', label: 'Rush Delivery (+25%)', multiplier: 0.25 },
  { id: 'support', label: 'Priority Support (+15%)', multiplier: 0.15 },
  { id: 'revisions', label: 'Unlimited Revisions (+20%)', multiplier: 0.20 },
  { id: 'reporting', label: 'Monthly Reporting (+10%)', multiplier: 0.10 },
];

export default function PricingStrategyPage() {
  const navigate = useNavigate();
  const { config, isFieldConfigured } = useAIConfig();
  const webhookPost = useWebhookPost();

  const [serviceType, setServiceType] = useState('');
  const [baseCost, setBaseCost] = useState('');
  const [urgency, setUrgency] = useState([1]);
  const [complexity, setComplexity] = useState([1]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculated, setCalculated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const webhookConfigured = isFieldConfigured('webhookUrl') || isFieldConfigured('automationWebhookUrl');
  const apiConfigured = isFieldConfigured('apiEndpoint') && isFieldConfigured('apiKey');

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const urgencyLabels = ['Low', 'Medium', 'High', 'Critical'];
  const complexityLabels = ['Simple', 'Moderate', 'Complex', 'Enterprise'];

  const addOnMultiplier = selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find(a => a.id === id);
    return sum + (addon?.multiplier || 0);
  }, 0);

  const urgencyMultiplier = 1 + (urgency[0] - 1) * 0.15;
  const complexityMultiplier = 1 + (complexity[0] - 1) * 0.2;
  const base = parseFloat(baseCost) || 0;
  const calculatedPrice = Math.round(base * urgencyMultiplier * complexityMultiplier * (1 + addOnMultiplier));
  const psychologicalPrice = calculatedPrice > 0 ? calculatedPrice - 1 : 0;

  const handleCalculate = () => {
    if (!baseCost || parseFloat(baseCost) <= 0) {
      setError('Please enter a valid base cost.');
      return;
    }
    setError(null);
    setCalculated(true);
  };

  const handleGetAISuggestions = async () => {
    if (!calculated || calculatedPrice <= 0) {
      setError('Please calculate the price first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAiResult(null);

    const formData = {
      serviceName: serviceType || 'General Service',
      baseCost: Number(baseCost),
      urgency: urgencyLabels[urgency[0] - 1],
      complexity: complexityLabels[complexity[0] - 1],
      addOns: selectedAddOns.map(id => addOns.find(a => a.id === id)?.label).filter(Boolean),
      calculatedPrice,
      psychologicalPrice,
    };

    // Send to webhook
    if (webhookConfigured) {
      try {
        await webhookPost.mutateAsync({ toolName: 'Pricing Strategy', formData });
      } catch (err) {
        toast.error(`Webhook POST failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    if (apiConfigured) {
      const prompt = `You are a pricing strategy expert. Analyze the following service pricing and provide strategic recommendations.

Service Type: ${serviceType || 'General Service'}
Base Cost: $${baseCost}
Urgency Level: ${urgencyLabels[urgency[0] - 1]}
Complexity Level: ${complexityLabels[complexity[0] - 1]}
Add-ons Selected: ${selectedAddOns.length > 0 ? selectedAddOns.map(id => addOns.find(a => a.id === id)?.label).join(', ') : 'None'}
Calculated Price: $${calculatedPrice}
Psychological Price Point: $${psychologicalPrice}

Please provide:
1. Pricing Strategy Assessment
2. Psychological Pricing Recommendations
3. Value Anchoring Suggestions
4. Upsell/Bundle Opportunities
5. Competitive Positioning`;

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
        setAiResult(content);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to get AI suggestions.';
        setError(msg);
      }
    } else {
      setAiResult(`PRICING STRATEGY ASSESSMENT
Your calculated price of $${calculatedPrice} reflects a ${Math.round((urgencyMultiplier * complexityMultiplier - 1) * 100)}% premium over base cost.

PSYCHOLOGICAL PRICING
Consider pricing at $${psychologicalPrice} (just below the round number) to improve conversion rates.

VALUE ANCHORING
Present the full package value first, then reveal the price to anchor perception.

UPSELL OPPORTUNITIES
1. Bundle with maintenance package for recurring revenue
2. Offer a premium tier with faster delivery
3. Add a results guarantee to justify premium pricing

COMPETITIVE POSITIONING
Your pricing is competitive for ${complexityLabels[complexity[0] - 1]} complexity work. Emphasize quality and ROI over price.`);
    }

    setLoading(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportObjectsToCSV([{
        'Service Name': serviceType || 'General Service',
        'Base Cost': baseCost,
        'Final Price': calculatedPrice,
        'Psychological Price': psychologicalPrice,
        'Urgency': urgencyLabels[urgency[0] - 1],
        'Complexity': complexityLabels[complexity[0] - 1],
        'Add-Ons': selectedAddOns.map(id => addOns.find(a => a.id === id)?.label).join('; ') || 'None',
        'AI Suggestion': aiResult ? aiResult.slice(0, 200) : '',
      }], `pricing-strategy-${Date.now()}.csv`);
      toast.success('Pricing strategy exported!');
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
          <h1 className="text-2xl font-bold text-foreground">Smart Pricing Strategy</h1>
          <p className="text-muted-foreground text-sm">Dynamic pricing with AI-powered recommendations</p>
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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Pricing Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Service Type</Label>
                <Input value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="e.g. Website Development" />
              </div>

              <div className="space-y-1.5">
                <Label>Base Cost ($) *</Label>
                <Input type="number" value={baseCost} onChange={e => setBaseCost(e.target.value)} placeholder="e.g. 2000" />
              </div>

              <div className="space-y-2">
                <Label>Urgency: <span className="text-primary font-semibold">{urgencyLabels[urgency[0] - 1]}</span></Label>
                <Slider value={urgency} onValueChange={setUrgency} min={1} max={4} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {urgencyLabels.map(l => <span key={l}>{l}</span>)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Complexity: <span className="text-primary font-semibold">{complexityLabels[complexity[0] - 1]}</span></Label>
                <Slider value={complexity} onValueChange={setComplexity} min={1} max={4} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {complexityLabels.map(l => <span key={l}>{l}</span>)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Add-ons</Label>
                {addOns.map(addon => (
                  <div key={addon.id} className="flex items-center gap-2">
                    <Checkbox
                      id={addon.id}
                      checked={selectedAddOns.includes(addon.id)}
                      onCheckedChange={() => toggleAddOn(addon.id)}
                    />
                    <label htmlFor={addon.id} className="text-sm text-foreground cursor-pointer">{addon.label}</label>
                  </div>
                ))}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button onClick={handleCalculate} className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" /> Calculate Price
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {calculated && calculatedPrice > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Calculated Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Recommended Price</span>
                  <span className="text-2xl font-bold text-primary">${calculatedPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Psychological Price</span>
                  <span className="text-xl font-semibold text-foreground">${psychologicalPrice.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Urgency ×{urgencyMultiplier.toFixed(2)} · Complexity ×{complexityMultiplier.toFixed(2)} · Add-ons +{Math.round(addOnMultiplier * 100)}%
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={handleGetAISuggestions} disabled={loading} className="flex-1">
                    {loading ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Analyzing...</>
                    ) : (
                      <><Sparkles className="h-3 w-3 mr-1" />AI Suggestions</>
                    )}
                  </Button>
                  {(aiResult || calculated) && (
                    <Button size="sm" variant="outline" onClick={handleExport} disabled={isExporting}>
                      {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                      Export CSV
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {aiResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Pricing Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {aiResult}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {!calculated && (
            <Card className="min-h-[200px] flex items-center justify-center border-dashed">
              <CardContent className="text-center py-8">
                <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Enter your pricing inputs and click "Calculate Price"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
