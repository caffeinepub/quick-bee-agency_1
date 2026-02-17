import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function SettingsPage() {
  const { data: userProfile } = useGetCallerUserProfile();

  if (userProfile?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-soft-gray">Only administrators can access settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-soft-gray mt-1">Manage system configuration</p>
      </div>

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-soft-gray">Admin settings and configuration options will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
