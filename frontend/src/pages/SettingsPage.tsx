import RazorpayConfigPanel from '../components/settings/RazorpayConfigPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure payment gateways and platform settings</p>
      </div>

      {/* Razorpay Configuration */}
      <RazorpayConfigPanel />

      {/* Stripe Configuration placeholder */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Stripe Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure Stripe payment gateway for online checkout sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
