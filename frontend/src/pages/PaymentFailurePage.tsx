import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { XCircle, Home, ShoppingCart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePaymentProcessingWorkflow } from '../hooks/usePaymentProcessingWorkflow';
import { WorkflowResultDisplay } from '../components/workflows/WorkflowResultDisplay';
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
    const paymentId = params.get('payment_id') || sessionStorage.getItem('payment_id') || undefined;
    const errorMessage = params.get('error') || 'Payment was declined or cancelled';

    triggerPaymentFailure({ paymentId, errorMessage }).then(result => {
      setWorkflowResult(result);
    });
  }, [triggerPaymentFailure]);

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <Card className="card-glass border-red-500/30">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
                <XCircle className="w-12 h-12 text-red-400" />
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
                onClick={() => navigate({ to: '/authenticated' })}
                className="w-full border-border/50"
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
