import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Database, ArrowRight } from 'lucide-react';
import type { WorkflowResult } from '../../hooks/useWorkflowExecution';

interface WorkflowResultDisplayProps {
  result: WorkflowResult | null;
}

export function WorkflowResultDisplay({ result }: WorkflowResultDisplayProps) {
  if (!result) return null;

  const isSuccess = result.status === 'success';
  const isError = result.status === 'error';

  return (
    <Card className={`border ${isSuccess ? 'border-green-500/30 bg-green-500/5' : isError ? 'border-destructive/30 bg-destructive/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
      <CardContent className="p-4 space-y-3">
        {/* Status Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : isError ? (
              <XCircle className="w-4 h-4 text-destructive" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-400" />
            )}
            <Badge
              className={isSuccess
                ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
                : isError
                ? 'bg-red-500/20 text-red-400 border-red-500/30 text-xs'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs'
              }
            >
              {result.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{result.action_id}</span>
          </div>
          <Badge
            className={result.data_logged
              ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs'
            }
          >
            <Database className="w-3 h-3 mr-1" />
            {result.data_logged ? 'Logged' : 'Not Logged'}
          </Badge>
        </div>

        {/* Message */}
        <p className="text-sm text-foreground">{result.message}</p>

        {/* Next Steps */}
        {result.next_steps && result.next_steps.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Next Steps</p>
            <ul className="space-y-1">
              {result.next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WorkflowResultDisplay;
