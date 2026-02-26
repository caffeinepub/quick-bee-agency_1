import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lead } from '../../backend';
import QualificationBadge from './QualificationBadge';
import { useUpdateLead } from '../../hooks/useQueries';
import { Loader2, Mail, Phone, Building2, Calendar, User, DollarSign } from 'lucide-react';

interface LeadDetailPanelProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GST_RATES = [0, 5, 12, 18, 28];

export default function LeadDetailPanel({ lead, open, onOpenChange }: LeadDetailPanelProps) {
  const [quoteBase, setQuoteBase] = useState<string>('');
  const [gstRate, setGstRate] = useState<number>(18);
  const updateLead = useUpdateLead();

  useEffect(() => {
    if (lead) {
      setQuoteBase('');
      setGstRate(18);
    }
  }, [lead]);

  if (!lead) return null;

  const quoteBaseNum = parseFloat(quoteBase) || 0;
  const gstAmount = quoteBaseNum * (gstRate / 100);
  const quoteTotal = quoteBaseNum + gstAmount;

  const handleSaveQuote = async () => {
    if (!lead) return;
    await updateLead.mutateAsync({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? null,
      channel: lead.channel,
      microNiche: lead.microNiche,
      status: lead.status,
      budgetRange: lead.budgetRange ?? null,
      urgencyLevel: lead.urgencyLevel ?? null,
      companySize: lead.companySize ?? null,
      decisionMakerStatus: lead.decisionMakerStatus ?? null,
    });
    onOpenChange(false);
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const statusColors: Record<string, string> = {
    'New Lead': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-purple-100 text-purple-800',
    'Qualified': 'bg-green-100 text-green-800',
    'Proposal Sent': 'bg-yellow-100 text-yellow-800',
    'Negotiation': 'bg-orange-100 text-orange-800',
    'Won': 'bg-emerald-100 text-emerald-800',
    'Lost': 'bg-red-100 text-red-800',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">{lead.name}</SheetTitle>
          <SheetDescription>Lead Details & GST Quote</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status & Score */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {lead.status}
            </span>
            <QualificationBadge score={Number(lead.qualificationScore)} showScore />
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact</h3>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.companySize && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{lead.companySize} company</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Created {formatDate(lead.createdAt)}</span>
            </div>
          </div>

          <Separator />

          {/* Lead Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Lead Info</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Source</span>
                <p className="font-medium">{lead.channel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Niche</span>
                <p className="font-medium">{lead.microNiche}</p>
              </div>
              {lead.budgetRange !== undefined && lead.budgetRange !== null && (
                <div>
                  <span className="text-muted-foreground">Budget Range</span>
                  <p className="font-medium">Level {String(lead.budgetRange)}</p>
                </div>
              )}
              {lead.urgencyLevel !== undefined && lead.urgencyLevel !== null && (
                <div>
                  <span className="text-muted-foreground">Urgency</span>
                  <p className="font-medium">Level {String(lead.urgencyLevel)}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* GST Quote Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              GST Quote Calculator
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="quoteBase">Base Amount (₹)</Label>
                <Input
                  id="quoteBase"
                  type="number"
                  placeholder="Enter base amount"
                  value={quoteBase}
                  onChange={e => setQuoteBase(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="gstRate">GST Rate</Label>
                <Select value={String(gstRate)} onValueChange={v => setGstRate(Number(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_RATES.map(rate => (
                      <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calculated values */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span>₹{quoteBaseNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST ({gstRate}%)</span>
                  <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total (GST Inclusive)</span>
                  <span className="text-primary">₹{quoteTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Button
                onClick={handleSaveQuote}
                disabled={updateLead.isPending || quoteBaseNum <= 0}
                className="w-full"
              >
                {updateLead.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  'Save Quote'
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
