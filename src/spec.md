# Specification

## Summary
**Goal:** Add settings and data editing capabilities for services in the marketplace, allowing administrators to configure and modify service details.

**Planned changes:**
- Add settings panel for each service with controls for visibility, featured status, availability, and custom metadata
- Implement data editing for service details including title, description, pricing tiers (Basic, Pro, Premium), features list, and category
- Add "Edit Service" button on ServiceDetailPage that opens an edit dialog for administrators
- Extend backend Service data structure and add updateService mutation to persist service settings and editable fields
- Create useUpdateService mutation hook in useQueries.ts to handle service updates and cache invalidation

**User-visible outcome:** Administrators can click an "Edit Service" button on any service detail page to open a dialog where they can modify service information (title, description, pricing, features) and configure settings (visibility, featured status). Changes are saved to the backend and immediately reflected in the marketplace view.
