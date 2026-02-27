import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, TrendingDown, Globe, Target } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

interface AnalyticsMetricsCardProps {
  metrics: {
    totalUsers: string | number;
    sessions: string | number;
    bounceRate: string | number;
    topTrafficSource: string;
    conversionRate: string | number;
  };
}

export function AnalyticsMetricsCard({ metrics }: AnalyticsMetricsCardProps) {
  const items: Metric[] = [
    {
      label: 'Total Users',
      value: metrics.totalUsers,
      icon: <Users className="w-5 h-5 text-primary" />,
      description: 'Unique visitors',
    },
    {
      label: 'Sessions',
      value: metrics.sessions,
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      description: 'Total sessions',
    },
    {
      label: 'Bounce Rate',
      value: typeof metrics.bounceRate === 'number' ? `${metrics.bounceRate}%` : metrics.bounceRate,
      icon: <TrendingDown className="w-5 h-5 text-amber-400" />,
      description: 'Single-page sessions',
    },
    {
      label: 'Top Traffic Source',
      value: metrics.topTrafficSource,
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      description: 'Primary channel',
    },
    {
      label: 'Conversion Rate',
      value: typeof metrics.conversionRate === 'number' ? `${metrics.conversionRate}%` : metrics.conversionRate,
      icon: <Target className="w-5 h-5 text-purple-400" />,
      description: 'Goal completions',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((metric) => (
        <Card key={metric.label} className="card-glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {metric.icon}
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <div className="text-xl font-bold text-foreground">{metric.value}</div>
            {metric.description && (
              <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
