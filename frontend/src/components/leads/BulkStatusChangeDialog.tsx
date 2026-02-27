import React, { useState } from 'react';
import type { Lead } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBulkUpdateLeadStatus } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedLeads: Lead[];
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiating',
  'Closed Won',
  'Closed Lost',
  'On Hold',
];

export default function BulkStatusChangeDialog({ open, onClose, selectedLeads, onSuccess }: Props) {
  const [newStatus, setNewStatus] = useState('');
  const bulkUpdate = useBulkUpdateLeadStatus();

  const handleSubmit = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    try {
      await bulkUpdate.mutateAsync({ ids: selectedLeads.map(l => l.id), status: newStatus });
      toast.success(`Updated ${selectedLeads.length} leads to "${newStatus}"`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error('Failed to update leads');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Bulk Status Change</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Changing status for <span className="font-semibold text-foreground">{selectedLeads.length}</span> selected leads.
          </p>
          <div>
            <label className="text-sm text-foreground mb-1.5 block">New Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s} className="text-foreground">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={bulkUpdate.isPending || !newStatus}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {bulkUpdate.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
