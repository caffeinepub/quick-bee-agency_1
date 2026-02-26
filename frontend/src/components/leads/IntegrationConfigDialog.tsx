import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationName: string;
  onSave: (config: Record<string, string>) => Promise<void>;
}

const INTEGRATION_FIELDS: Record<string, { label: string; placeholder: string; key: string }[]> = {
  'WhatsApp Cloud API': [
    { label: 'API Endpoint', placeholder: 'https://graph.facebook.com/v17.0/...', key: 'apiEndpoint' },
    { label: 'Access Token', placeholder: 'EAAxxxxxxxx...', key: 'accessToken' },
    { label: 'Phone Number ID', placeholder: '1234567890', key: 'phoneNumberId' },
  ],
  'Airtable': [
    { label: 'API Key', placeholder: 'keyXXXXXXXXXXXXXX', key: 'apiKey' },
    { label: 'Base ID', placeholder: 'appXXXXXXXXXXXXXX', key: 'baseId' },
    { label: 'Table Name', placeholder: 'Leads', key: 'tableName' },
  ],
  'Google Sheets': [
    { label: 'Spreadsheet ID', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms', key: 'spreadsheetId' },
    { label: 'Sheet Name', placeholder: 'Sheet1', key: 'sheetName' },
    { label: 'Service Account JSON', placeholder: '{"type":"service_account",...}', key: 'serviceAccountJson' },
  ],
  'Resend': [
    { label: 'API Key', placeholder: 're_XXXXXXXXXXXXXXXXXXXXXXXXXX', key: 'apiKey' },
    { label: 'From Email', placeholder: 'noreply@yourdomain.com', key: 'fromEmail' },
    { label: 'From Name', placeholder: 'QuickBee CRM', key: 'fromName' },
  ],
  'Razorpay': [
    { label: 'API Key ID', placeholder: 'rzp_live_XXXXXXXXXX', key: 'apiKey' },
    { label: 'API Secret', placeholder: 'XXXXXXXXXXXXXXXXXX', key: 'apiSecret' },
    { label: 'Webhook Secret', placeholder: 'whsec_XXXXXXXXXX', key: 'webhookSecret' },
  ],
};

export default function IntegrationConfigDialog({
  open,
  onOpenChange,
  integrationName,
  onSave,
}: IntegrationConfigDialogProps) {
  const fields = INTEGRATION_FIELDS[integrationName] ?? [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(values);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onOpenChange(false);
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {integrationName}</DialogTitle>
          <DialogDescription>
            Enter your API credentials to connect {integrationName}. Settings are saved securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map(field => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                placeholder={field.placeholder}
                value={values[field.key] ?? ''}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                type={field.key.toLowerCase().includes('secret') || field.key.toLowerCase().includes('token') || field.key.toLowerCase().includes('key') ? 'password' : 'text'}
              />
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No configuration fields available for this integration.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || saved}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved!</>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
