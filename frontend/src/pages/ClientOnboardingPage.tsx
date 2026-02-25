import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function ClientOnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Client Onboarding</h1>
        <p className="text-soft-gray mt-1">Complete your project onboarding</p>
      </div>

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Onboarding Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-soft-gray">Onboarding form will appear here after project creation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
