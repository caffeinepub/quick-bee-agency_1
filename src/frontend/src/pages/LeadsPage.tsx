import { useState } from 'react';
import { useGetAllLeads, useCreateLead, useUpdateLead, useDeleteLead, useBulkDeleteLeads, useCreatePaymentLink, useGetPaymentLinks } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Download, Edit, Trash2 } from 'lucide-react';
import BulkActionsToolbar from '../components/leads/BulkActionsToolbar';
import BulkStatusChangeDialog from '../components/leads/BulkStatusChangeDialog';
import PaymentLinkDialog from '../components/leads/PaymentLinkDialog';
import type { Lead } from '../backend';

const MICRO_NICHES = [
  'SaaS Startups', 'E-commerce Fashion', 'Health & Wellness Coaches', 'Real Estate Agents',
  'Digital Marketing Agencies', 'Fitness Trainers', 'Restaurant Owners', 'Dental Clinics',
  'Law Firms', 'Accounting Services', 'Interior Designers', 'Wedding Planners',
  'Photography Studios', 'Yoga Instructors', 'Pet Services', 'Beauty Salons',
  'Auto Repair Shops', 'Home Cleaning Services', 'Tutoring Services', 'Event Management',
  'Travel Agencies', 'Insurance Brokers', 'Financial Advisors', 'Construction Companies',
  'Landscaping Services', 'IT Consulting', 'HR Consulting', 'Content Creators',
  'Podcast Hosts', 'YouTubers', 'Influencers', 'Online Course Creators',
  'App Developers', 'Web Designers', 'Graphic Designers', 'Copywriters',
  'Virtual Assistants', 'Social Media Managers', 'SEO Specialists', 'PPC Experts',
  'Email Marketers', 'Affiliate Marketers', 'Dropshippers', 'Print-on-Demand',
  'Etsy Sellers', 'Amazon FBA', 'Shopify Store Owners', 'Coaches & Consultants',
  'Life Coaches', 'Business Coaches'
];

const CHANNELS = ['Email', 'LinkedIn', 'Instagram', 'WhatsApp', 'SMS'];
const STATUSES = ['new', 'contacted', 'qualified', 'paid', 'onboarding', 'completed', 'lost'];

export default function LeadsPage() {
  const { data: leads = [] } = useGetAllLeads();
  const { data: paymentLinks = [] } = useGetPaymentLinks();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkDeleteLeads = useBulkDeleteLeads();
  const createPaymentLink = useCreatePaymentLink();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [isPaymentLinkOpen, setIsPaymentLinkOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [currentPaymentLink, setCurrentPaymentLink] = useState<{ leadId: bigint; amount: bigint; url: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    channel: 'Email',
    microNiche: MICRO_NICHES[0],
    status: 'new'
  });

  const handleCreateSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await createLead.mutateAsync(formData);
      toast.success('Lead created successfully');
      setIsCreateOpen(false);
      setFormData({ name: '', email: '', phone: '', channel: 'Email', microNiche: MICRO_NICHES[0], status: 'new' });
    } catch (error) {
      toast.error('Failed to create lead');
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedLead || !formData.name || !formData.email) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const oldStatus = selectedLead.status;
      await updateLead.mutateAsync({
        id: selectedLead.id,
        ...formData
      });

      // If status changed to qualified, create payment link
      if (oldStatus !== 'qualified' && formData.status === 'qualified') {
        const linkId = await createPaymentLink.mutateAsync({
          leadId: selectedLead.id,
          amount: BigInt(50000) // Default ₹500
        });
        const mockUrl = `https://razorpay.com/payment/${linkId}`;
        setCurrentPaymentLink({
          leadId: selectedLead.id,
          amount: BigInt(50000),
          url: mockUrl
        });
        setIsPaymentLinkOpen(true);
      }

      toast.success('Lead updated successfully');
      setIsEditOpen(false);
      setSelectedLead(null);
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      channel: lead.channel,
      microNiche: lead.microNiche,
      status: lead.status
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteLead.mutateAsync(id);
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleExportCSV = (selectedOnly = false) => {
    const leadsToExport = selectedOnly
      ? leads.filter(lead => selectedLeadIds.has(lead.id.toString()))
      : leads;

    const headers = ['id', 'name', 'phone', 'email', 'service_interest', 'status', 'created_at'];
    const rows = leadsToExport.map(lead => [
      lead.id.toString(),
      lead.name,
      lead.phone || '',
      lead.email,
      lead.microNiche,
      lead.status,
      new Date(Number(lead.createdAt) / 1000000).toISOString()
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `leads-export-${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(leads.map(l => l.id.toString())));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSet = new Set(selectedLeadIds);
    if (checked) {
      newSet.add(leadId);
    } else {
      newSet.delete(leadId);
    }
    setSelectedLeadIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.size} leads?`)) return;

    try {
      const ids = Array.from(selectedLeadIds).map(id => BigInt(id));
      const result = await bulkDeleteLeads.mutateAsync(ids);
      toast.success(`Deleted ${result.successCount} leads successfully`);
      if (result.failureCount > 0) {
        toast.error(`Failed to delete ${result.failureCount} leads`);
      }
      setSelectedLeadIds(new Set());
    } catch (error) {
      toast.error('Failed to delete leads');
    }
  };

  const getPaymentLinkForLead = (leadId: bigint) => {
    return paymentLinks.find(pl => pl.leadId === leadId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
          <p className="text-soft-gray mt-1">Manage up to 3000 leads across channels</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleExportCSV(false)} variant="outline" className="border-border">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-teal-glow text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Add New Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map(ch => <SelectItem key={ch} value={ch}>{ch}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="niche">Micro Niche</Label>
                  <Select value={formData.microNiche} onValueChange={(v) => setFormData({ ...formData, microNiche: v })}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MICRO_NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateSubmit} disabled={createLead.isPending} className="w-full gradient-teal text-black font-semibold">
                  {createLead.isPending ? 'Creating...' : 'Create Lead'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedLeadIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedLeadIds.size}
          onExport={() => handleExportCSV(true)}
          onDelete={handleBulkDelete}
          onChangeStatus={() => setIsBulkStatusOpen(true)}
          onClear={() => setSelectedLeadIds(new Set())}
        />
      )}

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-3">
            <Checkbox
              checked={selectedLeadIds.size === leads.length && leads.length > 0}
              onCheckedChange={handleSelectAll}
            />
            All Leads ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leads.length === 0 ? (
              <p className="text-soft-gray text-center py-8">No leads yet. Add your first lead to get started.</p>
            ) : (
              leads.map((lead) => {
                const paymentLink = getPaymentLinkForLead(lead.id);
                return (
                  <div key={lead.id.toString()} className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedLeadIds.has(lead.id.toString())}
                        onCheckedChange={(checked) => handleSelectLead(lead.id.toString(), checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground">{lead.name}</p>
                            <p className="text-sm text-soft-gray">{lead.email}</p>
                            {lead.phone && <p className="text-sm text-soft-gray">{lead.phone}</p>}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded border border-primary/30">
                                {lead.channel}
                              </span>
                              <span className="px-2 py-1 bg-secondary text-soft-gray text-xs rounded border border-border">
                                {lead.microNiche}
                              </span>
                              {paymentLink && (
                                <span className={`px-2 py-1 text-xs rounded border ${
                                  paymentLink.status === 'paid'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                }`}>
                                  Payment: {paymentLink.status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">
                              {lead.status}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(lead)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(lead.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-panel border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="edit-channel">Channel</Label>
              <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map(ch => <SelectItem key={ch} value={ch}>{ch}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-niche">Micro Niche</Label>
              <Select value={formData.microNiche} onValueChange={(v) => setFormData({ ...formData, microNiche: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MICRO_NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEditSubmit} disabled={updateLead.isPending} className="w-full gradient-teal text-black font-semibold">
              {updateLead.isPending ? 'Updating...' : 'Update Lead'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BulkStatusChangeDialog
        open={isBulkStatusOpen}
        onOpenChange={setIsBulkStatusOpen}
        selectedLeadIds={Array.from(selectedLeadIds).map(id => BigInt(id))}
        leads={leads}
        onSuccess={() => {
          setSelectedLeadIds(new Set());
          setIsBulkStatusOpen(false);
        }}
      />

      <PaymentLinkDialog
        open={isPaymentLinkOpen}
        onOpenChange={setIsPaymentLinkOpen}
        paymentLink={currentPaymentLink}
      />
    </div>
  );
}
