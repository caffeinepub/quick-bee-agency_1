import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { WorkflowResultDisplay } from './WorkflowResultDisplay';
import type { WorkflowResult } from '../../hooks/useWorkflowExecution';
import { getLastWorkflowExecution } from '../../hooks/useWorkflowExecution';

interface WorkflowCardProps {
  id: string;
  name: string;
  trigger: string;
  description: string;
  isActive: boolean;
  onRun: () => Promise<WorkflowResult>;
  extraForm?: React.ReactNode;
}

export function WorkflowCard({
  id,
  name,
  trigger,
  description,
  isActive,
  onRun,
  extraForm,
}: WorkflowCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const lastExecution = getLastWorkflowExecution(id);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await onRun();
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="card-glass border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground">{name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <Badge
            variant="outline"
            className={isActive
              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shrink-0'
              : 'border-muted text-muted-foreground shrink-0'
            }
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Trigger: {trigger}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {extraForm && <div>{extraForm}</div>}

        {lastExecution && !result && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
            {lastExecution.status === 'success' ? (
              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400 shrink-0" />
            )}
            <span>Last run: {lastExecution.message.substring(0, 60)}...</span>
          </div>
        )}

        <Button
          onClick={handleRun}
          disabled={isRunning}
          size="sm"
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 mr-2" />
              Run Workflow
            </>
          )}
        </Button>

        {result && <WorkflowResultDisplay result={result} />}
      </CardContent>
    </Card>
  );
}
