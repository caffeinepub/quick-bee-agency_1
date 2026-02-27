# Specification

## Summary
**Goal:** Fix the broken Internet Identity login flow so users can always click the Sign In button and be redirected to the correct dashboard after authentication.

**Planned changes:**
- Rewrite `LoginPage.tsx` so the Sign In with Internet Identity button is always enabled and clickable, calls `login()` from `useInternetIdentity` on click, shows a loading spinner while `isLoggingIn` is true, and displays an inline error if login fails or is cancelled
- Add a `useEffect` in `LoginPage.tsx` that watches `isAuthenticated`/`identity` and redirects to the appropriate dashboard route (`/admin-dashboard`, `/manager-dashboard`, `/client-dashboard`, or `/dashboard`) based on user role after successful authentication
- Rewrite `BootstrapGate.tsx` so it never blocks or wraps the login page with a loading spinner or disabled overlay; it should only intercept navigation to protected routes for authenticated users
- Audit the `useInternetIdentity` hook consumption in `LoginPage.tsx` to ensure correct imports, destructuring, and that `InternetIdentityProvider` is present in `main.tsx`

**User-visible outcome:** Users visiting the login page immediately see an enabled Sign In with Internet Identity button, can click it to authenticate, see a spinner during the process, and are automatically redirected to their role-appropriate dashboard upon success. Cancelled or failed logins show an inline error message.
