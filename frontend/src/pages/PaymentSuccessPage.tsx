import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, Home, FolderOpen, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePaymentProcessingWorkflow } from '../hooks/usePaymentProcessingWorkflow';
import WorkflowResultDisplay from '../components/workflows/WorkflowResultDisplay';
import type { WorkflowResult } from '../hooks/useWorkflowExecution';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { triggerPaymentSuccess } = usePaymentProcessingWorkflow();
  const [invoiceRef, setInvoiceRef] = useState<string>('');
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const params = new URLSearchParams(window.location.search);
    const payment_id = params.get('payment_id') || sessionStorage.getItem('payment_id') || undefined;
    const lead_id = params.get('lead_id') || sessionStorage.getItem('lead_id') || undefined;
    const order_id = params.get('order_id') || sessionStorage.getItem('order_id') || undefined;
    const amountRaw = params.get('amount');
    const amount = amountRaw ? String(amountRaw) : undefined;

    triggerPaymentSuccess({ payment_id, lead_id, order_id, amount }).then(result => {
      setInvoiceRef(result.invoiceRef);
      setWorkflowResult(result);
    });
  }, [triggerPaymentSuccess]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <Card className="bg-card border-green-500/30">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-500/10 border border-green-500/30">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
              <p className="text-muted-foreground mt-2">
                Your payment has been processed successfully.
              </p>
            </div>
            {invoiceRef && (
              <div className="bg-muted/30 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Receipt className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Invoice Reference:</span>
                  <span className="font-mono font-bold text-primary">{invoiceRef}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => navigate({ to: '/authenticated/projects' })}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                View My Projects
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
