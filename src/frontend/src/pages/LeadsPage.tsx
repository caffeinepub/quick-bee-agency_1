import { useState } from 'react';
import { useGetAllLeads, useCreateLead } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Download } from 'lucide-react';

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

export default function LeadsPage() {
  const { data: leads = [] } = useGetAllLeads();
  const createLead = useCreateLead();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    channel: 'Email',
    microNiche: MICRO_NICHES[0]
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await createLead.mutateAsync(formData);
      toast.success('Lead created successfully');
      setIsOpen(false);
      setFormData({ name: '', email: '', phone: '', channel: 'Email', microNiche: MICRO_NICHES[0] });
    } catch (error) {
      toast.error('Failed to create lead');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Channel', 'Micro Niche', 'Status'];
    const rows = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.channel,
      lead.microNiche,
      lead.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
          <p className="text-soft-gray mt-1">Manage up to 3000 leads across channels</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportCSV} variant="outline" className="border-border">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                <Button onClick={handleSubmit} disabled={createLead.isPending} className="w-full gradient-teal text-black font-semibold">
                  {createLead.isPending ? 'Creating...' : 'Create Lead'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leads.length === 0 ? (
              <p className="text-soft-gray text-center py-8">No leads yet. Add your first lead to get started.</p>
            ) : (
              leads.map((lead) => (
                <div key={lead.id.toString()} className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{lead.name}</p>
                      <p className="text-sm text-soft-gray">{lead.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded border border-primary/30">
                          {lead.channel}
                        </span>
                        <span className="px-2 py-1 bg-secondary text-soft-gray text-xs rounded border border-border">
                          {lead.microNiche}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
