import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutGrid,
  List,
  Plus,
  Zap,
  Activity,
  Loader2,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';
import {
  useGetAllLeads,
  useGetMyLeads,
  useCreateLead,
  useDeleteLead,
  useIsCallerAdmin,
  useCreatePaymentLink,
  useGetPaymentLinks,
  useGetMyPaymentLinks,
} from '../hooks/useQueries';
import { Lead, PaymentLink } from '../backend';
import LeadFilterPanel, { LeadFilters } from '../components/leads/LeadFilterPanel';
import LeadTableView, { SortField, SortDir } from '../components/leads/LeadTableView';
import LeadExportToolbar from '../components/leads/LeadExportToolbar';
import LeadDetailPanel from '../components/leads/LeadDetailPanel';
import IntegrationPanel from '../components/leads/IntegrationPanel';
import AutomationLogsPanel from '../components/leads/AutomationLogsPanel';
import QualificationBadge from '../components/leads/QualificationBadge';
import type { AutomationLog } from '../utils/exportUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PaymentLinkDialog from '../components/leads/PaymentLinkDialog';
import { useWebhookLog } from '../contexts/WebhookLogContext';

// ─── Create Lead Dialog ───────────────────────────────────────────────────────

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHANNELS = ['Instagram', 'LinkedIn', 'WhatsApp', 'Referral', 'Website', 'Cold Call', 'Email', 'Other'];
const BUDGET_LEVELS = [
  { value: '0', label: 'Low (< ₹10k)' },
  { value: '1', label: 'Medium (₹10k–₹50k)' },
  { value: '2', label: 'High (₹50k–₹2L)' },
  { value: '3', label: 'Enterprise (> ₹2L)' },
];
const URGENCY_LEVELS = [
  { value: '0', label: 'Not Urgent' },
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Immediate' },
];

function CreateLeadDialog({ open, onOpenChange }: CreateLeadDialogProps) {
  const createLead = useCreateLead();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', channel: 'Instagram', microNiche: '',
    budgetRange: '1', urgencyLevel: '1', companySize: 'small', decisionMaker: 'true',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead.mutateAsync({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      channel: form.channel,
      microNiche: form.microNiche,
      budgetRange: BigInt(form.budgetRange),
      urgencyLevel: BigInt(form.urgencyLevel),
      companySize: form.companySize,
      decisionMakerStatus: form.decisionMaker === 'true',
    });
    onOpenChange(false);
    setForm({
      name: '', email: '', phone: '', channel: 'Instagram', microNiche: '',
      budgetRange: '1', urgencyLevel: '1', companySize: 'small', decisionMaker: 'true',
    });
  };

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Enter lead details. Score is calculated automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Full Name *</Label>
              <Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Sharma" />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul@example.com" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1">
              <Label>Source / Channel</Label>
              <Select value={form.channel} onValueChange={v => set('channel', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Micro Niche</Label>
              <Input value={form.microNiche} onChange={e => set('microNiche', e.target.value)} placeholder="E-commerce, SaaS..." />
            </div>
            <div className="space-y-1">
              <Label>Budget Range</Label>
              <Select value={form.budgetRange} onValueChange={v => set('budgetRange', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BUDGET_LEVELS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Urgency Level</Label>
              <Select value={form.urgencyLevel} onValueChange={v => set('urgencyLevel', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{URGENCY_LEVELS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Company Size</Label>
              <Select value={form.companySize} onValueChange={v => set('companySize', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Decision Maker?</Label>
              <Select value={form.decisionMaker} onValueChange={v => set('decisionMaker', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>
                : 'Create Lead'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

const STATUS_COLUMNS = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

interface KanbanCardProps {
  lead: Lead;
  onClick: () => void;
  onDelete: () => void;
  onCreatePaymentLink: () => void;
  isAdmin: boolean;
}

function KanbanCard({ lead, onClick, onDelete, onCreatePaymentLink, isAdmin }: KanbanCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-medium text-sm leading-tight text-foreground">{lead.name}</div>
        <QualificationBadge score={Number(lead.qualificationScore)} />
      </div>
      <div className="text-xs text-muted-foreground mb-2 truncate">{lead.email}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{lead.channel}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 rounded hover:bg-muted"
            onClick={e => { e.stopPropagation(); onCreatePaymentLink(); }}
            title="Create Payment Link"
          >
            <LinkIcon className="h-3 w-3" />
          </button>
          {isAdmin && (
            <button
              className="p-1 rounded hover:bg-destructive/10 text-destructive"
              onClick={e => { e.stopPropagation(); onDelete(); }}
              title="Delete Lead"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main LeadsPage ───────────────────────────────────────────────────────────

export default function LeadsPage() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { logs: webhookLogs } = useWebhookLog();

  // Always call both hooks unconditionally — select data based on isAdmin below
  const { data: allLeads = [], isLoading: allLeadsLoading } = useGetAllLeads();
  const { data: myLeads = [], isLoading: myLeadsLoading } = useGetMyLeads();
  const { data: adminPaymentLinks = [] } = useGetPaymentLinks();
  const { data: myPaymentLinksData = [] } = useGetMyPaymentLinks();

  const deleteLead = useDeleteLead();
  const createPaymentLink = useCreatePaymentLink();

  // Derive correct data based on admin status
  const leads = isAdmin ? allLeads : myLeads;
  const isLoading = isAdmin ? allLeadsLoading : myLeadsLoading;
  const paymentLinks = isAdmin ? adminPaymentLinks : myPaymentLinksData;

  // View state
  const [view, setView] = useState<'kanban' | 'table'>('table');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [paymentLinkDialogOpen, setPaymentLinkDialogOpen] = useState(false);
  const [selectedPaymentLink, setSelectedPaymentLink] = useState<PaymentLink | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<bigint>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<LeadFilters>({
    search: '', status: 'All', channel: 'All', scoreMin: 0, scoreMax: 100,
  });

  // Sort state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Convert webhook logs to AutomationLog format for the panel
  const automationLogs: AutomationLog[] = useMemo(() => {
    return webhookLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      eventName: log.eventName,
      url: log.url,
      payloadSummary: log.payloadSummary,
      statusCode: log.statusCode,
      responseSummary: log.responseSummary,
      isError: log.isError,
    }));
  }, [webhookLogs]);

  // Filtered & sorted leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone ?? '').includes(q)
      );
    }
    if (filters.status !== 'All') {
      result = result.filter(l => l.status === filters.status);
    }
    if (filters.channel !== 'All') {
      result = result.filter(l => l.channel === filters.channel);
    }
    result = result.filter(l => {
      const score = Number(l.qualificationScore);
      return score >= filters.scoreMin && score <= filters.scoreMax;
    });

    result.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      switch (sortField) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'status': aVal = a.status; bVal = b.status; break;
        case 'qualificationScore': aVal = Number(a.qualificationScore); bVal = Number(b.qualificationScore); break;
        case 'createdAt': aVal = Number(a.createdAt); bVal = Number(b.createdAt); break;
        case 'channel': aVal = a.channel; bVal = b.channel; break;
        default: aVal = 0; bVal = 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, filters, sortField, sortDir]);

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSelectChange = (id: bigint, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setDetailLead(lead);
    setDetailOpen(true);
  };

  const handleDeleteLead = async (id: bigint) => {
    if (!confirm('Delete this lead?')) return;
    await deleteLead.mutateAsync(id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleCreatePaymentLink = async (lead: Lead) => {
    await createPaymentLink.mutateAsync({ leadId: lead.id, amount: BigInt(0) });
    const existingLink = paymentLinks.find(pl => pl.leadId === lead.id) ?? null;
    setSelectedPaymentLink(existingLink);
    setPaymentLinkDialogOpen(true);
  };

  const kanbanLeads = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    STATUS_COLUMNS.forEach(col => { map[col] = []; });
    filteredLeads.forEach(lead => {
      if (map[lead.status]) {
        map[lead.status].push(lead);
      } else {
        map['New Lead'].push(lead);
      }
    });
    return map;
  }, [filteredLeads]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Management</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${leads.length} total leads`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLogsOpen(true)}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Automation Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIntegrationOpen(true)}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Integrations
          </Button>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              className={`p-2 ${view === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setView('table')}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              className={`p-2 ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              onClick={() => setView('kanban')}
              title="Kanban View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Export Toolbar */}
      <LeadExportToolbar leads={filteredLeads} selectedIds={selectedIds} />

      {/* Filters — no `leads` prop, the component doesn't accept it */}
      <LeadFilterPanel filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : view === 'table' ? (
        /* LeadTableView does not accept onDeleteLead / onCreatePaymentLink */
        <LeadTableView
          leads={filteredLeads}
          selectedIds={selectedIds}
          onSelectChange={handleSelectChange}
          onSelectAll={handleSelectAll}
          onLeadClick={handleLeadClick}
          sortField={sortField}
          sortDir={sortDir}
          onSortChange={handleSortChange}
        />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {STATUS_COLUMNS.map(col => (
              <div key={col} className="w-64 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">{col}</h3>
                  <Badge variant="outline" className="text-xs">{kanbanLeads[col]?.length ?? 0}</Badge>
                </div>
                <div className="space-y-2">
                  {(kanbanLeads[col] ?? []).map(lead => (
                    <KanbanCard
                      key={String(lead.id)}
                      lead={lead}
                      onClick={() => handleLeadClick(lead)}
                      onDelete={() => handleDeleteLead(lead.id)}
                      onCreatePaymentLink={() => handleCreatePaymentLink(lead)}
                      isAdmin={!!isAdmin}
                    />
                  ))}
                  {(kanbanLeads[col] ?? []).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs & Panels */}
      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* LeadDetailPanel only accepts lead, open, onOpenChange */}
      <LeadDetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        lead={detailLead}
      />

      <IntegrationPanel
        open={integrationOpen}
        onOpenChange={setIntegrationOpen}
      />

      <AutomationLogsPanel
        open={logsOpen}
        onOpenChange={setLogsOpen}
        logs={automationLogs}
      />

      {selectedPaymentLink && (
        <PaymentLinkDialog
          open={paymentLinkDialogOpen}
          onOpenChange={setPaymentLinkDialogOpen}
          paymentLink={selectedPaymentLink}
        />
      )}
    </div>
  );
}
