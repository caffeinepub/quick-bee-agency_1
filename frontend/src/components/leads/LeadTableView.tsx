import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Lead } from '../../backend';
import QualificationBadge from './QualificationBadge';
import { useUpdateLead } from '../../hooks/useQueries';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

export type SortField = 'name' | 'status' | 'qualificationScore' | 'createdAt' | 'channel';
export type SortDir = 'asc' | 'desc';

interface LeadTableViewProps {
  leads: Lead[];
  selectedIds: Set<bigint>;
  onSelectChange: (id: bigint, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onLeadClick: (lead: Lead) => void;
  sortField: SortField;
  sortDir: SortDir;
  onSortChange: (field: SortField) => void;
}

const STATUSES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const statusColors: Record<string, string> = {
  'New Lead': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-purple-100 text-purple-800',
  'Qualified': 'bg-green-100 text-green-800',
  'Proposal Sent': 'bg-yellow-100 text-yellow-800',
  'Negotiation': 'bg-orange-100 text-orange-800',
  'Won': 'bg-emerald-100 text-emerald-800',
  'Lost': 'bg-red-100 text-red-800',
};

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

export default function LeadTableView({
  leads,
  selectedIds,
  onSelectChange,
  onSelectAll,
  onLeadClick,
  sortField,
  sortDir,
  onSortChange,
}: LeadTableViewProps) {
  const updateLead = useUpdateLead();

  const allSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id));
  const someSelected = leads.some(l => selectedIds.has(l.id));

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    await updateLead.mutateAsync({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? null,
      channel: lead.channel,
      microNiche: lead.microNiche,
      status: newStatus,
      budgetRange: lead.budgetRange ?? null,
      urgencyLevel: lead.urgencyLevel ?? null,
      companySize: lead.companySize ?? null,
      decisionMakerStatus: lead.decisionMakerStatus ?? null,
    });
  };

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

  const SortableHead = ({ field, label }: { field: SortField; label: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 whitespace-nowrap"
      onClick={() => onSortChange(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={checked => onSelectAll(!!checked)}
                  aria-label="Select all"
                  ref={el => {
                    if (el) (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected && !allSelected;
                  }}
                />
              </TableHead>
              <SortableHead field="name" label="Name" />
              <TableHead>Contact</TableHead>
              <SortableHead field="status" label="Status" />
              <SortableHead field="channel" label="Source" />
              <TableHead>Assigned To</TableHead>
              <SortableHead field="qualificationScore" label="Score" />
              <SortableHead field="createdAt" label="Created" />
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              leads.map(lead => (
                <TableRow
                  key={String(lead.id)}
                  className="hover:bg-muted/20 cursor-pointer"
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={checked => onSelectChange(lead.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell onClick={() => onLeadClick(lead)}>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">{lead.microNiche}</div>
                  </TableCell>
                  <TableCell onClick={() => onLeadClick(lead)}>
                    <div className="text-sm">{lead.email}</div>
                    {lead.phone && <div className="text-xs text-muted-foreground">{lead.phone}</div>}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Select
                      value={lead.status}
                      onValueChange={v => handleStatusChange(lead, v)}
                    >
                      <SelectTrigger className="h-7 text-xs border-0 p-0 w-auto focus:ring-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {lead.status}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => (
                          <SelectItem key={s} value={s}>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s] ?? ''}`}>{s}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell onClick={() => onLeadClick(lead)}>
                    <span className="text-sm">{lead.channel}</span>
                  </TableCell>
                  <TableCell onClick={() => onLeadClick(lead)}>
                    {lead.assignedTo ? (
                      <span className="text-xs text-muted-foreground font-mono">
                        {lead.assignedTo.toString().slice(0, 8)}…
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell onClick={() => onLeadClick(lead)}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{String(lead.qualificationScore)}</span>
                      <QualificationBadge score={Number(lead.qualificationScore)} />
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onLeadClick(lead)}>
                    <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onLeadClick(lead)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
