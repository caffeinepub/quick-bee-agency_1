import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Upload, QrCode, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateServicePaymentInfo } from '../../hooks/useQueries';
import type { Service } from '../../backend';

interface ServicePaymentInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
}

export default function ServicePaymentInfoDialog({
  open,
  onOpenChange,
  service,
}: ServicePaymentInfoDialogProps) {
  const [customUrl, setCustomUrl] = useState(service.paymentLinkUrl || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(service.qrCodeDataUrl || '');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePaymentInfo = useUpdateServicePaymentInfo();

  const handleGenerateQR = async () => {
    const urlToEncode = customUrl || `https://example.com/service/${service.id}`;

    if (!urlToEncode.trim()) {
      toast.error('Please enter a URL first');
      return;
    }

    setIsGeneratingQR(true);
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlToEncode)}`;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 300, 300);
            const dataUrl = canvas.toDataURL('image/png');
            setQrCodeDataUrl(dataUrl);
            toast.success('QR code generated successfully');
            resolve();
          } else {
            reject(new Error('Canvas context not available'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load QR code'));
        img.src = qrApiUrl;
      });
    } catch (error) {
      toast.error('Failed to generate QR code. Please upload a custom QR code instead.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setQrCodeDataUrl(dataUrl);
      toast.success('QR code image uploaded');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await updatePaymentInfo.mutateAsync({
        id: service.id,
        paymentLinkUrl: customUrl || null,
        qrCodeDataUrl: qrCodeDataUrl || null,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save payment info');
    }
  };

  const isSaving = updatePaymentInfo.isPending;
  const hasChanges =
    customUrl !== (service.paymentLinkUrl || '') ||
    qrCodeDataUrl !== (service.qrCodeDataUrl || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Payment Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Service</p>
            <p className="text-xl font-bold text-foreground">{service.name}</p>
          </div>

          <div>
            <Label htmlFor="custom-url">Payment Link URL</Label>
            <Input
              id="custom-url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://your-payment-link.com"
              className="mt-1 bg-input border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a custom payment link URL for this service
            </p>
          </div>

          <div className="space-y-3">
            <Label>QR Code</Label>

            {qrCodeDataUrl && (
              <div className="flex justify-center p-4 bg-secondary/30 rounded-lg border border-border">
                <img
                  src={qrCodeDataUrl}
                  alt="Payment QR Code"
                  className="w-48 h-48 border-2 border-border rounded"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateQR}
                disabled={isGeneratingQR}
                className="flex-1 border-border"
              >
                {isGeneratingQR ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-border"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload QR Code
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded border border-border">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Generate a QR code from the URL above, or upload your own custom QR code image.
              </p>
            </div>
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
