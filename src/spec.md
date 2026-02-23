# Specification

## Summary
**Goal:** Add editable payment link and QR code options for services and payment pages.

**Planned changes:**
- Add UI controls in ServicesPage to edit payment links and QR codes for each service
- Extend Service data model to include paymentLinkUrl and qrCodeDataUrl fields
- Create React Query mutations for updating service payment information
- Update ServiceDetailPage to display payment link and QR code with edit options
- Ensure PaymentsPage displays editable payment links using existing EditPaymentLinkDialog

**User-visible outcome:** Users can add and edit payment links and QR codes for individual services, view them on service detail pages, and manage payment links in the payments section with copy and download options.
