import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Database, ArrowRight } from 'lucide-react';
import type { WorkflowResult } from '../../hooks/useWorkflowExecution';

interface WorkflowResultDisplayProps {
  result: WorkflowResult;
}

export function WorkflowResultDisplay({ result }: WorkflowResultDisplayProps) {
  const statusConfig = {
    success: {
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      label: 'Success',
    },
    error: {
      color: 'bg-red-500/10 border-red-500/30 text-red-400',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      label: 'Error',
    },
    pending_review: {
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      label: 'Pending Review',
    },
  };

  const cfg = statusConfig[result.status];

  return (
    <Card className={`border ${cfg.color} mt-3`}>
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {cfg.icon}
          Execution Result
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.badgeClass}`}>
            {cfg.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium w-24 shrink-0">Action ID:</span>
          <span className="font-mono text-foreground/80 break-all">{result.action_id}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium w-24 shrink-0">Message:</span>
          <span className="text-foreground/90">{result.message}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium w-24 shrink-0">Data Logged:</span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            {result.data_logged ? (
              <span className="text-emerald-400">Yes</span>
            ) : (
              <span className="text-muted-foreground">No</span>
            )}
          </span>
        </div>
        {result.next_steps && (
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground font-medium w-24 shrink-0">Next Steps:</span>
            <span className="flex items-start gap-1 text-foreground/80">
              <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
              {result.next_steps}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
