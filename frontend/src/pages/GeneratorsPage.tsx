import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Sparkles } from 'lucide-react';

const GENERATORS = [
  { id: 'recommendation', name: 'Service Recommendation', description: 'Get personalized service recommendations' },
  { id: 'proposal', name: 'Proposal Generator', description: 'Generate professional proposals' },
  { id: 'pricing', name: 'Pricing Strategy', description: 'Calculate optimal pricing' },
  { id: 'script', name: 'Closing Script', description: 'High-ticket closing scripts' },
  { id: 'followup', name: 'Follow-up Messages', description: 'Automated follow-up templates' },
  { id: 'scoring', name: 'Lead Qualification', description: 'Score and qualify leads' },
];

export default function GeneratorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Smart Generators</h1>
        <p className="text-soft-gray mt-1">Rule-based business tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GENERATORS.map((gen) => (
          <Card key={gen.id} className="glass-panel border-border hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-foreground">{gen.name}</CardTitle>
              </div>
              <CardDescription className="text-soft-gray">{gen.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
