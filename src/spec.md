# Specification

## Summary
**Goal:** Build a fully functional “Quick Bee Agency” Agency SaaS with a premium dark teal UI, role-based access, service marketplace + Stripe checkout, and core CRM/leads/projects/analytics/automation/generators modules backed by a single Motoko actor.

**Planned changes:**
- Implement the app-wide dark UI design system (deep black + teal accents/gradients, glassmorphism cards, hover/transition system) with responsive sidebar + top navbar (notifications + profile).
- Add consistent gradient 3D-style iconography for sidebar navigation and module/feature cards, plus a subtle teal mesh/blur background treatment.
- Implement role-based login (Admin/Manager/Client) using fixed demo credentials, session handling, and strict role-based navigation/action enforcement (frontend + backend).
- Build pages/routes for: Dashboard, Leads, Services (Marketplace), CRM, Automation, Analytics, Payments, Legal, Settings.
- Implement Service Marketplace with 30 productized services, tiered INR pricing (Basic/Pro/Premium), service detail + tier comparison, cart, and checkout flow.
- Integrate Stripe (test mode) INR checkout; on payment success create an Order/Payment record and auto-create a linked Project for the purchasing client.
- Implement Client onboarding form (Business Name, Niche, Goals, Budget, Timeline) linked to client projects; add project tracking with deliverables placeholders.
- Build Leads system (up to 3000) with channels, 50 micro-niche filters, scraping-ready fields (storage only), manual entry/import, and CSV export.
- Implement CRM pipeline stages with move-between-stage workflow, tasks, in-app reminders (notifications only), notes, and activity timeline; link with leads/projects where applicable.
- Create Analytics dashboards with glowing gradient charts for revenue, active clients, conversion rate, top-selling services, and lead source performance using stored and/or seeded demo data.
- Add Automation Center (rule-based, non-AI) with toggles, simple rule configuration, and automation logs/events.
- Replace AI modules with deterministic template/rule “Generators” (service recommendations, proposals, pricing strategy, closing scripts, follow-up templates, lead scoring) including downloadable proposal output (PDF if feasible, else HTML/text) and generator logs.
- Implement Legal Essentials pages with backend-stored templates; Admin can edit, others view per role.
- Implement Offer management (festival/student/limited-time toggles + coupon codes) applied in cart/checkout and stored on orders.
- Build in-app notifications center with unread indicator; generate notifications for payments, CRM reminders, generator/proposal creation, and project updates (no email).
- Define backend data models + APIs in a single Motoko actor for all modules (users/roles, services/packages, cart/orders/payments, projects/onboarding, leads, CRM, offers/coupons, legal pages, notifications, generator logs) with seed/demo data and basic admin management screens.

**User-visible outcome:** Users can sign in as Admin/Manager/Client with demo credentials, navigate a dark teal SaaS dashboard, browse and purchase service packages via Stripe (INR), get auto-created projects with onboarding, manage leads and CRM pipeline with tasks/reminders, view analytics, run rule-based automations and generators (download proposals), manage legal pages/offers (Admin), and use an in-app notification center.
