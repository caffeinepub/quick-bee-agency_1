import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AIConfigProvider } from './contexts/AIConfigContext';
import { WebhookLogProvider } from './contexts/WebhookLogContext';
import BootstrapGate from './components/bootstrap/BootstrapGate';
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import LeadsPage from './pages/LeadsPage';
import CRMPage from './pages/CRMPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import PaymentsPage from './pages/PaymentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AutomationPage from './pages/AutomationPage';
import WorkflowsPage from './pages/WorkflowsPage';
import AnalyticsEnginePage from './pages/AnalyticsEnginePage';
import ContentCreatorPage from './pages/ContentCreatorPage';
import GeneratorsPage from './pages/GeneratorsPage';
import ServiceRecommendationPage from './pages/ServiceRecommendationPage';
import ProposalGeneratorPage from './pages/ProposalGeneratorPage';
import PricingStrategyPage from './pages/PricingStrategyPage';
import ClosingScriptsPage from './pages/ClosingScriptsPage';
import FollowUpMessagesPage from './pages/FollowUpMessagesPage';
import LeadQualificationPage from './pages/LeadQualificationPage';
import SettingsPage from './pages/SettingsPage';
import SalesSystemConfigPage from './pages/SalesSystemConfigPage';
import NotificationsPage from './pages/NotificationsPage';
import LegalPage from './pages/LegalPage';
import InvoiceHistoryPage from './pages/InvoiceHistoryPage';
import WhatsAppLogsPage from './pages/WhatsAppLogsPage';
import DataExportCenterPage from './pages/DataExportCenterPage';
import WebhookLogsPage from './pages/WebhookLogsPage';
import ServiceManagementPage from './pages/ServiceManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <BootstrapGate>
      <Outlet />
    </BootstrapGate>
  ),
});

// Root index route — redirect directly to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/authenticated/dashboard', replace: true });
  },
});

// Login route — also redirects to dashboard
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Authenticated layout route
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/authenticated',
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

// Dashboard
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin-dashboard',
  component: AdminDashboardPage,
});

const managerDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/manager-dashboard',
  component: ManagerDashboardPage,
});

const clientDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/client-dashboard',
  component: ClientDashboardPage,
});

// Leads
const leadsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/leads',
  component: LeadsPage,
});

// CRM
const crmRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/crm',
  component: CRMPage,
});

// Services
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

// Service Management
const serviceManagementRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/service-management',
  component: ServiceManagementPage,
});

// Cart & Checkout
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

// Payment
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

// Projects
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

const clientOnboardingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/onboarding',
  component: ClientOnboardingPage,
});

// Payments
const paymentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/payments',
  component: PaymentsPage,
});

// Analytics
const analyticsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

// Automation
const automationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/automation',
  component: AutomationPage,
});

// Workflows
const workflowsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/workflows',
  component: WorkflowsPage,
});

// Analytics Engine
const analyticsEngineRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/analytics-engine',
  component: AnalyticsEnginePage,
});

// Content Creator
const contentCreatorRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/content-creator',
  component: ContentCreatorPage,
});

// Generators
const generatorsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators',
  component: GeneratorsPage,
});

const serviceRecommendationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators/service-recommendation',
  component: ServiceRecommendationPage,
});

const proposalGeneratorRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators/proposal-generator',
  component: ProposalGeneratorPage,
});

const pricingStrategyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators/pricing-strategy',
  component: PricingStrategyPage,
});

const closingScriptsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators/closing-scripts',
  component: ClosingScriptsPage,
});

const followUpMessagesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators/follow-up-messages',
  component: FollowUpMessagesPage,
});

const leadQualificationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/generators/lead-qualification',
  component: LeadQualificationPage,
});

// Settings
const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: SettingsPage,
});

const salesSystemConfigRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings/sales-system-config',
  component: SalesSystemConfigPage,
});

// Notifications
const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/notifications',
  component: NotificationsPage,
});

// Legal
const legalRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/legal',
  component: LegalPage,
});

// Invoice History
const invoiceHistoryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/invoices',
  component: InvoiceHistoryPage,
});

// WhatsApp Logs
const whatsAppLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/whatsapp-logs',
  component: WhatsAppLogsPage,
});

// Data Export
const dataExportRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/data-export',
  component: DataExportCenterPage,
});

// Webhook Logs
const webhookLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/webhook-logs',
  component: WebhookLogsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    adminDashboardRoute,
    managerDashboardRoute,
    clientDashboardRoute,
    leadsRoute,
    crmRoute,
    servicesRoute,
    serviceDetailRoute,
    serviceManagementRoute,
    cartRoute,
    checkoutRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
    projectsRoute,
    projectDetailRoute,
    clientOnboardingRoute,
    paymentsRoute,
    analyticsRoute,
    automationRoute,
    workflowsRoute,
    analyticsEngineRoute,
    contentCreatorRoute,
    generatorsRoute,
    serviceRecommendationRoute,
    proposalGeneratorRoute,
    pricingStrategyRoute,
    closingScriptsRoute,
    followUpMessagesRoute,
    leadQualificationRoute,
    settingsRoute,
    salesSystemConfigRoute,
    notificationsRoute,
    legalRoute,
    invoiceHistoryRoute,
    whatsAppLogsRoute,
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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
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
