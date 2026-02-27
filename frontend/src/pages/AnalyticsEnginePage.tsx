import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { BarChart3, AlertTriangle, Loader2, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnalyticsMetricsCard } from '../components/analytics/AnalyticsMetricsCard';
import { GrowthSummaryPanel } from '../components/analytics/GrowthSummaryPanel';
import { WorkflowResultDisplay } from '../components/workflows/WorkflowResultDisplay';
import { useAIConfig } from '../contexts/AIConfigContext';
import { generateActionId, postToWebhook, saveWorkflowExecution } from '../hooks/useWorkflowExecution';
import type { WorkflowResult } from '../hooks/useWorkflowExecution';
import { useGetCallerUserRole } from '../hooks/useQueries';

interface AnalyticsMetrics {
  totalUsers: string | number;
  sessions: string | number;
  bounceRate: string | number;
  topTrafficSource: string;
  conversionRate: string | number;
}

interface GrowthSummary {
  trends: string;
  dropOffInsights: string;
  funnelSuggestions: string;
  seoTips: string;
}

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function AnalyticsEnginePage() {
  const navigate = useNavigate();
  const { data: role } = useGetCallerUserRole();
  const { config } = useAIConfig();
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [growthSummary, setGrowthSummary] = useState<GrowthSummary | null>(null);
  const [result, setResult] = useState<WorkflowResult | null>(null);

  React.useEffect(() => {
    if (role === 'guest') {
      toast.error('Access denied. Redirecting to dashboard.');
      navigate({ to: '/authenticated/client-dashboard' });
    }
  }, [role, navigate]);

  if (role === 'guest') return null;

  const isWebhookConfigured = !!(config.automationWebhookUrl && config.automationWebhookUrlEnabled);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionId = generateActionId();
    setIsLoading(true);
    setResult(null);

    if (!isWebhookConfigured) {
      setMetrics({
        totalUsers: 1247,
        sessions: 2891,
        bounceRate: 42.3,
        topTrafficSource: 'Organic Search',
        conversionRate: 3.8,
      });
      setGrowthSummary({
        trends: 'Simulated: +12% user growth compared to previous period. Sessions up 8%. (Live data requires configured endpoint)',
        dropOffInsights: 'Simulated: 35% drop-off on pricing page. Consider A/B testing CTA placement.',
        funnelSuggestions: 'Simulated: Add social proof to checkout flow. Reduce form fields on lead capture.',
        seoTips: 'Simulated: Target long-tail keywords. Improve page load speed for mobile users.',
      });
      const res: WorkflowResult = {
        action_id: actionId,
        status: 'pending_review',
        message: 'Analytics report generated with simulated data. Configure Automation Webhook URL for live GA4 data.',
        data_logged: false,
        next_steps: 'Configure your Automation Webhook URL in Sales System Configuration to pull real GA4 data.',
      };
      setResult(res);
      saveWorkflowExecution('analytics_engine', res);
      setIsLoading(false);
      return;
    }

    try {
      const response = await postToWebhook(
        config.automationWebhookUrl,
        {
          tool: 'analytics_engine',
          date_range: dateRange,
          timestamp: new Date().toISOString(),
        },
        config.apiKey,
        'Analytics Engine'
      );

      let parsedMetrics: AnalyticsMetrics = {
        totalUsers: '—', sessions: '—', bounceRate: '—',
        topTrafficSource: '—', conversionRate: '—',
      };
      let parsedSummary: GrowthSummary = {
        trends: 'Connect your Analytics endpoint to see real growth and decline trends.',
        dropOffInsights: 'Drop-off analysis requires live GA4 data.',
        funnelSuggestions: 'Funnel improvement suggestions will appear once connected.',
        seoTips: 'SEO optimization tips will be generated based on your actual traffic data.',
      };

      try {
        const data = JSON.parse(response.body);
        if (data.metrics) parsedMetrics = data.metrics;
        if (data.summary) parsedSummary = data.summary;
      } catch {
        // use defaults
      }

      setMetrics(parsedMetrics);
      setGrowthSummary(parsedSummary);

      const res: WorkflowResult = {
        action_id: actionId,
        status: 'success',
        message: `Analytics report generated for ${dateRange.start} to ${dateRange.end}.`,
        data_logged: true,
        next_steps: 'Review the metrics and growth summary below.',
      };
      setResult(res);
      saveWorkflowExecution('analytics_engine', res);
    } catch (err) {
      const res: WorkflowResult = {
        action_id: actionId,
        status: 'error',
        message: `Analytics Engine failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        data_logged: false,
        next_steps: 'Check your Automation Webhook URL configuration and try again.',
      };
      setResult(res);
      saveWorkflowExecution('analytics_engine', res);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Engine</h1>
          <p className="text-sm text-muted-foreground">Pull performance reports from Google Analytics 4</p>
        </div>
      </div>

      {!isWebhookConfigured && (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-sm">
            Automation Webhook URL is not configured or disabled. Reports will use simulated data.{' '}
            <button
              onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
              className="underline font-medium"
            >
              Configure Now
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="card-glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div>
              <Label className="text-xs mb-1 block">Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-40"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-40"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && <WorkflowResultDisplay result={result} />}

      {metrics && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Metrics Overview</h2>
          <AnalyticsMetricsCard metrics={metrics} />
        </div>
      )}

      {growthSummary && <GrowthSummaryPanel summary={growthSummary} />}

      {!metrics && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click "Generate Report" to pull analytics data</p>
        </div>
      )}
    </div>
  );
}
