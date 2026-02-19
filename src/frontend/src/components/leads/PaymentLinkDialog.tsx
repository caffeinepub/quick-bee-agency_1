import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentLink: {
    leadId: bigint;
    amount: bigint;
    url: string;
  } | null;
}

export default function PaymentLinkDialog({
  open,
  onOpenChange,
  paymentLink
}: PaymentLinkDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (paymentLink?.url) {
      navigator.clipboard.writeText(paymentLink.url);
      setCopied(true);
      toast.success('Payment link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!paymentLink) return null;

  const amountInRupees = Number(paymentLink.amount) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                value={paymentLink.url}
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
              onClick={() => window.open(paymentLink.url, '_blank')}
              className="flex-1 gradient-teal text-black font-semibold"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </Button>
          </div>

          <p className="text-xs text-soft-gray text-center">
            Share this link with the lead to complete payment via Razorpay
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
