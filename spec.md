# Specification

## Summary
**Goal:** Add a fully functional Agency Services Management section to the dashboard, allowing users to create, edit, duplicate, delete, reorder, preview, and track managed services with packages, add-ons, and visibility controls.

**Planned changes:**
- Extend the Motoko backend (`backend/main.mo`) with `ManagedService`, `ServicePackage`, and `ServiceAddOn` record types and CRUD functions: `createManagedService`, `updateManagedService`, `deleteManagedService` (blocked for non-user-created services), `duplicateManagedService`, `reorderManagedServices`, and `getManagedServices`
- Add React Query hooks in `useQueries.ts` for all new backend functions (`useGetManagedServices`, `useCreateManagedService`, `useUpdateManagedService`, `useDeleteManagedService`, `useDuplicateManagedService`, `useReorderManagedServices`) with cache invalidation and error toasts
- Create `/service-management` page (`ServiceManagementPage.tsx`) registered in `App.tsx` showing service cards with Edit, Duplicate, Delete, Preview, drag handle, and visibility toggle actions; loading skeleton and empty state included
- Add drag-and-drop reordering of service cards using native browser events; on drop, call `useReorderManagedServices`
- Create a multi-step Create/Edit Service dialog (`ManagedServiceFormDialog.tsx`) with four tabs: Basic Info, Features, Packages (Basic/Standard/Premium + add-ons), and Settings (custom requirement label, quantity toggle, visibility toggle)
- Implement Duplicate action (appends " (Copy)" to name) and Delete action with confirmation dialog; show toast error if deletion is rejected by backend
- Create a Service Preview modal (`ManagedServicePreviewModal.tsx`) with read-only client-facing layout, dynamic price calculator (add-on checkboxes + optional quantity input), and custom requirement placeholder
- Add "Service Management" link to `SidebarNav.tsx` pointing to `/service-management`
- Add localStorage-backed Views and Purchases counters per service; increment views on preview open and purchases on "Buy Now" trigger; display as stat badges on each service card
- All new UI uses the existing dark-gold Tailwind theme; existing static service catalog files remain untouched

**User-visible outcome:** Users can access a new "Service Management" page from the sidebar to create and manage their own services with rich details (packages, add-ons, features), reorder them via drag-and-drop, toggle visibility, preview the client-facing view with a live price calculator, and track views/purchases per service.
