import { useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import RazorpayConfigPanel from '../components/settings/RazorpayConfigPanel';

export default function SettingsPage() {
  const { data: isAdmin = false, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-soft-gray">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="glass-panel border-border max-w-md">
          <CardHeader>
            <CardTitle className="text-foreground">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-soft-gray">Only administrators can access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-soft-gray mt-1">Configure system settings and integrations</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Payment Gateway Configuration</h2>
        <RazorpayConfigPanel />
      </div>
    </div>
  );
}
