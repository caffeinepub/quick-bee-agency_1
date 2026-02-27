# Specification

## Summary
**Goal:** Add five automation workflow pages and supporting infrastructure to the Quick Bee AI Growth Engine dashboard, including a Workflows dashboard, Analytics Engine, and AI Content Creator, all wired through the existing centralized webhook config store.

**Planned changes:**
- Add an Automation Workflows dashboard page (accessible from sidebar under "Workflows") displaying five workflow cards: New Lead Submission, Meeting Scheduling, Payment Processing, Analytics Engine, and AI Content Creation — each with status indicator, manual Run button, and last execution info from localStorage
- Implement Workflow 1 (New Lead Submission): validates lead fields, POSTs to CRM and Automation webhook URLs with deduplication flag, logs results, and displays structured JSON response and follow-up message
- Implement Workflow 2 (Meeting Scheduling): adds a booking link generator panel that reads Calendly URL from config, copies link to clipboard, POSTs to Automation webhook, and updates lead status to "Meeting Scheduled"
- Implement Workflow 3 (Payment Processing): on payment success/failure events, POSTs structured payload to Automation webhook URL, generates invoice reference (QBA-{timestamp}), and logs both outcomes
- Create Analytics Engine page at `/analytics-engine`: date range form (default last 7 days), POSTs to Automation webhook, renders mock metrics (Total Users, Sessions, Bounce Rate, Top Traffic Source, Conversion Rate) and a Growth Summary section
- Create AI Content Creator page at `/content-creator`: keyword input form, OpenAI-compatible POST using saved API credentials, renders four labelled sections (Blog Content, Social Media Captions, LinkedIn Post, Instagram Carousel) with Copy and Export All buttons, also POSTs to Automation webhook
- Add "Calendly URL" field with ON/OFF toggle to the Sales System Configuration page, persisted via the centralized config store
- Update sidebar navigation to include "Workflows", "Analytics Engine", and "Content Creator" links visible to Admin and Manager roles
- Register routes `/analytics-engine` and `/content-creator` in App.tsx under the authenticated shell
- Display structured JSON result card `{ action_id, status, message, data_logged, next_steps }` after every workflow trigger
- Enforce role-based access: Admin has full access, Managers can view and run but not edit config, Clients are redirected to `/client-dashboard`

**User-visible outcome:** Admins and Managers can navigate to dedicated workflow, analytics, and content creation pages from the sidebar, manually trigger automation workflows, view structured JSON results and webhook logs, generate AI content with export options, and manage Calendly URL configuration — all without direct third-party API integration.
