import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUpdateLead } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Lead } from '../../backend';

const STATUSES = ['new', 'contacted', 'qualified', 'paid', 'onboarding', 'completed', 'lost'];

interface BulkStatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeadIds: bigint[];
  leads: Lead[];
  onSuccess: () => void;
}

export default function BulkStatusChangeDialog({
  open,
  onOpenChange,
  selectedLeadIds,
  leads,
  onSuccess
}: BulkStatusChangeDialogProps) {
  const [newStatus, setNewStatus] = useState('contacted');
  const [isUpdating, setIsUpdating] = useState(false);
  const updateLead = useUpdateLead();

  const selectedLeads = leads.filter(lead => 
    selectedLeadIds.some(id => id === lead.id)
  );

  const handleBulkUpdate = async () => {
    setIsUpdating(true);
    let successCount = 0;
    let failureCount = 0;

    for (const lead of selectedLeads) {
      try {
        await updateLead.mutateAsync({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone || null,
          channel: lead.channel,
          microNiche: lead.microNiche,
          status: newStatus
        });
        successCount++;
      } catch (error) {
        failureCount++;
      }
    }

    setIsUpdating(false);

    if (successCount > 0) {
      toast.success(`Updated ${successCount} lead${successCount !== 1 ? 's' : ''} successfully`);
    }
    if (failureCount > 0) {
      toast.error(`Failed to update ${failureCount} lead${failureCount !== 1 ? 's' : ''}`);
    }

    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Bulk Status Change</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-soft-gray mb-4">
              You are about to update the status of {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''}:
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
              {selectedLeads.map(lead => (
                <div key={lead.id.toString()} className="text-sm p-2 bg-secondary/30 rounded border border-border">
                  <span className="font-semibold text-foreground">{lead.name}</span>
                  <span className="text-soft-gray ml-2">({lead.status})</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="bulk-status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkUpdate}
            disabled={isUpdating}
            className="gradient-teal text-black font-semibold"
          >
            {isUpdating ? 'Updating...' : 'Update All'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
