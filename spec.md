# Specification

## Summary
**Goal:** Populate the Services page with the complete Quick Bee Agency 2026 Master Service Price List across multiple sections, add direct payment/cart functionality on every service card, and fix the Sign In button on the Login page.

**Planned changes:**
- Add a category filter/tab bar to the Services page with tabs for: Service Catalog, Individual Packages, Maintenance Plans, Agency Plans
- Populate the Service Catalog tab with all 57 services across 7 categories (Web Development, App Development, AI Automation, Digital Marketing & Growth, Branding & Creative, SaaS & Advanced Tech, Business Setup & Systems), each with 3 pricing tiers in INR and a 16-feature list, plus a sub-category filter within the tab
- Add an Individual Packages tab listing all 30 packages sorted by price ascending, each showing flat INR price, category, sub-category, and an expandable 16-feature bullet list
- Add a Maintenance Plans tab with all 5 plan categories (Website, App, AI Automation, Marketing & Growth Retainer, SaaS & Backend Retainer) and their tier price ranges and included features
- Add an Agency Plans tab with 3 master plan cards (Spark — green badge, Surge — blue badge, Titan — purple badge) showing price ranges and target audience descriptions
- Add a tier selector (radio buttons or segmented control) on all tiered service cards so users can pick a pricing tier before purchase
- Add a "Buy Now" / "Select & Pay" button to every card; clicking it adds the item at the selected tier/price to the cart via the existing `useCart` hook and navigates to CheckoutPage; if Razorpay is configured in the config store, initiate the Razorpay payment flow directly
- Fix the Sign In button on LoginPage to correctly bind to the Internet Identity authentication flow, show a loading/spinner state during authentication, redirect to the appropriate dashboard on success, and display a visible error message on failure or cancellation

**User-visible outcome:** Users can browse the full Quick Bee Agency service catalog across all categories and plans, select a pricing tier, and directly purchase or add any service to cart for checkout. The Sign In button on the login screen works correctly with loading feedback and error handling.
