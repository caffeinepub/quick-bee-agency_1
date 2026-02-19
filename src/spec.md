# Specification

## Summary
**Goal:** Integrate Razorpay payment automation and enhance lead CRM with CSV export and bulk actions.

**Planned changes:**
- Add CSV export functionality to download all lead data from the leads table
- Integrate Razorpay payment gateway with automated payment link generation when leads are marked as 'qualified'
- Implement webhook handling to automatically update lead status to 'paid' upon successful payment
- Add Razorpay configuration panel in admin settings for API credentials management
- Create automated notification system that triggers on lead status changes (qualified, paid, onboarding)
- Add bulk actions to leads table for multi-select operations (status update, export selected, delete selected)

**User-visible outcome:** Admins can export lead data to CSV, configure Razorpay payment integration, automatically generate payment links for qualified leads, receive automatic status updates when payments succeed, get notifications on lead status changes, and perform bulk operations on multiple leads at once.
