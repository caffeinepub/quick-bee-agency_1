import { createRouter, createRoute, createRootRoute, Outlet, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import LeadsPage from './pages/LeadsPage';
import CRMPage from './pages/CRMPage';
import AutomationPage from './pages/AutomationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PaymentsPage from './pages/PaymentsPage';
import LegalPage from './pages/LegalPage';
import SettingsPage from './pages/SettingsPage';
import GeneratorsPage from './pages/GeneratorsPage';
import NotificationsPage from './pages/NotificationsPage';
import AppShell from './components/layout/AppShell';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { toast } from 'sonner';
import { useBootstrapWatchdog } from './hooks/useBootstrapWatchdog';
import BootstrapErrorPanel from './components/bootstrap/BootstrapErrorPanel';

const queryClient = new QueryClient();

function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesPage,
});

const serviceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/$serviceId',
  component: ServiceDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: ClientOnboardingPage,
});

const leadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leads',
  component: LeadsPage,
});

const crmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crm',
  component: CRMPage,
});

const automationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/automation',
  component: AutomationPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payments',
  component: PaymentsPage,
});

const legalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal',
  component: LegalPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const generatorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generators',
  component: GeneratorsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  servicesRoute,
  serviceDetailRoute,
  cartRoute,
  checkoutRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  projectsRoute,
  projectDetailRoute,
  onboardingRoute,
  leadsRoute,
  crmRoute,
  automationRoute,
  analyticsRoute,
  paymentsRoute,
  legalRoute,
  settingsRoute,
  generatorsRoute,
  notificationsRoute,
]);

const router = createRouter({ routeTree });

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', businessName: '' });
  const { hasTimedOut, reset } = useBootstrapWatchdog();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleProfileSubmit = async () => {
    if (!profileForm.name || !profileForm.email) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: profileForm.name,
        email: profileForm.email,
        businessName: profileForm.businessName || undefined,
      });
      toast.success('Profile created successfully');
      setShowProfileSetup(false);
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  if (hasTimedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <BootstrapErrorPanel
          error="Bootstrap timeout: The application took too long to initialize"
          onRetry={reset}
        />
      </div>
    );
  }

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soft-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent className="glass-panel border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Complete Your Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Name *</Label>
              <Input
                id="profile-name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="profile-email">Email *</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="profile-business">Business Name (Optional)</Label>
              <Input
                id="profile-business"
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <Button
              onClick={handleProfileSubmit}
              disabled={saveProfile.isPending}
              className="w-full gradient-teal text-black font-semibold"
            >
              {saveProfile.isPending ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
