import { useState, useEffect } from 'react';
import { useGetAllCRMActivities, useGetAllLeads } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed', 'Lost'];

export default function CRMPage() {
  const [enableFetch, setEnableFetch] = useState(false);
  const { data: activities = [], isLoading: activitiesLoading } = useGetAllCRMActivities(enableFetch);
  const { data: leads = [] } = useGetAllLeads(enableFetch);

  // Enable fetching after component mounts
  useEffect(() => {
    setEnableFetch(true);
  }, []);

  const getActivitiesByStage = (stage: string) => {
    return activities.filter(a => a.stage === stage);
  };

  const getLeadName = (leadId: bigint | undefined) => {
    if (!leadId) return 'Unknown';
    const lead = leads.find(l => l.id === leadId);
    return lead?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">CRM Pipeline</h1>
        <p className="text-soft-gray mt-1">Track your sales pipeline and activities</p>
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
              <Card key={stage} className="glass-panel border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">
                    {stage} ({stageActivities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stageActivities.length === 0 ? (
                      <p className="text-soft-gray text-sm">No activities</p>
                    ) : (
                      stageActivities.map((activity) => (
                        <div
                          key={activity.id.toString()}
                          className="p-3 bg-secondary/30 rounded-lg border border-border"
                        >
                          <p className="text-foreground font-medium text-sm">
                            {activity.leadId ? getLeadName(activity.leadId) : 'No Lead'}
                          </p>
                          <p className="text-soft-gray text-xs mt-1">{activity.activityType}</p>
                          <p className="text-soft-gray text-xs mt-1 line-clamp-2">{activity.notes}</p>
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
