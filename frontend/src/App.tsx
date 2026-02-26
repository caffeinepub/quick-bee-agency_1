import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import CRMPage from './pages/CRMPage';
import PaymentsPage from './pages/PaymentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InvoiceHistoryPage from './pages/InvoiceHistoryPage';
import SettingsPage from './pages/SettingsPage';
import WhatsAppLogsPage from './pages/WhatsAppLogsPage';
import AutomationPage from './pages/AutomationPage';
import GeneratorsPage from './pages/GeneratorsPage';
import NotificationsPage from './pages/NotificationsPage';
import LegalPage from './pages/LegalPage';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import ServiceRecommendationPage from './pages/ServiceRecommendationPage';
import ProposalGeneratorPage from './pages/ProposalGeneratorPage';
import PricingStrategyPage from './pages/PricingStrategyPage';
import DataExportCenterPage from './pages/DataExportCenterPage';
import BootstrapGate from './components/bootstrap/BootstrapGate';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

// Admin dashboard route
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-dashboard',
  component: AdminDashboardPage,
});

// Manager dashboard route
const managerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager-dashboard',
  component: ManagerDashboardPage,
});

// Client dashboard route
const clientDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client-dashboard',
  component: ClientDashboardPage,
});

// Payment routes (outside app shell)
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

// Authenticated layout route
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/authenticated',
  component: () => (
    <BootstrapGate>
      <AppShell>
        <Outlet />
      </AppShell>
    </BootstrapGate>
  ),
});

// Authenticated child routes
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});

const leadsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/leads',
  component: LeadsPage,
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

const crmRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/crm',
  component: CRMPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/payments',
  component: PaymentsPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const invoicesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/invoices',
  component: InvoiceHistoryPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: SettingsPage,
});

const whatsappLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/whatsapp-logs',
  component: WhatsAppLogsPage,
});

const automationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/automation',
  component: AutomationPage,
});

const generatorsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators',
  component: GeneratorsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const legalRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/legal',
  component: LegalPage,
});

const clientOnboardingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/onboarding',
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

const pricingStrategyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/pricing-strategy',
  component: PricingStrategyPage,
});

const dataExportRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/data-export',
  component: DataExportCenterPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  adminDashboardRoute,
  managerDashboardRoute,
  clientDashboardRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    leadsRoute,
    projectsRoute,
    projectDetailRoute,
    servicesRoute,
    serviceDetailRoute,
    cartRoute,
    checkoutRoute,
    crmRoute,
    paymentsRoute,
    analyticsRoute,
    invoicesRoute,
    settingsRoute,
    whatsappLogsRoute,
    automationRoute,
    generatorsRoute,
    notificationsRoute,
    legalRoute,
    clientOnboardingRoute,
    serviceRecommendationRoute,
    proposalGeneratorRoute,
    pricingStrategyRoute,
    dataExportRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
