import { useIsCallerAdmin } from '../hooks/useQueries';
import RazorpayConfigPanel from '../components/settings/RazorpayConfigPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Settings } from 'lucide-react';

export default function SettingsPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold font-display text-foreground">Access Denied</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          You need administrator privileges to access the settings page.
        </p>
      </div>
    );
  }

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
