import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Copy, Download, Link as LinkIcon, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface ServicePaymentInfoDisplayProps {
  paymentLinkUrl?: string;
  qrCodeDataUrl?: string;
}

export default function ServicePaymentInfoDisplay({
  paymentLinkUrl,
  qrCodeDataUrl
}: ServicePaymentInfoDisplayProps) {
  // Don't render if no payment info is available
  if (!paymentLinkUrl && !qrCodeDataUrl) {
    return null;
  }

  const handleCopyUrl = () => {
    if (paymentLinkUrl) {
      navigator.clipboard.writeText(paymentLinkUrl);
      toast.success('Payment link copied to clipboard');
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = 'payment-qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded');
    }
  };

  return (
    <Card className="glass-panel border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentLinkUrl && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-soft-gray">Payment Link</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-secondary/30 rounded border border-border">
                <p className="text-sm text-foreground break-all">{paymentLinkUrl}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="border-border shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {qrCodeDataUrl && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-soft-gray">QR Code</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 border-2 border-border rounded"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadQR}
                className="border-border"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
