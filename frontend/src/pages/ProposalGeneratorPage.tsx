import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Wand2,
  Loader2,
  Download,
  RefreshCw,
  FileText,
  Building2,
  DollarSign,
  ClipboardList,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useGenerateProposal, useGetAllServices, type ProposalFormData, type GeneratedProposal } from '../hooks/useQueries';
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

function ProposalPreview({ proposal }: { proposal: GeneratedProposal }) {
  return (
    <div className="proposal-content space-y-6 text-foreground">
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">{proposal.title}</h1>
        <p className="text-sm text-muted-foreground">Prepared for: {proposal.clientName}</p>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {proposal.date}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Executive Summary
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{proposal.executiveSummary}</p>
      </div>

      <Separator />

      {/* Services Included */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Services Included
        </h2>
        <div className="space-y-2">
          {proposal.servicesIncluded.map((svc, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{svc.name}</p>
                  <Badge className="text-xs border border-primary/50 text-primary bg-primary/10">
                    {svc.tier}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Scope */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          Project Scope
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{proposal.scope}</p>
      </div>

      <Separator />

      {/* Investment */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Investment
        </h2>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-sm font-medium text-foreground">{proposal.investment}</p>
        </div>
      </div>

      <Separator />

      {/* Timeline */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Timeline
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{proposal.timeline}</p>
      </div>

      <Separator />

      {/* Next Steps */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" />
          Next Steps
        </h2>
        <div className="space-y-1">
          {proposal.nextSteps.split('\n').map((step, idx) => (
            <p key={idx} className="text-sm text-muted-foreground">{step}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProposalGeneratorPage() {
  const [clientName, setClientName] = useState('');
  const [clientBusinessType, setClientBusinessType] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [scope, setScope] = useState('');
  const [budget, setBudget] = useState('');
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);

  const proposalRef = useRef<HTMLDivElement>(null);
  const generateProposal = useGenerateProposal();
  const { data: services = [] } = useGetAllServices();

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error('Please enter the client name');
      return;
    }

    const finalBusinessType = clientBusinessType === 'Other' ? customBusinessType : clientBusinessType;
    if (!finalBusinessType) {
      toast.error('Please select or enter the client business type');
      return;
    }

    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    const budgetNum = parseFloat(budget);
    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    const formData: ProposalFormData = {
      clientName: clientName.trim(),
      clientBusinessType: finalBusinessType,
      selectedServices,
      scope: scope.trim(),
      budget: budgetNum,
    };

    try {
      const result = await generateProposal.mutateAsync(formData);
      setProposal(result);
      toast.success('Proposal generated successfully!');
    } catch {
      toast.error('Failed to generate proposal. Please try again.');
    }
  };

  const handleDownloadPDF = () => {
    if (!proposal) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download the PDF');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${proposal.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #111; }
            h1 { color: #14b8a6; font-size: 24px; text-align: center; }
            h2 { color: #14b8a6; font-size: 16px; margin-top: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            p { color: #374151; line-height: 1.6; font-size: 14px; }
            .service-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 8px 0; }
            .investment-box { background: #f0fdfa; border: 1px solid #14b8a6; border-radius: 8px; padding: 12px; }
            .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            .text-center { text-align: center; }
            .text-muted { color: #6b7280; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>${proposal.title}</h1>
          <p class="text-center text-muted">Prepared for: ${proposal.clientName}</p>
          <p class="text-center text-muted">${proposal.date}</p>
          <hr/>
          <h2>Executive Summary</h2>
          <p>${proposal.executiveSummary}</p>
          <hr/>
          <h2>Services Included</h2>
          ${proposal.servicesIncluded.map((s, i) => `
            <div class="service-item">
              <strong>${i + 1}. ${s.name}</strong> <span class="badge">${s.tier}</span>
              <p>${s.description}</p>
            </div>
          `).join('')}
          <hr/>
          <h2>Project Scope</h2>
          <p>${proposal.scope}</p>
          <hr/>
          <h2>Investment</h2>
          <div class="investment-box"><p>${proposal.investment}</p></div>
          <hr/>
          <h2>Timeline</h2>
          <p>${proposal.timeline}</p>
          <hr/>
          <h2>Next Steps</h2>
          ${proposal.nextSteps.split('\n').map((s) => `<p>${s}</p>`).join('')}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleReset = () => {
    setProposal(null);
    setClientName('');
    setClientBusinessType('');
    setCustomBusinessType('');
    setSelectedServices([]);
    setScope('');
    setBudget('');
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Wand2 className="h-8 w-8 text-primary" />
          Proposal Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate professional, AI-powered proposals for your clients in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Proposal Details
              </CardTitle>
              <CardDescription>Fill in the client and project information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Client Name */}
                <div className="space-y-2">
                  <Label className="text-foreground">Client Name</Label>
                  <Input
                    placeholder="e.g. Acme Corporation"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Client Business Type */}
                <div className="space-y-2">
                  <Label className="text-foreground">Client Business Type</Label>
                  <Select value={clientBusinessType} onValueChange={setClientBusinessType}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-foreground hover:bg-muted">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {clientBusinessType === 'Other' && (
                    <Input
                      placeholder="Describe the business type"
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  )}
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Select Services
                    {selectedServices.length > 0 && (
                      <Badge className="ml-2 text-xs bg-primary/20 text-primary border-primary/30">
                        {selectedServices.length} selected
                      </Badge>
                    )}
                  </Label>
                  <ScrollArea className="h-36 rounded-md border border-border bg-background p-2">
                    {services.length === 0 ? (
                      <div className="space-y-2 p-1">
                        {['Social Media Management', 'SEO Optimization', 'Content Marketing', 'Email Campaigns', 'PPC Advertising'].map((svc) => (
                          <div key={svc} className="flex items-center gap-2">
                            <Checkbox
                              id={svc}
                              checked={selectedServices.includes(svc)}
                              onCheckedChange={() => toggleService(svc)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor={svc} className="text-sm text-foreground cursor-pointer">
                              {svc}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 p-1">
                        {services.map((svc) => (
                          <div key={String(svc.id)} className="flex items-center gap-2">
                            <Checkbox
                              id={String(svc.id)}
                              checked={selectedServices.includes(svc.name)}
                              onCheckedChange={() => toggleService(svc.name)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor={String(svc.id)} className="text-sm text-foreground cursor-pointer">
                              {svc.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Project Scope */}
                <div className="space-y-2">
                  <Label className="text-foreground">Project Scope / Notes</Label>
                  <Textarea
                    placeholder="Describe the project scope, specific requirements, or any notes..."
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    rows={3}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <Label className="text-foreground">Budget (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="5000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      min="0"
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground pl-9"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={generateProposal.isPending}
                >
                  {generateProposal.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Proposal
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Preview */}
        <div className="lg:col-span-3">
          {generateProposal.isPending && (
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">Generating your proposal...</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Separator />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Separator />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {proposal && !generateProposal.isPending && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Generated Proposal
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="border-border hover:border-primary hover:text-primary"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      New
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownloadPDF}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div ref={proposalRef}>
                    <ProposalPreview proposal={proposal} />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {!proposal && !generateProposal.isPending && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Proposal Generator</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Fill in the client details on the left and click "Generate Proposal" to create a professional, customized proposal.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: <Building2 className="h-5 w-5 text-primary" />, label: 'Client Details' },
                  { icon: <ClipboardList className="h-5 w-5 text-primary" />, label: 'Service Selection' },
                  { icon: <FileText className="h-5 w-5 text-primary" />, label: 'PDF Export' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                    {item.icon}
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
