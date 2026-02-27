import React, { useState } from 'react';
import type { PaymentLink } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSetPaymentLinkUrl, useSetPaymentLinkQrCode } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  paymentLink: PaymentLink;
}

export default function EditPaymentLinkDialog({ open, onClose, paymentLink }: Props) {
  const [url, setUrl] = useState(paymentLink.paymentLinkUrl ?? '');
  const [qrCode, setQrCode] = useState(paymentLink.qrCodeDataUrl ?? '');
  const setUrl_ = useSetPaymentLinkUrl();
  const setQrCode_ = useSetPaymentLinkQrCode();

  const handleSave = async () => {
    try {
      if (url !== (paymentLink.paymentLinkUrl ?? '')) {
        await setUrl_.mutateAsync({ id: paymentLink.id, url });
      }
      if (qrCode !== (paymentLink.qrCodeDataUrl ?? '')) {
        await setQrCode_.mutateAsync({ id: paymentLink.id, qrCodeDataUrl: qrCode });
      }
      toast.success('Payment link updated');
      onClose();
    } catch {
      toast.error('Failed to update payment link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Payment Link</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label className="text-sm text-foreground mb-1.5 block">Payment URL</Label>
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="bg-input border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-sm text-foreground mb-1.5 block">QR Code Data URL</Label>
            <Input
              value={qrCode}
              onChange={e => setQrCode(e.target.value)}
              placeholder="data:image/png;base64,..."
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={setUrl_.isPending || setQrCode_.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
