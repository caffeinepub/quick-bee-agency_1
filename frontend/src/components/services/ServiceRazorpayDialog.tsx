import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateServiceRazorpay } from '../../hooks/useQueries';
import type { Service } from '../../backend';

interface ServiceRazorpayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
}

export default function ServiceRazorpayDialog({
  open,
  onOpenChange,
  service,
}: ServiceRazorpayDialogProps) {
  const [razorpayEnabled, setRazorpayEnabled] = useState(service.razorpayEnabled || false);
  const [razorpayKeyId, setRazorpayKeyId] = useState(service.razorpayKeyId || '');
  const [razorpayOrderId, setRazorpayOrderId] = useState(service.razorpayOrderId || '');

  const updateRazorpay = useUpdateServiceRazorpay();

  const handleSave = async () => {
    try {
      await updateRazorpay.mutateAsync({
        id: service.id,
        enabled: razorpayEnabled,
        keyId: razorpayKeyId.trim() || null,
        orderId: razorpayOrderId.trim() || null,
      });
      toast.success('Razorpay settings updated successfully');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update Razorpay settings');
    }
  };

  const isSaving = updateRazorpay.isPending;
  const hasChanges =
    razorpayEnabled !== (service.razorpayEnabled || false) ||
    razorpayKeyId !== (service.razorpayKeyId || '') ||
    razorpayOrderId !== (service.razorpayOrderId || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configure Razorpay Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Service</p>
            <p className="text-xl font-bold text-foreground">{service.name}</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="razorpay-enabled" className="text-base">Enable Razorpay</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay for this service using Razorpay
              </p>
            </div>
            <Switch
              id="razorpay-enabled"
              checked={razorpayEnabled}
              onCheckedChange={setRazorpayEnabled}
            />
          </div>

          <div>
            <Label htmlFor="razorpay-key-id">Razorpay Key ID</Label>
            <Input
              id="razorpay-key-id"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_test_xxxxxxxxxxxxx"
              className="mt-1 bg-input border-border"
              disabled={!razorpayEnabled}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your Razorpay Key ID (optional, can be configured globally in settings)
            </p>
          </div>

          <div>
            <Label htmlFor="razorpay-order-id">Razorpay Order ID (Optional)</Label>
            <Input
              id="razorpay-order-id"
              value={razorpayOrderId}
              onChange={(e) => setRazorpayOrderId(e.target.value)}
              placeholder="order_xxxxxxxxxxxxx"
              className="mt-1 bg-input border-border"
              disabled={!razorpayEnabled}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pre-configured order ID for this service (optional)
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded border border-border">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              When Razorpay is enabled for a service, customers will see it as a payment option
              during checkout. Make sure Razorpay is configured globally in Settings before enabling
              it here.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-primary text-primary-foreground font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
