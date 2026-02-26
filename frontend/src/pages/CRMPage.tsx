import React, { Suspense } from 'react';
import { GitBranch, Plus, User, Calendar, MessageSquare, Phone, Mail, Clock } from 'lucide-react';
import { useGetAllCRMActivities } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { CRMActivity } from '../backend';

const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed', 'Lost'];

const stageColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'New Lead': { bg: 'rgba(45, 212, 191, 0.08)', border: 'rgba(45, 212, 191, 0.2)', text: '#2dd4bf', dot: '#2dd4bf' },
  'Contacted': { bg: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4', dot: '#06b6d4' },
  'Qualified': { bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.2)', text: '#4ade80', dot: '#4ade80' },
  'Proposal Sent': { bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24', dot: '#fbbf24' },
  'Closed': { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981', dot: '#10b981' },
  'Lost': { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', dot: '#ef4444' },
};

const activityIcons: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
  default: Clock,
};

function ActivityCard({ activity }: { activity: CRMActivity }) {
  const Icon = activityIcons[activity.activityType.toLowerCase()] || activityIcons.default;
  return (
    <div className="p-3 rounded-xl mb-2 transition-all hover:shadow-teal-glow-sm"
      style={{
        background: 'rgba(10, 20, 18, 0.8)',
        border: '1px solid rgba(45, 212, 191, 0.1)',
      }}>
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(45, 212, 191, 0.1)' }}>
          <Icon className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-teal-100 capitalize">{activity.activityType}</p>
          <p className="text-xs text-teal-400/60 mt-0.5 line-clamp-2">{activity.notes}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <User className="w-3 h-3 text-teal-400/40" />
            <span className="text-[10px] text-teal-400/40 truncate">
              {activity.createdBy.toString().slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CRMContent() {
  const { data: activities = [], isLoading } = useGetAllCRMActivities();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map(stage => (
          <div key={stage} className="rounded-2xl p-3"
            style={{ background: 'rgba(10,20,18,0.8)', border: '1px solid rgba(45,212,191,0.1)' }}>
            <Skeleton className="h-5 w-24 mb-3 bg-teal-400/10" />
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full mb-2 bg-teal-400/5" />)}
          </div>
        ))}
      </div>
    );
  }

  const activitiesByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = activities.filter(a => a.stage === stage);
    return acc;
  }, {} as Record<string, CRMActivity[]>);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {STAGES.map(stage => {
        const stageStyle = stageColors[stage] || stageColors['New Lead'];
        const stageActivities = activitiesByStage[stage] || [];
        return (
          <div key={stage} className="rounded-2xl p-3 min-h-[200px]"
            style={{
              background: stageStyle.bg,
              border: `1px solid ${stageStyle.border}`,
            }}>
            {/* Stage header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: stageStyle.dot }} />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: stageStyle.text }}>
                  {stage}
                </h3>
              </div>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${stageStyle.dot}20`, color: stageStyle.text }}>
                {stageActivities.length}
              </span>
            </div>

            {/* Activities */}
            <div>
              {stageActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[10px] text-teal-400/30">No activities</p>
                </div>
              ) : (
                stageActivities.map(activity => (
                  <ActivityCard key={String(activity.id)} activity={activity} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CRMPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text-teal flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-teal-400" />
            CRM Pipeline
          </h1>
          <p className="text-teal-400/50 text-sm mt-0.5">Track activities across all pipeline stages</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map(stage => (
            <Skeleton key={stage} className="h-48 rounded-2xl bg-teal-400/5" />
          ))}
        </div>
      }>
        <CRMContent />
      </Suspense>
    </div>
  );
}
