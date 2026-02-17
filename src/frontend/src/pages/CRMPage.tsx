import { useGetAllCRMActivities } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed', 'Lost'];

export default function CRMPage() {
  const { data: activities = [] } = useGetAllCRMActivities();

  const activitiesByStage = STAGES.map(stage => ({
    stage,
    items: activities.filter(a => a.stage === stage)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">CRM Pipeline</h1>
        <p className="text-soft-gray mt-1">Manage your sales pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activitiesByStage.map(({ stage, items }) => (
          <Card key={stage} className="glass-panel border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">{stage}</CardTitle>
              <p className="text-xs text-soft-gray">{items.length} items</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id.toString()} className="p-3 bg-secondary/30 rounded border border-border">
                    <p className="text-sm font-medium text-foreground">{item.activityType}</p>
                    <p className="text-xs text-soft-gray mt-1">{item.notes}</p>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-soft-gray text-center py-4">No items</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
