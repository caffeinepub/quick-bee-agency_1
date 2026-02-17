import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Zap } from 'lucide-react';

const AUTOMATIONS = [
  { id: 'whatsapp', name: 'Auto WhatsApp Replies', description: 'Automated responses for WhatsApp messages' },
  { id: 'sequence', name: 'Sequence Builder', description: 'Create automated in-app task sequences' },
  { id: 'proposal', name: 'Proposal Auto-Send', description: 'Auto-generate proposals when leads are qualified' },
  { id: 'payment', name: 'Payment Confirmation', description: 'Automated payment confirmation notifications' },
  { id: 'onboarding', name: 'Project Onboarding', description: 'Auto-trigger onboarding after payment' },
];

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Automation Center</h1>
        <p className="text-soft-gray mt-1">Configure your business automations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AUTOMATIONS.map((auto) => (
          <Card key={auto.id} className="glass-panel border-border hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">{auto.name}</CardTitle>
                    <CardDescription className="text-soft-gray">{auto.description}</CardDescription>
                  </div>
                </div>
                <Switch />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
