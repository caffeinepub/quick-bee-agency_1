import { useState } from 'react';
import { DollarSign, Download, Sparkles, TrendingUp, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PricingResult {
  basePrice: number;
  urgencyMultiplier: number;
  complexityMultiplier: number;
  addonsTotal: number;
  finalPrice: number;
  psychologicalPrice: number;
  profitMargin: number;
  pricingSuggestion: string;
  timestamp: string;
}

const ADDONS = [
  { id: 'rush', label: 'Rush Delivery', price: 500 },
  { id: 'support', label: '3-Month Support', price: 300 },
  { id: 'revisions', label: 'Unlimited Revisions', price: 200 },
  { id: 'analytics', label: 'Analytics Dashboard', price: 400 },
  { id: 'training', label: 'Team Training', price: 350 },
  { id: 'seo', label: 'SEO Optimization', price: 250 },
];

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + 'Z';
}

function getPsychologicalPrice(price: number): number {
  if (price < 100) return Math.floor(price) - 0.01;
  if (price < 1000) return Math.floor(price / 10) * 10 - 5;
  if (price < 10000) return Math.floor(price / 100) * 100 - 1;
  return Math.floor(price / 1000) * 1000 - 1;
}

export default function PricingStrategyPage() {
  const [basePrice, setBasePrice] = useState('');
  const [urgency, setUrgency] = useState([1.0]);
  const [complexity, setComplexity] = useState([1.0]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [result, setResult] = useState<PricingResult | null>(null);
  const [animating, setAnimating] = useState(false);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleCalculate = async () => {
    const base = parseFloat(basePrice);
    if (!base || base <= 0) {
      toast.error('Please enter a valid base price');
      return;
    }

    setAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const addonsTotal = ADDONS.filter(a => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
    const finalPrice = base * urgency[0] * complexity[0] + addonsTotal;
    const psychologicalPrice = getPsychologicalPrice(finalPrice);
    const costEstimate = base * 0.4;
    const profitMargin = ((finalPrice - costEstimate) / finalPrice) * 100;

    let pricingSuggestion = '';
    if (urgency[0] >= 1.5 && complexity[0] >= 1.5) {
      pricingSuggestion = `Premium positioning recommended. Use $${psychologicalPrice.toLocaleString()} as your anchor price. Offer a "Standard" tier at $${(psychologicalPrice * 0.7).toFixed(0)} to make the premium feel justified.`;
    } else if (urgency[0] >= 1.3) {
      pricingSuggestion = `Urgency-based pricing is effective here. Present as "Limited availability" at $${psychologicalPrice.toLocaleString()}. Add a countdown timer to increase conversion by up to 30%.`;
    } else if (complexity[0] >= 1.3) {
      pricingSuggestion = `Complexity justifies premium pricing. Position at $${psychologicalPrice.toLocaleString()} and emphasize the expertise required. Bundle with a guarantee to reduce buyer hesitation.`;
    } else {
      pricingSuggestion = `Standard market pricing at $${psychologicalPrice.toLocaleString()}. Consider offering a payment plan (3x monthly) to increase accessibility and close rate.`;
    }

    const newResult: PricingResult = {
      basePrice: base,
      urgencyMultiplier: urgency[0],
      complexityMultiplier: complexity[0],
      addonsTotal,
      finalPrice,
      psychologicalPrice,
      profitMargin,
      pricingSuggestion,
      timestamp: new Date().toISOString(),
    };

    setResult(newResult);
    setAnimating(false);
    toast.success('Pricing strategy calculated!');
  };

  const downloadPDF = () => {
    if (!result) return;
    const content = `PRICING STRATEGY REPORT
Generated: ${new Date(result.timestamp).toLocaleString()}
${'='.repeat(60)}

INPUTS
Base Price: $${result.basePrice.toLocaleString()}
Urgency Multiplier: ${result.urgencyMultiplier}x
Complexity Multiplier: ${result.complexityMultiplier}x
Add-ons Total: $${result.addonsTotal.toLocaleString()}

${'='.repeat(60)}
RESULTS
Final Recommended Price: $${result.finalPrice.toFixed(2)}
Psychological Price: $${result.psychologicalPrice.toLocaleString()}
Profit Margin: ${result.profitMargin.toFixed(1)}%

PRICING SUGGESTION
${result.pricingSuggestion}
${'='.repeat(60)}
Generated by QuickBee AI Platform`;
    downloadFile(content, `pricing_${getTimestamp()}.txt`, 'text/plain');
    toast.success('PDF downloaded');
  };

  const downloadExcel = () => {
    if (!result) return;
    const rows = [
      'Field\tValue',
      `Base Price\t$${result.basePrice}`,
      `Urgency Multiplier\t${result.urgencyMultiplier}x`,
      `Complexity Multiplier\t${result.complexityMultiplier}x`,
      `Add-ons Total\t$${result.addonsTotal}`,
      `Final Price\t$${result.finalPrice.toFixed(2)}`,
      `Psychological Price\t$${result.psychologicalPrice}`,
      `Profit Margin\t${result.profitMargin.toFixed(1)}%`,
      `Pricing Suggestion\t${result.pricingSuggestion}`,
    ];
    downloadFile(rows.join('\n'), `pricing_${getTimestamp()}.csv`, 'text/csv');
    toast.success('Excel downloaded');
  };

  const downloadCSV = () => {
    if (!result) return;
    const csv = `Field,Value\nBase Price,$${result.basePrice}\nUrgency Multiplier,${result.urgencyMultiplier}x\nComplexity Multiplier,${result.complexityMultiplier}x\nAdd-ons Total,$${result.addonsTotal}\nFinal Price,$${result.finalPrice.toFixed(2)}\nPsychological Price,$${result.psychologicalPrice}\nProfit Margin,${result.profitMargin.toFixed(1)}%\nTimestamp,${result.timestamp}`;
    downloadFile(csv, `pricing_${getTimestamp()}.csv`, 'text/csv');
    toast.success('CSV downloaded');
  };

  const downloadJSON = () => {
    if (!result) return;
    downloadFile(JSON.stringify(result, null, 2), `pricing_${getTimestamp()}.json`, 'application/json');
    toast.success('JSON downloaded');
  };

  const addonsTotal = ADDONS.filter(a => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  const previewPrice = basePrice ? parseFloat(basePrice) * urgency[0] * complexity[0] + addonsTotal : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-teal flex items-center justify-center neon-glow-sm">
          <DollarSign className="w-6 h-6 text-[#0B0F14]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-teal-text">Dynamic Pricing Strategy</h1>
          <p className="text-sm text-[oklch(0.60_0.02_200)]">Calculate optimal pricing with AI-powered suggestions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="glass rounded-2xl p-6 border border-[oklch(0.82_0.18_175/0.15)] space-y-6">
          <h2 className="text-lg font-semibold text-[oklch(0.90_0.01_200)]">Pricing Inputs</h2>

          {/* Base Price */}
          <div>
            <Label className="text-[oklch(0.75_0.01_200)] mb-2 block">Base Price (USD)</Label>
            <Input
              type="number"
              placeholder="e.g. 2000"
              value={basePrice}
              onChange={e => setBasePrice(e.target.value)}
              className="bg-[oklch(0.14_0.015_200)] border-[oklch(0.20_0.02_200)] text-[oklch(0.90_0.01_200)] rounded-xl focus:border-[oklch(0.82_0.18_175/0.5)] placeholder-[oklch(0.45_0.02_200)]"
            />
          </div>

          {/* Urgency Multiplier */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-[oklch(0.75_0.01_200)]">Urgency Multiplier</Label>
              <span className="text-sm font-bold gradient-teal-text">{urgency[0].toFixed(1)}x</span>
            </div>
            <Slider
              value={urgency}
              onValueChange={setUrgency}
              min={1.0}
              max={2.5}
              step={0.1}
              className="[&_[role=slider]]:bg-[oklch(0.82_0.18_175)] [&_[role=slider]]:border-[oklch(0.82_0.18_175)] [&_.relative]:bg-[oklch(0.20_0.02_200)]"
            />
            <div className="flex justify-between text-xs text-[oklch(0.50_0.02_200)] mt-1">
              <span>Normal (1x)</span>
              <span>Urgent (1.5x)</span>
              <span>Critical (2.5x)</span>
            </div>
          </div>

          {/* Complexity Multiplier */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-[oklch(0.75_0.01_200)]">Complexity Multiplier</Label>
              <span className="text-sm font-bold gradient-teal-text">{complexity[0].toFixed(1)}x</span>
            </div>
            <Slider
              value={complexity}
              onValueChange={setComplexity}
              min={1.0}
              max={3.0}
              step={0.1}
              className="[&_[role=slider]]:bg-[oklch(0.82_0.18_175)] [&_[role=slider]]:border-[oklch(0.82_0.18_175)] [&_.relative]:bg-[oklch(0.20_0.02_200)]"
            />
            <div className="flex justify-between text-xs text-[oklch(0.50_0.02_200)] mt-1">
              <span>Simple (1x)</span>
              <span>Medium (2x)</span>
              <span>Complex (3x)</span>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <Label className="text-[oklch(0.75_0.01_200)] mb-3 block">Add-ons</Label>
            <div className="grid grid-cols-2 gap-2">
              {ADDONS.map(addon => (
                <label
                  key={addon.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                    selectedAddons.includes(addon.id)
                      ? "border-[oklch(0.82_0.18_175/0.5)] bg-[oklch(0.82_0.18_175/0.1)]"
                      : "border-[oklch(0.20_0.02_200)] hover:border-[oklch(0.82_0.18_175/0.3)]"
                  )}
                >
                  <Checkbox
                    checked={selectedAddons.includes(addon.id)}
                    onCheckedChange={() => toggleAddon(addon.id)}
                    className="border-[oklch(0.82_0.18_175/0.5)] data-[state=checked]:bg-[oklch(0.82_0.18_175)] data-[state=checked]:border-[oklch(0.82_0.18_175)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[oklch(0.85_0.01_200)] truncate">{addon.label}</p>
                    <p className="text-xs text-[oklch(0.82_0.18_175)]">+${addon.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          {previewPrice > 0 && (
            <div className="glass rounded-xl p-3 border border-[oklch(0.82_0.18_175/0.2)] flex items-center justify-between">
              <span className="text-sm text-[oklch(0.65_0.02_200)]">Live Preview</span>
              <span className="text-lg font-bold gradient-teal-text">${previewPrice.toFixed(2)}</span>
            </div>
          )}

          <Button
            onClick={handleCalculate}
            disabled={animating}
            className="w-full gradient-teal text-[#0B0F14] font-bold rounded-xl py-3 hover:opacity-90 transition-all neon-glow-sm disabled:opacity-50"
          >
            {animating ? (
              <><span className="animate-spin mr-2">⚡</span>Calculating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Calculate Optimal Price</>
            )}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result && !animating ? (
            <div className="space-y-4 animate-price-reveal">
              {/* Main Price Card */}
              <div className="glass rounded-2xl p-6 border border-[oklch(0.82_0.18_175/0.4)] neon-glow text-center">
                <p className="text-sm text-[oklch(0.60_0.02_200)] mb-2">Recommended Price</p>
                <div className="text-5xl font-bold gradient-teal-text mb-1">
                  ${result.psychologicalPrice.toLocaleString()}
                </div>
                <p className="text-xs text-[oklch(0.55_0.02_200)]">
                  Calculated: ${result.finalPrice.toFixed(2)} → Psychological: ${result.psychologicalPrice.toLocaleString()}
                </p>
              </div>

              {/* Breakdown */}
              <div className="glass rounded-2xl p-5 border border-[oklch(0.82_0.18_175/0.15)] space-y-3">
                <h3 className="font-semibold text-[oklch(0.82_0.18_175)] text-sm">Price Breakdown</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Base Price', value: `$${result.basePrice.toLocaleString()}` },
                    { label: `Urgency (${result.urgencyMultiplier}x)`, value: `+$${(result.basePrice * (result.urgencyMultiplier - 1)).toFixed(2)}` },
                    { label: `Complexity (${result.complexityMultiplier}x)`, value: `+$${(result.basePrice * result.urgencyMultiplier * (result.complexityMultiplier - 1)).toFixed(2)}` },
                    { label: 'Add-ons', value: `+$${result.addonsTotal.toLocaleString()}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-[oklch(0.65_0.02_200)]">{row.label}</span>
                      <span className="text-[oklch(0.85_0.01_200)]">{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-[oklch(0.82_0.18_175/0.2)] pt-2 flex justify-between">
                    <span className="font-semibold text-[oklch(0.85_0.01_200)]">Profit Margin</span>
                    <span className="font-bold gradient-teal-text">{result.profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Strategy */}
              <div className="glass rounded-2xl p-5 border border-[oklch(0.78_0.18_75/0.3)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[oklch(0.78_0.18_75/0.2)] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[oklch(0.85_0.18_75)]" />
                  </div>
                  <h3 className="font-semibold text-[oklch(0.85_0.18_75)] text-sm">Psychological Pricing Strategy</h3>
                </div>
                <p className="text-sm text-[oklch(0.80_0.01_200)] leading-relaxed">{result.pricingSuggestion}</p>
              </div>

              {/* Download Buttons */}
              <div className="glass rounded-2xl p-4 border border-[oklch(0.82_0.18_175/0.15)]">
                <h3 className="font-semibold text-[oklch(0.75_0.01_200)] mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[oklch(0.82_0.18_175)]" />
                  Export Pricing Report
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadPDF} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </Button>
                  <Button onClick={downloadExcel} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileSpreadsheet className="w-3 h-3 mr-1" /> Excel
                  </Button>
                  <Button onClick={downloadCSV} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileSpreadsheet className="w-3 h-3 mr-1" /> CSV
                  </Button>
                  <Button onClick={downloadJSON} variant="outline" size="sm" className="border-[oklch(0.82_0.18_175/0.3)] text-[oklch(0.82_0.18_175)] hover:bg-[oklch(0.82_0.18_175/0.1)] rounded-xl">
                    <FileJson className="w-3 h-3 mr-1" /> JSON
                  </Button>
                </div>
              </div>
            </div>
          ) : animating ? (
            <div className="glass rounded-2xl p-8 border border-[oklch(0.82_0.18_175/0.3)] flex flex-col items-center justify-center gap-4 animate-glow-pulse min-h-64">
              <div className="text-5xl animate-bounce">⚡</div>
              <p className="text-[oklch(0.82_0.18_175)] font-semibold">Calculating optimal price...</p>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 border border-[oklch(0.82_0.18_175/0.1)] flex flex-col items-center justify-center gap-3 text-center min-h-64">
              <div className="w-16 h-16 rounded-2xl bg-[oklch(0.82_0.18_175/0.1)] flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-[oklch(0.82_0.18_175/0.5)]" />
              </div>
              <p className="text-[oklch(0.60_0.02_200)] text-sm">Enter your pricing inputs and click Calculate to get AI-powered pricing recommendations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
