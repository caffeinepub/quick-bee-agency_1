import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import WorkflowResultDisplay from './WorkflowResultDisplay';
import type { WorkflowExecution } from '../../hooks/useWorkflowExecution';

interface WorkflowCardProps {
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  onRun: () => void;
  isRunning: boolean;
  lastExecution: WorkflowExecution | null;
}

export function WorkflowCard({
  name,
  description,
  trigger,
  isActive,
  onRun,
  isRunning,
  lastExecution,
}: WorkflowCardProps) {
  return (
    <Card className="bg-card border-border gold-glow-hover transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground">{name}</h3>
              <Badge
                className={isActive
                  ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs'
                }
              >
                {isActive ? (
                  <><CheckCircle className="w-3 h-3 mr-1" />Active</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" />Inactive</>
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{description}</p>
            <p className="text-xs text-muted-foreground/70">
              <span className="text-primary/70">Trigger:</span> {trigger}
            </p>
          </div>
          <Button
            onClick={onRun}
            disabled={isRunning}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold whitespace-nowrap"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Run</>
            )}
          </Button>
        </div>

        {lastExecution && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 rounded-md px-3 py-2 mb-3">
            {lastExecution.result.status === 'success' ? (
              <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 text-destructive shrink-0" />
            )}
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">
              Last run: {new Date(lastExecution.timestamp).toLocaleString()} — {lastExecution.result.message.substring(0, 50)}
            </span>
          </div>
        )}

        <WorkflowResultDisplay result={lastExecution?.result ?? null} />
      </CardContent>
    </Card>
  );
}

export default WorkflowCard;
