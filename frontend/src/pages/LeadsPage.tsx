import React, { useState } from 'react';
import { Plus, Search, Download, Users, Trash2, Link } from 'lucide-react';
import {
  useGetAllLeads, useCreateLead, useUpdateLead, useDeleteLead,
  useIsCallerAdmin, useCreatePaymentLink, useGetPaymentLinks
} from '../hooks/useQueries';
import { Lead } from '../backend';
import BulkActionsToolbar from '../components/leads/BulkActionsToolbar';
import PaymentLinkDialog from '../components/leads/PaymentLinkDialog';

const STATUS_COLORS: Record<string, string> = {
  'New Lead': 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  'Contacted': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Qualified': 'text-green-400 bg-green-500/10 border-green-500/20',
  'Proposal Sent': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Closed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Lost': 'text-red-400 bg-red-500/10 border-red-500/20',
  'paid': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
};

export default function LeadsPage() {
  const { data: leads = [], isLoading } = useGetAllLeads();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: paymentLinks = [] } = useGetPaymentLinks();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const createPaymentLink = useCreatePaymentLink();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [paymentLinkLead, setPaymentLinkLead] = useState<Lead | null>(null);
  const [paymentLinkDialogOpen, setPaymentLinkDialogOpen] = useState(false);

  // Create form state
  const [form, setForm] = useState({
    name: '', email: '', phone: '', channel: 'Website', microNiche: '',
    budgetRange: '1', urgencyLevel: '1', companySize: 'small', decisionMaker: false
  });

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead.mutateAsync({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      channel: form.channel,
      microNiche: form.microNiche,
      budgetRange: Number(form.budgetRange),
      urgencyLevel: Number(form.urgencyLevel),
      companySize: form.companySize,
      decisionMakerStatus: form.decisionMaker,
    });
    setShowCreate(false);
    setForm({ name: '', email: '', phone: '', channel: 'Website', microNiche: '', budgetRange: '1', urgencyLevel: '1', companySize: 'small', decisionMaker: false });
  };

  const handleStatusChange = async (lead: Lead, status: string) => {
    await updateLead.mutateAsync({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? null,
      channel: lead.channel,
      microNiche: lead.microNiche,
      status,
      budgetRange: lead.budgetRange !== undefined ? Number(lead.budgetRange) : null,
      urgencyLevel: lead.urgencyLevel !== undefined ? Number(lead.urgencyLevel) : null,
      companySize: lead.companySize ?? null,
      decisionMakerStatus: lead.decisionMakerStatus ?? null,
    });
  };

  const handleDelete = async (id: bigint) => {
    if (confirm('Delete this lead?')) await deleteLead.mutateAsync(id);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} leads?`)) return;
    for (const id of selectedIds) await deleteLead.mutateAsync(BigInt(id));
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = async (status: string) => {
    for (const id of selectedIds) {
      const lead = leads.find(l => l.id.toString() === id);
      if (lead) await handleStatusChange(lead, status);
    }
    setSelectedIds(new Set());
  };

  const handleExportCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Channel', 'Status', 'Score']];
    filtered.forEach(l => rows.push([l.name, l.email, l.phone ?? '', l.channel, l.status, l.qualificationScore.toString()]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  };

  const handleExportSelected = () => {
    const selected = leads.filter(l => selectedIds.has(l.id.toString()));
    const rows = [['Name', 'Email', 'Status', 'Score']];
    selected.forEach(l => rows.push([l.name, l.email, l.status, l.qualificationScore.toString()]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'selected-leads.csv'; a.click();
  };

  const getLeadPaymentLink = (leadId: bigint) =>
    paymentLinks.find(pl => pl.leadId === leadId) ?? null;

  const handleOpenPaymentLink = async (lead: Lead) => {
    // Create a payment link if none exists
    const existing = getLeadPaymentLink(lead.id);
    if (!existing) {
      await createPaymentLink.mutateAsync({ leadId: lead.id, amount: BigInt(0) });
    }
    setPaymentLinkLead(lead);
    setPaymentLinkDialogOpen(true);
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-brand-400';
    return 'text-muted-foreground';
  };

  const statuses = ['all', 'New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed', 'Lost', 'paid'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-brand-500/50 transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-dark-500 font-semibold text-sm hover:opacity-90 transition-opacity glow-brand-sm">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'gradient-brand text-dark-500'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-brand-500/30'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.size}
          onExport={handleExportSelected}
          onDelete={handleBulkDelete}
          onChangeStatus={() => handleBulkStatusChange('Contacted')}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Leads Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No leads found</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" className="rounded border-border accent-brand-500"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={e => setSelectedIds(e.target.checked ? new Set(filtered.map(l => l.id.toString())) : new Set())}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(lead => (
                  <tr key={lead.id.toString()} className="hover:bg-brand-500/3 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-border accent-brand-500"
                        checked={selectedIds.has(lead.id.toString())}
                        onChange={() => toggleSelect(lead.id.toString())}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-brand-subtle border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-brand-400">{lead.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{lead.channel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status] ?? 'text-muted-foreground bg-muted/30 border-border'}`}
                      >
                        {['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed', 'Lost', 'paid'].map(s => (
                          <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full gradient-brand"
                            style={{ width: `${lead.qualificationScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${scoreColor(Number(lead.qualificationScore))}`}>
                          {lead.qualificationScore.toString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenPaymentLink(lead)}
                          className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-all"
                          title="Payment Link"
                        >
                          <Link className="w-3 h-3 text-brand-400" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center hover:border-destructive/50 hover:bg-destructive/5 transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-border">
            <h2 className="text-lg font-display font-bold text-foreground mb-5">Add New Lead</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Channel</label>
                  <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 transition-all">
                    {['Website', 'WhatsApp', 'Instagram', 'Referral', 'Cold Outreach', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Micro Niche *</label>
                <input type="text" required value={form.microNiche} onChange={e => setForm(f => ({ ...f, microNiche: e.target.value }))}
                  placeholder="e.g. SaaS, E-commerce, Healthcare"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Budget</label>
                  <select value={form.budgetRange} onChange={e => setForm(f => ({ ...f, budgetRange: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 transition-all">
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                    <option value="3">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Urgency</label>
                  <select value={form.urgencyLevel} onChange={e => setForm(f => ({ ...f, urgencyLevel: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 transition-all">
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                    <option value="3">Immediate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Company</label>
                  <select value={form.companySize} onChange={e => setForm(f => ({ ...f, companySize: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500 transition-all">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.decisionMaker} onChange={e => setForm(f => ({ ...f, decisionMaker: e.target.checked }))}
                  className="rounded border-border accent-brand-500" />
                <span className="text-sm text-foreground">Decision Maker</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl bg-background border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={createLead.isPending}
                  className="flex-1 py-2.5 rounded-xl gradient-brand text-dark-500 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {createLead.isPending && <span className="w-4 h-4 border-2 border-dark-500/30 border-t-dark-500 rounded-full animate-spin" />}
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Link Dialog */}
      {paymentLinkLead && (
        <PaymentLinkDialog
          open={paymentLinkDialogOpen}
          onOpenChange={(open) => {
            setPaymentLinkDialogOpen(open);
            if (!open) setPaymentLinkLead(null);
          }}
          paymentLink={getLeadPaymentLink(paymentLinkLead.id)}
        />
      )}
    </div>
  );
}
