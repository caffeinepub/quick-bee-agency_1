import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Funnel, Search } from 'lucide-react';

interface GrowthSummaryPanelProps {
  summary?: {
    trends?: string;
    dropOffInsights?: string;
    funnelSuggestions?: string;
    seoTips?: string;
  } | null;
}

const defaultSummary = {
  trends: 'Connect your Analytics endpoint to see real growth and decline trends for the selected period.',
  dropOffInsights: 'Drop-off analysis requires live GA4 data. Configure your Automation Webhook URL to pull real metrics.',
  funnelSuggestions: 'Funnel improvement suggestions will appear here once your analytics endpoint is connected.',
  seoTips: 'SEO optimization tips will be generated based on your actual traffic data once the endpoint is configured.',
};

export function GrowthSummaryPanel({ summary }: GrowthSummaryPanelProps) {
  const data = summary || defaultSummary;

  const sections = [
    {
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      title: 'Growth & Decline Trends',
      content: data.trends || defaultSummary.trends,
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      title: 'Drop-off Insights',
      content: data.dropOffInsights || defaultSummary.dropOffInsights,
    },
    {
      icon: <Funnel className="w-4 h-4 text-primary" />,
      title: 'Funnel Improvement Suggestions',
      content: data.funnelSuggestions || defaultSummary.funnelSuggestions,
    },
    {
      icon: <Search className="w-4 h-4 text-cyan-400" />,
      title: 'SEO Optimization Tips',
      content: data.seoTips || defaultSummary.seoTips,
    },
  ];

  return (
    <Card className="card-glass border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Growth Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <div className="flex items-center gap-2">
              {section.icon}
              <span className="text-sm font-medium text-foreground">{section.title}</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{section.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
