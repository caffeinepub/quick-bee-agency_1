import React, { useState } from 'react';
import { Lead } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  X, Mail, Phone, Building2, User, Calendar, TrendingUp,
  DollarSign, Clock, CheckCircle, Edit2, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  lead: Lead;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

const BUDGET_LABELS = ['< ₹50K', '₹50K–₹2L', '₹2L–₹10L', '₹10L+'];
const URGENCY_LABELS = ['Low', 'Medium', 'High', 'Immediate'];

export default function LeadDetailPanel({ lead, onClose, onEdit, onDelete }: Props) {
  const score = Number(lead.qualificationScore);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Lead Details</h2>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Name & Status */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">{lead.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                {lead.status}
              </Badge>
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                {lead.channel}
              </Badge>
            </div>
          </div>

          {/* Score */}
          <div className="bg-muted/30 rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Qualification Score</span>
              <span className={cn('text-lg font-bold', scoreColor(score))}>{score}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={cn('h-1.5 rounded-full transition-all', score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-amber-400' : score >= 40 ? 'bg-orange-400' : 'bg-red-400')}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Contact Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={lead.email} />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={lead.phone} />
          </div>

          <Separator className="bg-border" />

          {/* Business Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Business</p>
            <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company Size" value={lead.companySize} />
            <InfoRow icon={<TrendingUp className="w-4 h-4" />} label="Micro Niche" value={lead.microNiche} />
            <InfoRow
              icon={<DollarSign className="w-4 h-4" />}
              label="Budget Range"
              value={lead.budgetRange !== undefined && lead.budgetRange !== null ? BUDGET_LABELS[Number(lead.budgetRange)] : undefined}
            />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="Urgency"
              value={lead.urgencyLevel !== undefined && lead.urgencyLevel !== null ? URGENCY_LABELS[Number(lead.urgencyLevel)] : undefined}
            />
            <InfoRow
              icon={<CheckCircle className="w-4 h-4" />}
              label="Decision Maker"
              value={lead.decisionMakerStatus !== undefined && lead.decisionMakerStatus !== null ? (lead.decisionMakerStatus ? 'Yes' : 'No') : undefined}
            />
          </div>

          <Separator className="bg-border" />

          {/* Dates */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</p>
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Created At"
              value={new Date(Number(lead.createdAt) / 1_000_000).toLocaleString()}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="p-4 border-t border-border flex gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(lead)}
              className="flex-1 border-border hover:border-primary/50 hover:text-primary"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(lead)}
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
