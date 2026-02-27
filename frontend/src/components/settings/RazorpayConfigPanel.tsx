import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RazorpayConfigPanel() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error('API Key and Secret are required');
      return;
    }
    setIsSaving(true);
    try {
      // Store in localStorage as backend method not available
      localStorage.setItem('razorpay_config', JSON.stringify({ apiKey, apiSecret, webhookSecret }));
      setIsConfigured(true);
      toast.success('Razorpay configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {isConfigured ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Razorpay is configured
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <AlertCircle className="w-4 h-4" />
            Razorpay not configured
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm text-foreground mb-1.5 block">API Key ID</Label>
        <Input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="rzp_live_..."
          className="bg-input border-border text-foreground"
        />
      </div>

      <div>
        <Label className="text-sm text-foreground mb-1.5 block">API Secret</Label>
        <div className="relative">
          <Input
            type={showSecret ? 'text' : 'password'}
            value={apiSecret}
            onChange={e => setApiSecret(e.target.value)}
            placeholder="Your Razorpay secret"
            className="bg-input border-border text-foreground pr-10"
          />
          <button
            type="button"
            onClick={() => setShowSecret(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <Label className="text-sm text-foreground mb-1.5 block">Webhook Secret</Label>
        <div className="relative">
          <Input
            type={showWebhook ? 'text' : 'password'}
            value={webhookSecret}
            onChange={e => setWebhookSecret(e.target.value)}
            placeholder="Webhook secret (optional)"
            className="bg-input border-border text-foreground pr-10"
          />
          <button
            type="button"
            onClick={() => setShowWebhook(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
      >
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
