import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AIConfigProvider } from './contexts/AIConfigContext';
import { WebhookLogProvider } from './contexts/WebhookLogContext';

import AppShell from './components/layout/AppShell';
import BootstrapGate from './components/bootstrap/BootstrapGate';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import LeadsPage from './pages/LeadsPage';
import CRMPage from './pages/CRMPage';
import AutomationPage from './pages/AutomationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PaymentsPage from './pages/PaymentsPage';
import LegalPage from './pages/LegalPage';
import SettingsPage from './pages/SettingsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import NotificationsPage from './pages/NotificationsPage';
import GeneratorsPage from './pages/GeneratorsPage';
import ServiceRecommendationPage from './pages/ServiceRecommendationPage';
import ProposalGeneratorPage from './pages/ProposalGeneratorPage';
import PricingStrategyPage from './pages/PricingStrategyPage';
import ClosingScriptsPage from './pages/ClosingScriptsPage';
import FollowUpMessagesPage from './pages/FollowUpMessagesPage';
import LeadQualificationPage from './pages/LeadQualificationPage';
import InvoiceHistoryPage from './pages/InvoiceHistoryPage';
import WhatsAppLogsPage from './pages/WhatsAppLogsPage';
import DataExportCenterPage from './pages/DataExportCenterPage';
import SalesSystemConfigPage from './pages/SalesSystemConfigPage';
import WebhookLogsPage from './pages/WebhookLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// Root layout
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

// Authenticated layout
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

const dashboardRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/', component: DashboardPage });
const adminDashboardRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/admin-dashboard', component: AdminDashboardPage });
const managerDashboardRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/manager-dashboard', component: ManagerDashboardPage });
const clientDashboardRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/client-dashboard', component: ClientDashboardPage });
const leadsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/leads', component: LeadsPage });
const crmRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/crm', component: CRMPage });
const automationRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/automation', component: AutomationPage });
const analyticsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/analytics', component: AnalyticsPage });
const paymentsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/payments', component: PaymentsPage });
const legalRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/legal', component: LegalPage });
const settingsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/settings', component: SettingsPage });
const salesSystemConfigRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/settings/sales-system-config', component: SalesSystemConfigPage });
const projectsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/projects', component: ProjectsPage });
const projectDetailRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/projects/$projectId', component: ProjectDetailPage });
const clientOnboardingRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/onboarding', component: ClientOnboardingPage });
const servicesRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/services', component: ServicesPage });
const serviceDetailRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/services/$serviceId', component: ServiceDetailPage });
const cartRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/cart', component: CartPage });
const checkoutRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/checkout', component: CheckoutPage });
const paymentSuccessRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/payment-success', component: PaymentSuccessPage });
const paymentFailureRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/payment-failure', component: PaymentFailurePage });
const notificationsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/notifications', component: NotificationsPage });
const generatorsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/generators', component: GeneratorsPage });
const serviceRecommendationRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/generators/service-recommendation', component: ServiceRecommendationPage });
const proposalGeneratorRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/generators/proposal-generator', component: ProposalGeneratorPage });
const pricingStrategyRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/generators/pricing-strategy', component: PricingStrategyPage });
const closingScriptsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/generators/closing-scripts', component: ClosingScriptsPage });
const followUpRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/generators/follow-up', component: FollowUpMessagesPage });
const leadQualificationRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/generators/lead-qualification', component: LeadQualificationPage });
const invoicesRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/invoices', component: InvoiceHistoryPage });
const whatsappLogsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/whatsapp-logs', component: WhatsAppLogsPage });
const dataExportRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/data-export', component: DataExportCenterPage });
const webhookLogsRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/webhook-logs', component: WebhookLogsPage });

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    adminDashboardRoute,
    managerDashboardRoute,
    clientDashboardRoute,
    leadsRoute,
    crmRoute,
    automationRoute,
    analyticsRoute,
    paymentsRoute,
    legalRoute,
    settingsRoute,
    salesSystemConfigRoute,
    projectsRoute,
    projectDetailRoute,
    clientOnboardingRoute,
    servicesRoute,
    serviceDetailRoute,
    cartRoute,
    checkoutRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
    notificationsRoute,
    generatorsRoute,
    serviceRecommendationRoute,
    proposalGeneratorRoute,
    pricingStrategyRoute,
    closingScriptsRoute,
    followUpRoute,
    leadQualificationRoute,
    invoicesRoute,
    whatsappLogsRoute,
    dataExportRoute,
    webhookLogsRoute,
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AIConfigProvider>
          <WebhookLogProvider>
            <RouterProvider router={router} />
            <Toaster richColors position="top-right" />
          </WebhookLogProvider>
        </AIConfigProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
