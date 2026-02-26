import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Zap, Clock, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'enterprise';

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; multiplier: number; description: string }[] = [
  { value: 'low', label: 'Low', multiplier: 1.0, description: 'Standard timeline, no rush' },
  { value: 'medium', label: 'Medium', multiplier: 1.25, description: 'Moderate urgency, 2-4 weeks' },
  { value: 'high', label: 'High', multiplier: 1.5, description: 'Urgent, within 1-2 weeks' },
  { value: 'critical', label: 'Critical', multiplier: 2.0, description: 'Immediate, within days' },
];

const COMPLEXITY_OPTIONS: { value: ComplexityLevel; label: string; multiplier: number; description: string }[] = [
  { value: 'simple', label: 'Simple', multiplier: 1.0, description: 'Straightforward, well-defined scope' },
  { value: 'moderate', label: 'Moderate', multiplier: 1.3, description: 'Some complexity, standard integrations' },
  { value: 'complex', label: 'Complex', multiplier: 1.6, description: 'High complexity, custom solutions' },
  { value: 'enterprise', label: 'Enterprise', multiplier: 2.2, description: 'Enterprise-grade, full customization' },
];

export default function PricingStrategyPage() {
  const navigate = useNavigate();

  const [basePrice, setBasePrice] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('low');
  const [complexity, setComplexity] = useState<ComplexityLevel>('simple');
  const [finalPrice, setFinalPrice] = useState(0);
  const [breakdown, setBreakdown] = useState({
    base: 0,
    afterUrgency: 0,
    afterComplexity: 0,
    urgencyAmount: 0,
    complexityAmount: 0,
    urgencyMultiplier: 1.0,
    complexityMultiplier: 1.0,
  });

  const selectedUrgency = URGENCY_OPTIONS.find((o) => o.value === urgency)!;
  const selectedComplexity = COMPLEXITY_OPTIONS.find((o) => o.value === complexity)!;

  useEffect(() => {
    const base = parseFloat(basePrice) || 0;
    const urgencyMult = selectedUrgency.multiplier;
    const complexityMult = selectedComplexity.multiplier;

    const afterUrgency = base * urgencyMult;
    const afterComplexity = afterUrgency * complexityMult;
    const urgencyAmount = afterUrgency - base;
    const complexityAmount = afterComplexity - afterUrgency;

    setFinalPrice(afterComplexity);
    setBreakdown({
      base,
      afterUrgency,
      afterComplexity,
      urgencyAmount,
      complexityAmount,
      urgencyMultiplier: urgencyMult,
      complexityMultiplier: complexityMult,
    });
  }, [basePrice, urgency, complexity, selectedUrgency, selectedComplexity]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (multiplier: number) => {
    const percent = (multiplier - 1) * 100;
    return percent === 0 ? 'No markup' : `+${percent.toFixed(0)}%`;
  };

  const getUrgencyColor = (value: UrgencyLevel) => {
    switch (value) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-destructive';
    }
  };

  const getComplexityColor = (value: ComplexityLevel) => {
    switch (value) {
      case 'simple': return 'text-success';
      case 'moderate': return 'text-warning';
      case 'complex': return 'text-orange-500';
      case 'enterprise': return 'text-destructive';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/generators' })}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Generators
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground">Pricing Strategy Engine</h1>
              <p className="text-muted-foreground text-sm">Dynamic pricing calculator with urgency & complexity multipliers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Inputs */}
          <div className="space-y-5">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground font-heading text-lg">Pricing Inputs</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Set your base price and adjust multipliers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Base Price */}
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="text-foreground font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Base Service Price (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      id="basePrice"
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="e.g. 5000"
                      min="0"
                      className="pl-7 bg-input border-border text-foreground placeholder:text-muted-foreground text-lg font-semibold"
                    />
                  </div>
                </div>

                {/* Urgency Level */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Urgency Level
                  </Label>
                  <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {URGENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-foreground">
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span>{opt.label}</span>
                            <span className="text-xs text-muted-foreground">{formatPercent(opt.multiplier)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{selectedUrgency.description}</p>
                </div>

                {/* Complexity Level */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Complexity Level
                  </Label>
                  <Select value={complexity} onValueChange={(v) => setComplexity(v as ComplexityLevel)}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {COMPLEXITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-foreground">
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span>{opt.label}</span>
                            <span className="text-xs text-muted-foreground">{formatPercent(opt.multiplier)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{selectedComplexity.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Multiplier Reference */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground font-heading text-sm">Multiplier Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Urgency</p>
                  <div className="grid grid-cols-2 gap-2">
                    {URGENCY_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        className={`p-2 rounded-md border text-xs ${
                          urgency === opt.value
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <span className="font-medium text-foreground">{opt.label}</span>
                        <span className={`ml-2 ${getUrgencyColor(opt.value)}`}>×{opt.multiplier}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Complexity</p>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPLEXITY_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        className={`p-2 rounded-md border text-xs ${
                          complexity === opt.value
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <span className="font-medium text-foreground">{opt.label}</span>
                        <span className={`ml-2 ${getComplexityColor(opt.value)}`}>×{opt.multiplier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-5">
            {/* Final Price Display */}
            <Card className={`bg-card border-2 ${breakdown.base > 0 ? 'border-primary/50 shadow-yellow-sm' : 'border-border'}`}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide mb-2">Final Price</p>
                  <div className="text-5xl font-bold font-heading text-primary mb-2">
                    {breakdown.base > 0 ? formatCurrency(finalPrice) : '$—'}
                  </div>
                  {breakdown.base > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {((finalPrice / breakdown.base - 1) * 100).toFixed(0)}% above base
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground font-heading text-lg">Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Base Price Row */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="text-foreground text-sm">Base Price</span>
                  </div>
                  <span className="text-foreground font-semibold">
                    {breakdown.base > 0 ? formatCurrency(breakdown.base) : '$—'}
                  </span>
                </div>

                <Separator className="bg-border" />

                {/* Urgency Row */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${urgency === 'low' ? 'bg-success' : 'bg-warning'}`} />
                    <div>
                      <span className="text-foreground text-sm">Urgency: </span>
                      <span className={`text-sm font-medium ${getUrgencyColor(urgency)}`}>{selectedUrgency.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                      ×{selectedUrgency.multiplier}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold text-sm ${breakdown.urgencyAmount > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                      {breakdown.base > 0
                        ? breakdown.urgencyAmount > 0
                          ? `+${formatCurrency(breakdown.urgencyAmount)}`
                          : 'No markup'
                        : '$—'}
                    </span>
                  </div>
                </div>

                {/* Complexity Row */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${complexity === 'simple' ? 'bg-success' : 'bg-orange-500'}`} />
                    <div>
                      <span className="text-foreground text-sm">Complexity: </span>
                      <span className={`text-sm font-medium ${getComplexityColor(complexity)}`}>{selectedComplexity.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                      ×{selectedComplexity.multiplier}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold text-sm ${breakdown.complexityAmount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      {breakdown.base > 0
                        ? breakdown.complexityAmount > 0
                          ? `+${formatCurrency(breakdown.complexityAmount)}`
                          : 'No markup'
                        : '$—'}
                    </span>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Total Row */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-semibold">Total Price</span>
                  </div>
                  <span className="text-primary font-bold text-lg">
                    {breakdown.base > 0 ? formatCurrency(finalPrice) : '$—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Client Presentation Card */}
            {breakdown.base > 0 && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground font-heading text-sm">Client Presentation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Investment</span>
                      <span className="text-foreground font-medium">{formatCurrency(finalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Urgency Premium</span>
                      <span className="text-foreground font-medium">{formatPercent(breakdown.urgencyMultiplier)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complexity Premium</span>
                      <span className="text-foreground font-medium">{formatPercent(breakdown.complexityMultiplier)}</span>
                    </div>
                    <Separator className="bg-border my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total Investment</span>
                      <span className="text-primary">{formatCurrency(finalPrice)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={() => navigate({ to: '/proposal-generator' })}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Proposal with This Price
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import FileText for the button
function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
