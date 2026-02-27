import { useAutomationTriggers } from './useAutomationTriggers';

export function useLeadFollowUpTrigger() {
  const { triggerLeadFollowUp } = useAutomationTriggers();

  const triggerFollowUpForLead = async (leadId: string | number, leadData: Record<string, unknown>) => {
    await triggerLeadFollowUp({ id: leadId, ...leadData });
  };

  return { triggerFollowUpForLead };
}
