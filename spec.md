# Specification

## Summary
**Goal:** Add five new automation integration cards to the Automation Page under the Integrations & API section, with toggles, descriptions, configuration panels, and full backend persistence.

**Planned changes:**
- Add "Auto WhatsApp Replies" card with toggle, description ("Automated responses for WhatsApp messages"), and config fields for WhatsApp API key/webhook URL.
- Add "Sequence Builder" card with toggle, description ("Create automated in-app task sequences"), and UI to add/edit/remove task steps (name and delay).
- Add "Proposal Auto-Send" card with toggle, description ("Auto-generate proposals when leads are qualified"), and config for lead qualified status trigger.
- Add "Payment Confirmation" card with toggle, description ("Automated payment confirmation notifications"), and config for notification channel (in-app, email placeholder).
- Add "Project Onboarding" card with toggle, description ("Auto-trigger onboarding after payment"), and config for payment trigger condition.
- Extend backend `integrationSettings` data model with fields for all five new automation types (enabled flag + config blob each).
- Update migration module to handle the new fields on canister upgrade.
- Add/update React Query hooks in `useQueries.ts` to read and write all five new automation integration settings.

**User-visible outcome:** Users can visit the Automation Page, see five new automation cards under Integrations & API, toggle each on/off, fill in configuration options, and have all settings persist to the backend.
