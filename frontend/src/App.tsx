import React, { useState, useEffect } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import LeadsPage from './pages/LeadsPage';
import CRMPage from './pages/CRMPage';
import AutomationPage from './pages/AutomationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import LegalPage from './pages/LegalPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import GeneratorsPage from './pages/GeneratorsPage';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import ServiceRecommendationPage from './pages/ServiceRecommendationPage';
import ProposalGeneratorPage from './pages/ProposalGeneratorPage';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from './hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// ─── Profile Setup Dialog ─────────────────────────────────────────────────────

function ProfileSetupDialog() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return;
    await saveProfile.mutateAsync({
      name: name.trim(),
      email: email.trim(),
      businessName: businessName.trim() || undefined,
    });
  };

  if (!showProfileSetup) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-border" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please set up your profile to continue using the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business" className="text-foreground">Business Name (optional)</Label>
            <Input
              id="business"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
              className="bg-background border-border text-foreground"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || saveProfile.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saveProfile.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Layout with Auth Guard ───────────────────────────────────────────────────

function AuthenticatedLayout() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  return (
    <AppShell>
      <ProfileSetupDialog />
      <Outlet />
    </AppShell>
  );
}

// ─── Router Setup ─────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/services',
  component: ServicesPage,
});

const serviceDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/services/$serviceId',
  component: ServiceDetailPage,
});

const leadsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/leads',
  component: LeadsPage,
});

const crmRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/crm',
  component: CRMPage,
});

const automationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/automation',
  component: AutomationPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/payments',
  component: PaymentsPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/projects',
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const legalRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/legal',
  component: LegalPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: SettingsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const generatorsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators',
  component: GeneratorsPage,
});

const clientOnboardingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/onboarding/$projectId',
  component: ClientOnboardingPage,
});

const serviceRecommendationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/service-recommendation',
  component: ServiceRecommendationPage,
});

const proposalGeneratorRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/proposal-generator',
  component: ProposalGeneratorPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    servicesRoute,
    serviceDetailRoute,
    leadsRoute,
    crmRoute,
    automationRoute,
    analyticsRoute,
    paymentsRoute,
    projectsRoute,
    projectDetailRoute,
    cartRoute,
    checkoutRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
    legalRoute,
    settingsRoute,
    notificationsRoute,
    generatorsRoute,
    clientOnboardingRoute,
    serviceRecommendationRoute,
    proposalGeneratorRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
