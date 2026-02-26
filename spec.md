# Specification

## Summary
**Goal:** Rebuild the AI Sales System automation-related pages (AutomationPage, ServiceRecommendationPage, ProposalGeneratorPage) with full functionality, backend persistence, and proper sidebar navigation using the existing teal-green + black theme.

**Planned changes:**
- Rebuild `AutomationPage` with three sections: Sales System Configuration (API endpoint + API key + Test Connection), Automation Rules toggles (WhatsApp auto-reply, proposal auto-send, lead follow-up), and Integration Status indicators
- Rebuild `ServiceRecommendationPage` as an AI-powered form (business type, budget range, goals) that calls the configured API endpoint and displays service recommendation cards; falls back to rule-based logic if no API is configured
- Rebuild `ProposalGeneratorPage` as an AI-powered proposal creation form (client name, business type, services, scope, budget) that generates a formatted proposal preview with a downloadable PDF option
- Add `getSalesSystemConfig` (query) and `setSalesSystemConfig` (update, admin/manager only) functions to the backend Motoko actor with upgrade-persistent storage
- Add `useGetSalesSystemConfig` and `useUpdateSalesSystemConfig` hooks in `useQueries.ts` to connect the config panel to the backend
- Add sidebar navigation entries for "Service Recommendation" and "Proposal Generator" under an AI Sales Tools group, visible to Admin and Manager roles, with teal-green active state
- Register `/service-recommendation` and `/proposal-generator` routes in `App.tsx`

**User-visible outcome:** Admins and managers can configure an AI API endpoint, toggle automation rules, get AI-powered service recommendations, and generate downloadable client proposals — all within a consistent teal-green + black themed interface accessible from the sidebar.
