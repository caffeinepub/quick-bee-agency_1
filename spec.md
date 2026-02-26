# Specification

## Summary
**Goal:** Debug and fix API settings persistence, automation toggles, webhook triggers, AI module responses, and export functionality across the QuickBee Sales Engine dashboard.

**Planned changes:**
- Implement a centralized localStorage-backed config store for all API settings (API Endpoint, API Key, WhatsApp Token, Razorpay Keys, Email API Key, CRM Webhook URL, Automation Webhook URL) so values persist across navigation and re-renders, with a "Saved successfully" confirmation toast
- Fix all webhook trigger functions (form submission, lead qualification, payment success, project creation) to send correct HTTP POST requests with proper JSON payloads, Content-Type and Authorization headers, using URLs from the centralized config store
- Add a Webhook Log panel on the Automation page showing timestamped entries with status, URL, and response code for every outgoing webhook attempt; show green/red toasts for success/failure
- Fix automation toggles (WhatsApp Auto-Reply, Proposal Auto-Send, Lead Follow-Up Sequences, Payment Confirmation, Project Onboarding) so they truly block or allow their respective webhook/API calls, with state persisted to localStorage
- Fix AI Smart Systems modules (Service Recommendation, Proposal Generator, Pricing Strategy, Closing Scripts, Follow-Up Messages, Lead Qualification) to correctly call the saved API Endpoint with Bearer auth, display AI responses, show loading spinners, and handle errors
- Fix Razorpay payment webhook handling to fire the Automation Webhook URL with a payment payload on payment success, and fix WhatsApp Auto-Reply to POST a WhatsApp message payload when the toggle is ON and the token/URL are configured
- Fix PDF and CSV export functions across Leads, AI result pages, WhatsApp Logs, Invoice History, and Data Export Center to produce valid downloadable files with loading and error states
- Add real-time connection status badges (green/red/grey) for each integration and "Test Connection" buttons for CRM Webhook URL and Automation Webhook URL that fire a test POST and update the badge immediately

**User-visible outcome:** All API settings are reliably saved and used across the dashboard; automation toggles correctly enable/disable their features; webhooks fire with proper payloads and their results are logged; AI modules display generated responses; exports produce valid files; and each integration shows a live connection status with testability.
