import React, { useState } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useWebhookPost } from '../hooks/useWebhookPost';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Sparkles, Target, TrendingUp, Download, AlertCircle, Settings } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { exportToText } from '../utils/exportUtils';

const BUSINESS_TYPES = ['E-commerce', 'SaaS', 'Agency', 'Consulting', 'Healthcare', 'Education', 'Real Estate', 'Finance', 'Retail', 'Manufacturing'];
const GOALS = ['Increase Revenue', 'Generate Leads', 'Brand Awareness', 'Customer Retention', 'Automate Operations', 'Scale Team', 'Launch Product', 'Enter New Market'];

interface RecommendationResult {
  recommendedService: string;
  upsellSuggestion: string;
  reasoning: string;
  projectedROI: string;
  budget: number;
}

export default function ServiceRecommendationPage() {
  const navigate = useNavigate();
  const { config, isFieldConfigured } = useAIConfig();
  const webhookPost = useWebhookPost();

  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState([50000]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState([10]);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const webhookConfigured = isFieldConfigured('webhookUrl') || isFieldConfigured('automationWebhookUrl');
  const apiConfigured = isFieldConfigured('apiEndpoint') && isFieldConfigured('apiKey');

  const toggleBusinessType = (type: string) => {
    setSelectedBusinessTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleGenerate = async () => {
    if (selectedBusinessTypes.length === 0) {
      toast.error('Please select at least one business type.');
      return;
    }
    setIsLoading(true);
    setResult(null);

    const formData = {
      businessTypes: selectedBusinessTypes,
      budget: budget[0],
      goals: selectedGoals,
      teamSize: teamSize[0],
    };

    // Send to webhook
    if (webhookConfigured) {
      try {
        await webhookPost.mutateAsync({ toolName: 'Service Recommendation', formData });
      } catch (err) {
        toast.error(`Webhook POST failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Call AI API
    if (apiConfigured) {
      try {
        const endpoint = config.apiEndpoint;
        const apiKey = config.apiKey;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert business consultant. Recommend the best service for the client based on their profile. Respond with JSON: { recommendedService, upsellSuggestion, reasoning, projectedROI, budget }',
              },
              {
                role: 'user',
                content: `Business types: ${selectedBusinessTypes.join(', ')}. Budget: ₹${budget[0].toLocaleString()}. Goals: ${selectedGoals.join(', ')}. Team size: ${teamSize[0]}.`,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            setResult({ ...parsed, budget: budget[0] });
          }
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (err) {
        toast.error(`AI API failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Fallback result
        setResult({
          recommendedService: 'Digital Marketing Package',
          upsellSuggestion: 'Add SEO + Content Marketing for 3x ROI',
          reasoning: `Based on your ${selectedBusinessTypes.join('/')} business with a budget of ₹${budget[0].toLocaleString()}, a Digital Marketing Package is the best fit.`,
          projectedROI: '250-400%',
          budget: budget[0],
        });
      }
    } else {
      // Demo result
      setResult({
        recommendedService: 'Growth Marketing Suite',
        upsellSuggestion: 'Add CRM Integration for 2x lead conversion',
        reasoning: `For a ${selectedBusinessTypes.join('/')} business focused on ${selectedGoals.join(', ')}, the Growth Marketing Suite provides the best ROI.`,
        projectedROI: '300-500%',
        budget: budget[0],
      });
    }

    setIsLoading(false);
  };

  const handleExport = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      const content = `SERVICE RECOMMENDATION REPORT
Generated: ${new Date().toLocaleString()}

RECOMMENDED SERVICE: ${result.recommendedService}
UPSELL SUGGESTION: ${result.upsellSuggestion}
PROJECTED ROI: ${result.projectedROI}
BUDGET: ₹${result.budget?.toLocaleString()}

REASONING:
${result.reasoning}

BUSINESS PROFILE:
- Business Types: ${selectedBusinessTypes.join(', ')}
- Goals: ${selectedGoals.join(', ')}
- Team Size: ${teamSize[0]}
`;
      exportToText(content, `service-recommendation-${Date.now()}.txt`);
      toast.success('Recommendation exported!');
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
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Recommender</h1>
          <p className="text-muted-foreground text-sm">AI-powered service recommendations based on your business profile</p>
        </div>
      </div>

      {!webhookConfigured && !apiConfigured && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Webhook URL not configured. Please{' '}
            <button className="underline font-medium" onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}>
              configure in Sales System Config
            </button>{' '}
            to send data to Make.com.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-base">Business Profile</CardTitle>
            <CardDescription>Select your business type and goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Type</label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleBusinessType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedBusinessTypes.includes(type)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Monthly Budget: ₹{budget[0].toLocaleString()}</label>
              <Slider value={budget} onValueChange={setBudget} min={5000} max={500000} step={5000} className="mt-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹5K</span><span>₹5L</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Team Size: {teamSize[0]} people</label>
              <Slider value={teamSize} onValueChange={setTeamSize} min={1} max={500} step={1} className="mt-2" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Business Goals</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedGoals.includes(goal)
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'border-border text-muted-foreground hover:border-accent/50'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isLoading || selectedBusinessTypes.length === 0} className="w-full gap-2">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Get Recommendation</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recommendation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                <p className="text-sm">Analyzing your business profile...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Recommended Service</p>
                  <p className="font-bold text-lg text-primary">{result.recommendedService}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-xs text-muted-foreground">Projected ROI</p>
                    <p className="font-semibold text-success">{result.projectedROI}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-semibold">₹{result.budget?.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Upsell Opportunity</p>
                  <p className="text-sm text-foreground">{result.upsellSuggestion}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.reasoning}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="w-full gap-2">
                  {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  Export Result
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Fill in your business profile and click Generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
