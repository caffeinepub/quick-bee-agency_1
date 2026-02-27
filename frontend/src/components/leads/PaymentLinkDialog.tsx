import React, { useState } from 'react';
import type { PaymentLink } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Edit2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import EditPaymentLinkDialog from './EditPaymentLinkDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  paymentLink: PaymentLink;
}

export default function PaymentLinkDialog({ open, onClose, paymentLink }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  const copyUrl = () => {
    const url = paymentLink.paymentLinkUrl ?? '';
    if (!url) { toast.error('No URL to copy'); return; }
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const downloadQR = () => {
    const qr = paymentLink.qrCodeDataUrl ?? '';
    if (!qr) { toast.error('No QR code available'); return; }
    const a = document.createElement('a');
    a.href = qr;
    a.download = `payment-link-${paymentLink.id}-qr.png`;
    a.click();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Payment Link</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-foreground font-semibold">₹{Number(paymentLink.amount).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-foreground">{paymentLink.status}</p>
            </div>
            {paymentLink.paymentLinkUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Payment URL</p>
                <div className="flex items-center gap-2">
                  <p className="text-foreground text-sm truncate flex-1">{paymentLink.paymentLinkUrl}</p>
                  <Button size="sm" variant="ghost" onClick={copyUrl} className="h-7 w-7 p-0">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <a href={paymentLink.paymentLinkUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            )}
            {paymentLink.qrCodeDataUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">QR Code</p>
                <img src={paymentLink.qrCodeDataUrl} alt="QR Code" className="w-32 h-32 rounded-lg border border-border" />
                <Button size="sm" variant="outline" onClick={downloadQR} className="mt-2 border-border text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Download QR
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setEditOpen(true)} className="border-border text-sm">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
            <Button variant="outline" onClick={onClose} className="border-border">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      {editOpen && (
        <EditPaymentLinkDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          paymentLink={paymentLink}
        />
      )}
    </>
  );
}
