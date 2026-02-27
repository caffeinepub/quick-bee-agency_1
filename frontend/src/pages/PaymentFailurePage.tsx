import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePaymentProcessingWorkflow } from '../hooks/usePaymentProcessingWorkflow';
import WorkflowResultDisplay from '../components/workflows/WorkflowResultDisplay';
import type { WorkflowResult } from '../hooks/useWorkflowExecution';

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const { triggerPaymentFailure } = usePaymentProcessingWorkflow();
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const params = new URLSearchParams(window.location.search);
    const payment_id = params.get('payment_id') || sessionStorage.getItem('payment_id') || undefined;
    const order_id = params.get('order_id') || sessionStorage.getItem('order_id') || undefined;
    const lead_id = params.get('lead_id') || sessionStorage.getItem('lead_id') || undefined;

    triggerPaymentFailure({ payment_id, lead_id, order_id }).then(result => {
      setWorkflowResult(result);
    });
  }, [triggerPaymentFailure]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <Card className="bg-card border-destructive/30">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10 border border-destructive/30">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
              <p className="text-muted-foreground mt-2">
                Your payment could not be processed. Please try again or contact support.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => navigate({ to: '/authenticated/cart' })}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/authenticated/dashboard' })}
                className="w-full border-border"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {workflowResult && <WorkflowResultDisplay result={workflowResult} />}
      </div>
    </div>
  );
}
