import React, { useState } from 'react';
import { Lead } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ChevronUp, ChevronDown, Eye, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  leads: Lead[];
  selectedIds: Set<bigint>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: bigint, checked: boolean) => void;
  onViewLead?: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

type SortKey = 'name' | 'status' | 'channel' | 'qualificationScore' | 'createdAt';
type SortDir = 'asc' | 'desc';

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('closed') && s.includes('won')) return 'text-green-400 bg-green-400/10 border-green-400/30';
  if (s.includes('closed') || s.includes('lost')) return 'text-red-400 bg-red-400/10 border-red-400/30';
  if (s.includes('qualified')) return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
  if (s.includes('proposal')) return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
  if (s.includes('contacted')) return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  return 'text-muted-foreground bg-muted/30 border-border';
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export default function LeadTableView({
  leads,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onViewLead,
  onEditLead,
  onDeleteLead,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...leads].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortKey === 'channel') cmp = a.channel.localeCompare(b.channel);
    else if (sortKey === 'qualificationScore') cmp = Number(a.qualificationScore) - Number(b.qualificationScore);
    else if (sortKey === 'createdAt') cmp = Number(a.createdAt) - Number(b.createdAt);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const allSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id));

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                className="border-primary data-[state=checked]:bg-primary"
              />
            </TableHead>
            <TableHead
              className="text-muted-foreground cursor-pointer hover:text-foreground text-xs"
              onClick={() => handleSort('name')}
            >
              Name <SortIcon k="name" />
            </TableHead>
            <TableHead className="text-muted-foreground text-xs">Email</TableHead>
            <TableHead
              className="text-muted-foreground cursor-pointer hover:text-foreground text-xs"
              onClick={() => handleSort('status')}
            >
              Status <SortIcon k="status" />
            </TableHead>
            <TableHead
              className="text-muted-foreground cursor-pointer hover:text-foreground text-xs"
              onClick={() => handleSort('channel')}
            >
              Channel <SortIcon k="channel" />
            </TableHead>
            <TableHead
              className="text-muted-foreground cursor-pointer hover:text-foreground text-xs"
              onClick={() => handleSort('qualificationScore')}
            >
              Score <SortIcon k="qualificationScore" />
            </TableHead>
            <TableHead
              className="text-muted-foreground cursor-pointer hover:text-foreground text-xs"
              onClick={() => handleSort('createdAt')}
            >
              Created <SortIcon k="createdAt" />
            </TableHead>
            <TableHead className="text-muted-foreground text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(lead => (
            <TableRow key={Number(lead.id)} className="border-border hover:bg-muted/20">
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(lead.id)}
                  onCheckedChange={v => onSelectOne(lead.id, !!v)}
                  className="border-primary data-[state=checked]:bg-primary"
                />
              </TableCell>
              <TableCell className="font-medium text-foreground text-sm">{lead.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{lead.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-xs', statusColor(lead.status))}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{lead.channel}</TableCell>
              <TableCell>
                <span className={cn('text-sm font-semibold', scoreColor(Number(lead.qualificationScore)))}>
                  {Number(lead.qualificationScore)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(Number(lead.createdAt) / 1_000_000).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {onViewLead && (
                    <Button size="sm" variant="ghost" onClick={() => onViewLead(lead)} className="h-7 w-7 p-0 hover:text-primary">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {onEditLead && (
                    <Button size="sm" variant="ghost" onClick={() => onEditLead(lead)} className="h-7 w-7 p-0 hover:text-primary">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {onDeleteLead && (
                    <Button size="sm" variant="ghost" onClick={() => onDeleteLead(lead)} className="h-7 w-7 p-0 hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
