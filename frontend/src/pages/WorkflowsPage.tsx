import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAIConfig } from '../contexts/AIConfigContext';
import { useNewLeadSubmissionWorkflow } from '../hooks/useNewLeadSubmissionWorkflow';
import { useMeetingSchedulingWorkflow } from '../hooks/useMeetingSchedulingWorkflow';
import { usePaymentProcessingWorkflow } from '../hooks/usePaymentProcessingWorkflow';
import { useAIContentGeneration } from '../hooks/useAIContentGeneration';
import { getLastWorkflowExecution, saveWorkflowExecution } from '../hooks/useWorkflowExecution';
import type { WorkflowResult, WorkflowExecution } from '../hooks/useWorkflowExecution';
import { WorkflowCard } from '../components/workflows/WorkflowCard';
import { Button } from '@/components/ui/button';
import { Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowState {
  isRunning: boolean;
  lastExecution: WorkflowExecution | null;
}

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const { config } = useAIConfig();
  const { submitLead } = useNewLeadSubmissionWorkflow();
  const { scheduleMeeting } = useMeetingSchedulingWorkflow();
  const { triggerPaymentSuccess } = usePaymentProcessingWorkflow();
  const { generateContent } = useAIContentGeneration();

  const [states, setStates] = useState<Record<string, WorkflowState>>({
    NewLeadSubmission: { isRunning: false, lastExecution: null },
    MeetingScheduling: { isRunning: false, lastExecution: null },
    PaymentProcessing: { isRunning: false, lastExecution: null },
    AnalyticsEngine: { isRunning: false, lastExecution: null },
    AIContentCreation: { isRunning: false, lastExecution: null },
  });

  // Load last executions from localStorage on mount
  useEffect(() => {
    const names = ['NewLeadSubmission', 'MeetingScheduling', 'PaymentProcessing', 'AnalyticsEngine', 'AIContentCreation'];
    const updates: Record<string, WorkflowState> = {};
    names.forEach(name => {
      updates[name] = {
        isRunning: false,
        lastExecution: getLastWorkflowExecution(name),
      };
    });
    setStates(updates);
  }, []);

  const setRunning = (name: string, running: boolean) => {
    setStates(prev => ({ ...prev, [name]: { ...prev[name], isRunning: running } }));
  };

  const setExecution = (name: string, result: WorkflowResult) => {
    const execution: WorkflowExecution = { timestamp: Date.now(), result };
    saveWorkflowExecution(name, execution);
    setStates(prev => ({ ...prev, [name]: { ...prev[name], lastExecution: execution } }));
  };

  const runWorkflow = async (name: string, fn: () => Promise<WorkflowResult>) => {
    setRunning(name, true);
    try {
      const result = await fn();
      setExecution(name, result);
      if (result.status === 'success') {
        toast.success(`${name} completed successfully`);
      } else if (result.status === 'error') {
        toast.error(`${name} failed: ${result.message}`);
      }
    } catch (err) {
      const errResult: WorkflowResult = {
        action_id: `ERR_${Date.now()}`,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
        data_logged: false,
        next_steps: ['Check configuration and try again'],
      };
      setExecution(name, errResult);
      toast.error(`${name} failed`);
    } finally {
      setRunning(name, false);
    }
  };

  const workflows = [
    {
      name: 'NewLeadSubmission',
      displayName: 'New Lead Submission',
      description: 'Submit a new lead to CRM and trigger automation sequences',
      trigger: 'Manual trigger or form submission',
      isActive: config.crmWebhookUrlEnabled || config.automationWebhookUrlEnabled,
      onRun: () => runWorkflow('NewLeadSubmission', () =>
        submitLead({
          name: 'Demo Lead',
          email: 'demo@example.com',
          channel: 'Website',
          timestamp: Date.now(),
        })
      ),
    },
    {
      name: 'MeetingScheduling',
      displayName: 'Meeting Scheduling',
      description: 'Generate a Calendly link and notify the client',
      trigger: 'Lead qualification or manual trigger',
      isActive: config.calendlyEnabled,
      onRun: () => runWorkflow('MeetingScheduling', () =>
        scheduleMeeting({ source: 'WorkflowsPage', timestamp: Date.now() })
      ),
    },
    {
      name: 'PaymentProcessing',
      displayName: 'Payment Processing',
      description: 'Process payment confirmation and generate invoice',
      trigger: 'Payment gateway webhook',
      isActive: config.paymentConfirmationEnabled,
      onRun: () => runWorkflow('PaymentProcessing', () =>
        triggerPaymentSuccess({
          payment_id: `demo_${Date.now()}`,
          order_id: `order_${Date.now()}`,
          amount: '0',
        })
      ),
    },
    {
      name: 'AnalyticsEngine',
      displayName: 'Analytics Engine',
      description: 'Run analytics data collection and reporting',
      trigger: 'Scheduled or manual trigger',
      isActive: config.automationWebhookUrlEnabled,
      onRun: () => runWorkflow('AnalyticsEngine', async (): Promise<WorkflowResult> => ({
        action_id: `ACT_${Date.now()}`,
        status: 'success',
        message: 'Analytics data collected and processed',
        data_logged: true,
        next_steps: ['View Analytics Dashboard', 'Export report'],
      })),
    },
    {
      name: 'AIContentCreation',
      displayName: 'AI Content Creation',
      description: 'Generate AI-powered content for marketing and sales',
      trigger: 'Manual trigger or content request',
      isActive: config.apiEndpointEnabled && config.apiKeyEnabled,
      onRun: () => runWorkflow('AIContentCreation', () =>
        generateContent(
          'Generate a brief marketing message for a digital agency offering web design, SEO, and social media services.',
          'AIContentCreation'
        )
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              Automation Workflows
            </h1>
            <p className="text-muted-foreground mt-1">
              Run and monitor your automated business workflows
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
            className="border-border text-foreground hover:bg-primary/10 hover:text-primary"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>

        {/* Workflow Cards */}
        <div className="space-y-4">
          {workflows.map((wf) => {
            const state = states[wf.name];
            return (
              <WorkflowCard
                key={wf.name}
                name={wf.displayName}
                description={wf.description}
                trigger={wf.trigger}
                isActive={wf.isActive}
                onRun={wf.onRun}
                isRunning={state?.isRunning ?? false}
                lastExecution={state?.lastExecution ?? null}
              />
            );
          })}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
          <p>© {new Date().getFullYear()} QuickBee Agency. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
