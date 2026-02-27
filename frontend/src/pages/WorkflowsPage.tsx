import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Zap, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkflowCard } from '../components/workflows/WorkflowCard';
import { useNewLeadSubmissionWorkflow } from '../hooks/useNewLeadSubmissionWorkflow';
import { useMeetingSchedulingWorkflow } from '../hooks/useMeetingSchedulingWorkflow';
import { usePaymentProcessingWorkflow } from '../hooks/usePaymentProcessingWorkflow';
import { useAIConfig } from '../contexts/AIConfigContext';
import { generateActionId, saveWorkflowExecution } from '../hooks/useWorkflowExecution';
import type { WorkflowResult } from '../hooks/useWorkflowExecution';
import { useGetCallerUserRole } from '../hooks/useQueries';

function LeadSubmissionForm({ onSubmit }: { onSubmit: (data: { name: string; email: string; serviceInterest: string }) => void }) {
  const [name, setName] = useState('Test Lead');
  const [email, setEmail] = useState('test@example.com');
  const [serviceInterest, setServiceInterest] = useState('SEO');

  return (
    <div className="space-y-2 mb-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="h-7 text-xs mt-1" />
        </div>
        <div>
          <Label className="text-xs">Email *</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="h-7 text-xs mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Service Interest *</Label>
        <Input value={serviceInterest} onChange={e => setServiceInterest(e.target.value)} placeholder="e.g. SEO, Social Media" className="h-7 text-xs mt-1" />
      </div>
      <button
        onClick={() => onSubmit({ name, email, serviceInterest })}
        className="text-xs text-primary underline"
      >
        Use these values for test run
      </button>
    </div>
  );
}

function MeetingForm({ onSubmit }: { onSubmit: (data: { leadEmail: string; leadName: string }) => void }) {
  const [leadEmail, setLeadEmail] = useState('test@example.com');
  const [leadName, setLeadName] = useState('Test Lead');

  return (
    <div className="space-y-2 mb-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Lead Name</Label>
          <Input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="John Doe" className="h-7 text-xs mt-1" />
        </div>
        <div>
          <Label className="text-xs">Lead Email</Label>
          <Input value={leadEmail} onChange={e => setLeadEmail(e.target.value)} placeholder="john@example.com" className="h-7 text-xs mt-1" />
        </div>
      </div>
      <button
        onClick={() => onSubmit({ leadEmail, leadName })}
        className="text-xs text-primary underline"
      >
        Use these values for test run
      </button>
    </div>
  );
}

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const { data: role } = useGetCallerUserRole();
  const { config } = useAIConfig();
  const newLeadWorkflow = useNewLeadSubmissionWorkflow();
  const meetingWorkflow = useMeetingSchedulingWorkflow();
  const paymentWorkflow = usePaymentProcessingWorkflow();

  const [leadFormData, setLeadFormData] = useState({ name: 'Test Lead', email: 'test@example.com', serviceInterest: 'SEO' });
  const [meetingFormData, setMeetingFormData] = useState({ leadEmail: 'test@example.com', leadName: 'Test Lead' });

  React.useEffect(() => {
    if (role === 'guest') {
      toast.error('Access denied. Redirecting to dashboard.');
      navigate({ to: '/authenticated/client-dashboard' });
    }
  }, [role, navigate]);

  if (role === 'guest') return null;

  const workflows = [
    {
      id: 'new_lead_submission',
      name: 'New Lead Submission',
      trigger: 'New Typeform submission or manual trigger',
      description: 'Validates lead fields, checks for duplicates in HubSpot, creates contact, logs to Google Sheets, adds to Notion CRM, and sends welcome email via Mailchimp.',
      isActive: !!(config.crmWebhookUrlEnabled || config.automationWebhookUrlEnabled),
      extraForm: <LeadSubmissionForm onSubmit={setLeadFormData} />,
      onRun: async (): Promise<WorkflowResult> => {
        const result = await newLeadWorkflow.execute(leadFormData);
        saveWorkflowExecution('new_lead_submission', result);
        return result;
      },
    },
    {
      id: 'meeting_scheduling',
      name: 'Meeting Scheduling',
      trigger: 'User requests consultation or booking',
      description: 'Generates Calendly booking link, copies to clipboard, sends booking link via email, syncs to Google Calendar, and updates lead status in HubSpot.',
      isActive: !!(config.calendlyEnabled && config.calendlyUrl),
      extraForm: <MeetingForm onSubmit={setMeetingFormData} />,
      onRun: async (): Promise<WorkflowResult> => {
        const result = await meetingWorkflow.execute({
          leadEmail: meetingFormData.leadEmail,
          leadName: meetingFormData.leadName,
          leadId: 'test-001',
        });
        saveWorkflowExecution('meeting_scheduling', result);
        if (result.status === 'success') {
          toast.success('Booking link copied to clipboard!');
        }
        return result;
      },
    },
    {
      id: 'payment_processing',
      name: 'Payment Processing',
      trigger: 'Client selects a paid service',
      description: 'Generates payment link, sends to client email, processes webhook on success/failure, generates invoice reference, sends receipt, and notifies admin.',
      isActive: !!(config.automationWebhookUrlEnabled && config.automationWebhookUrl),
      onRun: async (): Promise<WorkflowResult> => {
        const result = await paymentWorkflow.triggerPaymentSuccess({
          paymentId: `pay_test_${Date.now()}`,
          leadId: 'test-001',
          orderId: `ord_test_${Date.now()}`,
          amount: 9999,
        });
        saveWorkflowExecution('payment_processing', result);
        return result;
      },
    },
    {
      id: 'analytics_engine',
      name: 'Analytics Engine',
      trigger: 'Admin requests performance report',
      description: 'Pulls last 7 days data from Google Analytics 4, extracts key metrics, generates growth summary with trend analysis, drop-off insights, and SEO tips.',
      isActive: !!(config.automationWebhookUrlEnabled && config.automationWebhookUrl),
      onRun: async (): Promise<WorkflowResult> => {
        const actionId = generateActionId();
        const result: WorkflowResult = {
          action_id: actionId,
          status: 'pending_review',
          message: 'Analytics Engine triggered. Navigate to Analytics Engine page for full report.',
          data_logged: false,
          next_steps: 'Go to Analytics Engine page to run a full report with date range selection.',
        };
        saveWorkflowExecution('analytics_engine', result);
        return result;
      },
    },
    {
      id: 'ai_content_creation',
      name: 'AI Content Creation',
      trigger: 'Admin enters keyword/topic',
      description: 'Generates SEO-optimized blog content, social media captions, LinkedIn post, and Instagram carousel outline using AI.',
      isActive: !!(config.apiEndpointEnabled && config.apiEndpoint && config.apiKeyEnabled && config.apiKey),
      onRun: async (): Promise<WorkflowResult> => {
        const actionId = generateActionId();
        const result: WorkflowResult = {
          action_id: actionId,
          status: 'pending_review',
          message: 'AI Content Creation triggered. Navigate to Content Creator page to generate content.',
          data_logged: false,
          next_steps: 'Go to Content Creator page to enter a keyword and generate full content.',
        };
        saveWorkflowExecution('ai_content_creation', result);
        return result;
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automation Workflows</h1>
          <p className="text-sm text-muted-foreground">Manage and trigger your automation workflows</p>
        </div>
      </div>

      {!config.automationWebhookUrl && (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-sm">
            Automation Webhook URL is not configured. Workflows will run in simulation mode.{' '}
            <button
              onClick={() => navigate({ to: '/authenticated/settings/sales-system-config' })}
              className="underline font-medium"
            >
              Configure Now
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workflows.map((wf) => (
          <WorkflowCard
            key={wf.id}
            id={wf.id}
            name={wf.name}
            trigger={wf.trigger}
            description={wf.description}
            isActive={wf.isActive}
            onRun={wf.onRun}
            extraForm={wf.extraForm}
          />
        ))}
      </div>
    </div>
  );
}
