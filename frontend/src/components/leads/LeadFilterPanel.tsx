import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';

export interface LeadFilters {
  search: string;
  status: string;
  channel: string;
  scoreMin: number;
  scoreMax: number;
}

interface LeadFilterPanelProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
}

const STATUSES = ['All', 'New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const CHANNELS = ['All', 'Instagram', 'LinkedIn', 'WhatsApp', 'Referral', 'Website', 'Cold Call', 'Email', 'Other'];

export default function LeadFilterPanel({ filters, onFiltersChange }: LeadFilterPanelProps) {
  const update = (partial: Partial<LeadFilters>) => onFiltersChange({ ...filters, ...partial });

  const hasActiveFilters = filters.search || filters.status !== 'All' || filters.channel !== 'All' || filters.scoreMin > 0 || filters.scoreMax < 100;

  const clearAll = () => onFiltersChange({ search: '', status: 'All', channel: 'All', scoreMin: 0, scoreMax: 100 });

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs gap-1">
            <X className="h-3 w-3" /> Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <Input
            placeholder="Name, email, phone..."
            value={filters.search}
            onChange={e => update({ search: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        {/* Status */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={filters.status} onValueChange={v => update({ status: v })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Channel */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Source / Channel</Label>
          <Select value={filters.channel} onValueChange={v => update({ channel: v })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Score Range */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Score Range: {filters.scoreMin}–{filters.scoreMax}
          </Label>
          <div className="px-1 pt-2">
            <Slider
              min={0}
              max={100}
              step={5}
              value={[filters.scoreMin, filters.scoreMax]}
              onValueChange={([min, max]) => update({ scoreMin: min, scoreMax: max })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
