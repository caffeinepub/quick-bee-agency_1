import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Copy, Check, ExternalLink, Download, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentLink } from '../../backend';
import EditPaymentLinkDialog from './EditPaymentLinkDialog';

interface PaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentLink: PaymentLink | null;
}

export default function PaymentLinkDialog({
  open,
  onOpenChange,
  paymentLink
}: PaymentLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleCopy = () => {
    if (paymentLink) {
      const url = paymentLink.paymentLinkUrl || `https://razorpay.com/payment-links/${paymentLink.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Payment link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (paymentLink?.qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = paymentLink.qrCodeDataUrl;
      link.download = `payment-qr-${paymentLink.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded');
    }
  };

  if (!paymentLink) return null;

  const amountInRupees = Number(paymentLink.amount) / 100;
  const displayUrl = paymentLink.paymentLinkUrl || `https://razorpay.com/payment-links/${paymentLink.id}`;

  return (
    <>
      <Dialog open={open && !editDialogOpen} onOpenChange={onOpenChange}>
        <DialogContent className="glass-panel border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Payment Link Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-soft-gray mb-1">Amount</p>
              <p className="text-2xl font-bold text-primary">₹{amountInRupees.toLocaleString()}</p>
            </div>

            <div>
              <Label htmlFor="payment-url">Payment Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="payment-url"
                  value={displayUrl}
                  readOnly
                  className="bg-input border-border font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="border-border shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {paymentLink.qrCodeDataUrl && (
              <div>
                <Label>QR Code</Label>
                <div className="mt-2 flex justify-center p-4 bg-secondary/30 rounded-lg border border-border">
                  <img 
                    src={paymentLink.qrCodeDataUrl} 
                    alt="Payment QR Code" 
                    className="w-48 h-48 border-2 border-border rounded"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-border"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={() => window.open(displayUrl, '_blank')}
                variant="outline"
                className="flex-1 border-border"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </Button>
            </div>

            {paymentLink.qrCodeDataUrl && (
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="w-full border-border"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            )}

            <Button
              onClick={() => setEditDialogOpen(true)}
              className="w-full gradient-teal text-black font-semibold"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Payment Link
            </Button>

            <p className="text-xs text-soft-gray text-center">
              Share this link or QR code with the lead to complete payment
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {editDialogOpen && (
        <EditPaymentLinkDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          paymentLink={paymentLink}
        />
      )}
    </>
  );
}
