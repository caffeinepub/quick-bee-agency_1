import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Sparkles, FileText, DollarSign, MessageSquare, Send, Star,
  ArrowRight, Zap, Brain, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const generators = [
  {
    id: 'service-recommender',
    title: 'AI Service Recommender',
    description: 'AI-powered service recommendations based on client needs, budget, and goals.',
    icon: Sparkles,
    badge: 'AI',
    badgeVariant: 'default' as const,
    color: 'text-primary',
    bg: 'bg-primary/10',
    route: '/authenticated/generators/service-recommender',
  },
  {
    id: 'proposal-generator',
    title: 'Proposal Generator',
    description: 'Generate professional proposals with detailed scope, timeline, and pricing.',
    icon: FileText,
    badge: 'AI',
    badgeVariant: 'default' as const,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    route: '/authenticated/generators/proposal',
  },
  {
    id: 'pricing-strategy',
    title: 'Smart Pricing Strategy',
    description: 'Dynamic pricing suggestions with psychological pricing techniques.',
    icon: DollarSign,
    badge: 'Smart',
    badgeVariant: 'secondary' as const,
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    route: '/authenticated/generators/pricing',
  },
  {
    id: 'closing-scripts',
    title: 'AI Closing Scripts',
    description: 'Proven closing scripts tailored to your prospect\'s objections and needs.',
    icon: MessageSquare,
    badge: 'AI',
    badgeVariant: 'default' as const,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    route: '/authenticated/generators/closing-scripts',
  },
  {
    id: 'follow-up',
    title: 'Auto Follow-up Messages',
    description: 'Automated follow-up sequences for leads at every stage of the pipeline.',
    icon: Send,
    badge: 'Auto',
    badgeVariant: 'outline' as const,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    route: '/authenticated/generators/follow-up',
  },
  {
    id: 'lead-qualification',
    title: 'Smart Lead Qualification',
    description: 'Score and qualify leads based on budget, urgency, and decision-making power.',
    icon: Star,
    badge: 'Smart',
    badgeVariant: 'secondary' as const,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    route: '/authenticated/generators/lead-qualification',
  },
];

export default function GeneratorsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Smart Systems</h1>
            <p className="text-muted-foreground text-sm">Intelligent tools to supercharge your sales process</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {generators.map((gen) => {
          const Icon = gen.icon;
          return (
            <Card
              key={gen.id}
              className="group hover:shadow-lg transition-all duration-200 hover:border-primary/30 cursor-pointer"
              onClick={() => navigate({ to: gen.route })}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${gen.bg}`}>
                    <Icon className={`h-5 w-5 ${gen.color}`} />
                  </div>
                  <Badge variant={gen.badgeVariant} className="text-xs">
                    {gen.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base leading-snug">{gen.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{gen.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: gen.route });
                  }}
                >
                  Launch Tool
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Configure AI Credentials</p>
          <p className="text-xs text-muted-foreground">
            All AI tools require an OpenAI-compatible API endpoint and key. Configure them in{' '}
            <button
              className="text-primary underline underline-offset-2 hover:no-underline"
              onClick={() => navigate({ to: '/authenticated/automation' })}
            >
              Automation Settings
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
