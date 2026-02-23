# Specification

## Summary
**Goal:** Add editable Razorpay payment configuration to the service marketplace, enabling admins to configure and manage Razorpay as an alternative payment method for individual services.

**Planned changes:**
- Extend Service type in backend to include Razorpay fields (razorpayEnabled, razorpayKeyId, razorpayOrderId)
- Add backend methods for updating and retrieving Razorpay configuration with admin-only access control
- Create ServiceRazorpayDialog component for editing Razorpay settings per service
- Add UI controls in ServicesPage to configure Razorpay options similar to payment link editing
- Display Razorpay status and edit button in ServiceDetailPage for admins
- Extend CheckoutPage to support Razorpay as payment method when enabled for cart services

**User-visible outcome:** Admins can enable and configure Razorpay payment options for individual services in the marketplace. Users see both Stripe and Razorpay payment options at checkout when Razorpay is enabled for services in their cart.
