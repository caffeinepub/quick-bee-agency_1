import React, { useState, useMemo } from 'react';
import { CRMActivity } from '../hooks/useQueries';
import { useGetAllCRMActivities, useGetMyCRMActivities } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, TrendingUp, Target, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGES = [
  { key: 'New Lead', icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
  { key: 'Contacted', icon: <Send className="w-4 h-4" />, color: 'text-yellow-400' },
  { key: 'Qualified', icon: <Target className="w-4 h-4" />, color: 'text-purple-400' },
  { key: 'Proposal Sent', icon: <TrendingUp className="w-4 h-4" />, color: 'text-orange-400' },
  { key: 'Closed', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400' },
  { key: 'Lost', icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' },
];

function ActivityCard({ activity }: { activity: CRMActivity }) {
  return (
    <div className="card-glass rounded-xl p-3 mb-2 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-medium text-foreground truncate">{activity.activityType}</span>
        <Badge variant="outline" className="text-xs border-border text-muted-foreground flex-shrink-0">
          {activity.stage}
        </Badge>
      </div>
      {activity.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{activity.notes}</p>
      )}
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        {new Date(Number(activity.createdAt) / 1_000_000).toLocaleDateString()}
      </div>
    </div>
  );
}

function StageSkeleton() {
  return (
    <div className="card-glass rounded-xl p-4 min-w-[220px]">
      <Skeleton className="h-5 w-24 mb-3 rounded" />
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-16 w-full mb-2 rounded-xl" />
      ))}
    </div>
  );
}

export default function CRMPage() {
  const { data: allActivities = [], isLoading } = useGetAllCRMActivities();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allActivities;
    const q = search.toLowerCase();
    return allActivities.filter(a =>
      a.activityType.toLowerCase().includes(q) ||
      a.notes.toLowerCase().includes(q) ||
      a.stage.toLowerCase().includes(q)
    );
  }, [allActivities, search]);

  const byStage = useMemo(() => {
    const map: Record<string, CRMActivity[]> = {};
    STAGES.forEach(s => { map[s.key] = []; });
    filtered.forEach(a => {
      if (map[a.stage]) map[a.stage].push(a);
      else {
        if (!map['Other']) map['Other'] = [];
        map['Other'].push(a);
      }
    });
    return map;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground mb-1">CRM Pipeline</h1>
            <p className="text-sm text-muted-foreground">Track your sales activities across stages</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {STAGES.map(stage => (
            <div key={stage.key} className="card-glass rounded-xl p-3 text-center">
              <div className={cn('flex justify-center mb-1', stage.color)}>{stage.icon}</div>
              <div className="text-lg font-bold text-foreground">{byStage[stage.key]?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground">{stage.key}</div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(s => <StageSkeleton key={s.key} />)}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => (
              <div key={stage.key} className="card-glass rounded-xl p-4 min-w-[220px] flex-shrink-0">
                <div className={cn('flex items-center gap-2 mb-3 font-semibold text-sm', stage.color)}>
                  {stage.icon}
                  {stage.key}
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    {byStage[stage.key]?.length ?? 0}
                  </span>
                </div>
                {byStage[stage.key]?.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No activities</p>
                ) : (
                  byStage[stage.key].map(activity => (
                    <ActivityCard key={Number(activity.id)} activity={activity} />
                  ))
                )}
              </div>
            ))}
          </div>
        )}

        {allActivities.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No CRM Activities Yet</h3>
            <p className="text-sm text-muted-foreground">Activities will appear here as you work with leads and projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
