import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useIsRazorpayConfigured, useSetRazorpayConfiguration } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

export default function RazorpayConfigPanel() {
  const { data: isConfigured = false } = useIsRazorpayConfigured();
  const setConfig = useSetRazorpayConfiguration();

  const [showSecrets, setShowSecrets] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    webhookSecret: ''
  });

  const handleSave = async () => {
    if (!formData.apiKey || !formData.apiSecret || !formData.webhookSecret) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await setConfig.mutateAsync(formData);
      toast.success('Razorpay configuration saved successfully');
      setFormData({ apiKey: '', apiSecret: '', webhookSecret: '' });
    } catch (error) {
      toast.error('Failed to save Razorpay configuration');
    }
  };

  return (
    <Card className="glass-panel border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Razorpay Configuration</CardTitle>
            <CardDescription className="text-soft-gray">
              Configure Razorpay for payment link generation
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-500">Configured</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-yellow-500">Not Configured</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="razorpay-key">API Key ID</Label>
          <Input
            id="razorpay-key"
            type={showSecrets ? 'text' : 'password'}
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder="rzp_test_..."
            className="bg-input border-border font-mono"
          />
        </div>

        <div>
          <Label htmlFor="razorpay-secret">API Key Secret</Label>
          <Input
            id="razorpay-secret"
            type={showSecrets ? 'text' : 'password'}
            value={formData.apiSecret}
            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
            placeholder="Enter your API secret"
            className="bg-input border-border font-mono"
          />
        </div>

        <div>
          <Label htmlFor="razorpay-webhook">Webhook Secret</Label>
          <Input
            id="razorpay-webhook"
            type={showSecrets ? 'text' : 'password'}
            value={formData.webhookSecret}
            onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
            placeholder="Enter your webhook secret"
            className="bg-input border-border font-mono"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSecrets(!showSecrets)}
            className="border-border"
          >
            {showSecrets ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
          <Button
            onClick={handleSave}
            disabled={setConfig.isPending}
            className="gradient-teal text-black font-semibold"
          >
            {setConfig.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        <p className="text-xs text-soft-gray">
          Get your Razorpay credentials from the{' '}
          <a
            href="https://dashboard.razorpay.com/app/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Razorpay Dashboard
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
