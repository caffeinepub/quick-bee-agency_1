import { useGetAllCRMActivities, useGetAllLeads } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed', 'Lost'];

export default function CRMPage() {
  const { data: activities = [], isLoading: activitiesLoading } = useGetAllCRMActivities();
  const { data: leads = [] } = useGetAllLeads();

  const getActivitiesByStage = (stage: string) => {
    return activities.filter((a) => a.stage === stage);
  };

  const getLeadName = (leadId: bigint | undefined) => {
    if (!leadId) return 'Unknown';
    const lead = leads.find((l) => l.id === leadId);
    return lead?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">CRM Pipeline</h1>
        <p className="text-muted-foreground mt-1">Track your sales pipeline and activities</p>
      </div>

      {activitiesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STAGES.map((stage) => {
            const stageActivities = getActivitiesByStage(stage);
            return (
              <Card key={stage} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg flex items-center justify-between">
                    <span>{stage}</span>
                    <span className="text-sm font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      {stageActivities.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stageActivities.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-4">No activities</p>
                    ) : (
                      stageActivities.map((activity) => (
                        <div
                          key={activity.id.toString()}
                          className="p-3 bg-secondary/30 rounded-lg border border-border"
                        >
                          <p className="text-foreground font-medium text-sm">
                            {activity.leadId ? getLeadName(activity.leadId) : 'No Lead'}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">{activity.activityType}</p>
                          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                            {activity.notes}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
