import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Target,
  ArrowRight,
  RefreshCw,
  Star,
} from 'lucide-react';
import { useGetServiceRecommendations, type ServiceRecommendation, type RecommendationFormData } from '../hooks/useQueries';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  'E-commerce',
  'SaaS / Software',
  'Local Business',
  'Consulting / Agency',
  'Healthcare',
  'Education',
  'Real Estate',
  'Restaurant / Food',
  'Fitness / Wellness',
  'Finance / Fintech',
  'Other',
];

const GOAL_SUGGESTIONS = [
  'Increase website traffic',
  'Generate more leads',
  'Improve social media presence',
  'Boost SEO rankings',
  'Create content strategy',
  'Launch email campaigns',
  'Build brand awareness',
  'Improve conversion rates',
];

const TIER_COLORS: Record<string, string> = {
  Basic: 'border-blue-500/50 text-blue-400 bg-blue-500/10',
  Pro: 'border-primary/50 text-primary bg-primary/10',
  Premium: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10',
};

function formatBudget(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

function RecommendationCard({ rec, index }: { rec: ServiceRecommendation; index: number }) {
  return (
    <Card className="border-border bg-card hover:border-primary/40 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
              {index + 1}
            </div>
            <CardTitle className="text-base text-foreground">{rec.name}</CardTitle>
          </div>
          <Badge className={`text-xs border ${TIER_COLORS[rec.suggestedTier] || TIER_COLORS.Basic}`}>
            {rec.suggestedTier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{rec.description}</p>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span>{rec.reason}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(rec.matchScore / 20) ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{rec.matchScore}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServiceRecommendationPage() {
  const [businessType, setBusinessType] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [budgetRange, setBudgetRange] = useState([2500]);
  const [goals, setGoals] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[] | null>(null);

  const getRecommendations = useGetServiceRecommendations();

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalBusinessType = businessType === 'Other' ? customBusinessType : businessType;
    if (!finalBusinessType) {
      toast.error('Please select or enter your business type');
      return;
    }

    const combinedGoals = [
      ...selectedGoals,
      ...(goals.trim() ? [goals.trim()] : []),
    ].join(', ');

    if (!combinedGoals) {
      toast.error('Please describe your business goals');
      return;
    }

    const formData: RecommendationFormData = {
      businessType: finalBusinessType,
      budgetRange: budgetRange[0],
      goals: combinedGoals,
    };

    try {
      const results = await getRecommendations.mutateAsync(formData);
      setRecommendations(results);
      toast.success('Recommendations generated!');
    } catch {
      toast.error('Failed to generate recommendations. Please try again.');
    }
  };

  const handleReset = () => {
    setRecommendations(null);
    setBusinessType('');
    setCustomBusinessType('');
    setBudgetRange([2500]);
    setGoals('');
    setSelectedGoals([]);
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Service Recommendation
        </h1>
        <p className="text-muted-foreground mt-1">
          Get AI-powered service recommendations tailored to your business needs and budget
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Tell Us About Your Business
              </CardTitle>
              <CardDescription>Fill in the details to get personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Business Type */}
                <div className="space-y-2">
                  <Label className="text-foreground">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-foreground hover:bg-muted">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {businessType === 'Other' && (
                    <Input
                      placeholder="Describe your business type"
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  )}
                </div>

                {/* Budget Range */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Monthly Budget</Label>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatBudget(budgetRange[0])}
                    </span>
                  </div>
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    min={100}
                    max={20000}
                    step={100}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$100</span>
                    <span>$5k</span>
                    <span>$10k</span>
                    <span>$20k</span>
                  </div>
                </div>

                {/* Goal Suggestions */}
                <div className="space-y-2">
                  <Label className="text-foreground">Business Goals</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {GOAL_SUGGESTIONS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          selectedGoals.includes(goal)
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Goals */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Additional Goals (optional)</Label>
                  <Textarea
                    placeholder="Describe any specific goals or challenges..."
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={3}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={getRecommendations.isPending}
                >
                  {getRecommendations.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {getRecommendations.isPending && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Analyzing your business profile...</span>
              </div>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {getRecommendations.isError && !getRecommendations.isPending && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Failed to generate recommendations</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Using rule-based fallback. Please check your API configuration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations && !getRecommendations.isPending && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    {recommendations.length} Recommendations
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-border hover:border-primary hover:text-primary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <RecommendationCard key={idx} rec={rec} index={idx} />
                ))}
              </div>

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Ready to get started?</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Browse our full services catalog or generate a detailed proposal for your top pick.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                      onClick={() => { window.location.href = '/proposal-generator'; }}
                    >
                      Generate Proposal
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!recommendations && !getRecommendations.isPending && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered Recommendations</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Fill in your business details on the left and our AI will suggest the best services for your needs and budget.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
