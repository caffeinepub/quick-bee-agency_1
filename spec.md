# Specification

## Summary
**Goal:** Fix the Automation Page toggle switches so they reliably persist and respect their ON/OFF state across navigation and page reloads, and ensure automations only fire when their corresponding toggle is enabled.

**Planned changes:**
- Rewrite `AutomationPage.tsx` so all five toggles (WhatsApp Auto-Reply, Proposal Auto-Send, Lead Follow-Up Sequences, Payment Confirmation, Project Onboarding) read from and write to `AIConfigContext` (localStorage-backed).
- Audit and update `AIConfigContext.tsx` to ensure all five boolean toggle fields are defined in the context type, initialized from localStorage on mount, and persisted on change without overwriting other config fields.
- Audit and update `useAutomationTriggers.ts` so each trigger function checks its corresponding toggle at call time and returns early (no network request) when the toggle is OFF; when ON, fires a POST with correct headers and shows a toast on failure.

**User-visible outcome:** Each automation toggle on the Automation Page correctly shows its saved state after navigation or full reload, and automations only execute webhook/API calls when their toggle is switched ON.
