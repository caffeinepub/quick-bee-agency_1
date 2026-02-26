import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  UserProfile,
  Lead,
  CRMActivity,
  Service,
  ServiceSettings,
  PricingTier,
  Project,
  OnboardingData,
  Order,
  Offer,
  LegalPage,
  Notification,
  GeneratorLog,
  PaymentLink,
  PaymentLog,
  Invoice,
  WhatsAppMessageLog,
  RecommendationOutput,
  IntegrationSettings,
  SalesSystemConfig,
  AutomationSettings,
  AutomationConfig,
} from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Integration Settings ────────────────────────────────────────────────────

export function useGetIntegrationSettings(userId: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<IntegrationSettings | null>({
    queryKey: ['integrationSettings', userId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getIntegrationSettings(userId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveIntegrationSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: IntegrationSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveIntegrationSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationSettings'] });
    },
  });
}

// ─── Sales System Config ─────────────────────────────────────────────────────

export function useGetSalesSystemConfig(userId: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<SalesSystemConfig | null>({
    queryKey: ['salesSystemConfig', userId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSalesSystemConfig(userId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSalesSystemConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: SalesSystemConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveSalesSystemConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesSystemConfig'] });
    },
  });
}

// ─── Services ────────────────────────────────────────────────────────────────

export function useGetAllServices() {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetService(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Service | null>({
    queryKey: ['service', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getService(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      category: string;
      subcategory: string;
      pricingBasic: PricingTier;
      pricingPro: PricingTier;
      pricingPremium: PricingTier;
      features: string[];
      settings: ServiceSettings;
      paymentLinkUrl: string | null;
      qrCodeDataUrl: string | null;
      razorpayEnabled: boolean;
      razorpayKeyId: string | null;
      razorpayOrderId: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createService(
        params.name, params.description, params.category, params.subcategory,
        params.pricingBasic, params.pricingPro, params.pricingPremium,
        params.features, params.settings, params.paymentLinkUrl, params.qrCodeDataUrl,
        params.razorpayEnabled, params.razorpayKeyId, params.razorpayOrderId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      description: string;
      category: string;
      subcategory: string;
      pricingBasic: PricingTier;
      pricingPro: PricingTier;
      pricingPremium: PricingTier;
      features: string[];
      settings: ServiceSettings;
      paymentLinkUrl: string | null;
      qrCodeDataUrl: string | null;
      razorpayEnabled: boolean;
      razorpayKeyId: string | null;
      razorpayOrderId: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateService(
        params.id, params.name, params.description, params.category, params.subcategory,
        params.pricingBasic, params.pricingPro, params.pricingPremium,
        params.features, params.settings, params.paymentLinkUrl, params.qrCodeDataUrl,
        params.razorpayEnabled, params.razorpayKeyId, params.razorpayOrderId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateServicePaymentInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; paymentLinkUrl: string | null; qrCodeDataUrl: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServicePaymentInfo(params.id, params.paymentLinkUrl, params.qrCodeDataUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateServiceRazorpay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; enabled: boolean; keyId: string | null; orderId: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServiceRazorpay(params.id, params.enabled, params.keyId, params.orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// ─── Projects ────────────────────────────────────────────────────────────────

export function useGetProjectsByClient(clientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects', clientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjectsByClient(Principal.fromText(clientId));
    },
    enabled: !!actor && !isFetching && !!clientId,
  });
}

export function useGetProject(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Project | null>({
    queryKey: ['project', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { clientId: Principal; serviceId: bigint; onboardingData: OnboardingData | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(params.clientId, params.serviceId, params.onboardingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
    },
  });
}

export function useUpdateProjectStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProjectStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrdersByClient(clientId: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', clientId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByClient(clientId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { projectId: bigint; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(params.projectId, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export function useGetAllLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['allLeads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['myLeads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      email: string;
      phone: string | null;
      channel: string;
      microNiche: string;
      budgetRange: bigint | null;
      urgencyLevel: bigint | null;
      companySize: string | null;
      decisionMakerStatus: boolean | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLead(
        params.name, params.email, params.phone, params.channel, params.microNiche,
        params.budgetRange, params.urgencyLevel, params.companySize, params.decisionMakerStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      email: string;
      phone: string | null;
      channel: string;
      microNiche: string;
      status: string;
      budgetRange: bigint | null;
      urgencyLevel: bigint | null;
      companySize: string | null;
      decisionMakerStatus: boolean | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLead(
        params.id, params.name, params.email, params.phone, params.channel,
        params.microNiche, params.status, params.budgetRange, params.urgencyLevel,
        params.companySize, params.decisionMakerStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
    },
  });
}

export function useAssignLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { leadId: bigint; userId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignLead(params.leadId, params.userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
    },
  });
}

// ─── CRM Activities ───────────────────────────────────────────────────────────

export function useGetAllCRMActivities() {
  const { actor, isFetching } = useActor();

  return useQuery<CRMActivity[]>({
    queryKey: ['allCRMActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCRMActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyCRMActivities() {
  const { actor, isFetching } = useActor();

  return useQuery<CRMActivity[]>({
    queryKey: ['myCRMActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCRMActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCRMActivitiesByLead(leadId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<CRMActivity[]>({
    queryKey: ['crmActivities', leadId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCRMActivitiesByLead(leadId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCRMActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      leadId: bigint | null;
      projectId: bigint | null;
      activityType: string;
      stage: string;
      notes: string;
      assignedTo: Principal | null;
      dueDate: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCRMActivity(
        params.leadId, params.projectId, params.activityType,
        params.stage, params.notes, params.assignedTo, params.dueDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCRMActivities'] });
      queryClient.invalidateQueries({ queryKey: ['myCRMActivities'] });
    },
  });
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export function useGetAllOffers() {
  const { actor, isFetching } = useActor();

  return useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; discountPercent: bigint; offerType: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOffer(params.name, params.discountPercent, params.offerType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useToggleOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleOffer(params.id, params.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

// ─── Legal Pages ──────────────────────────────────────────────────────────────

export function useGetAllLegalPages() {
  const { actor, isFetching } = useActor();

  return useQuery<LegalPage[]>({
    queryKey: ['legalPages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLegalPages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLegalPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { title: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLegalPage(params.title, params.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalPages'] });
    },
  });
}

export function useUpdateLegalPage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; title: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLegalPage(params.id, params.title, params.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalPages'] });
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useGetMyNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['myNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    },
  });
}

export function useCreateNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: Principal; message: string; notificationType: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNotification(params.userId, params.message, params.notificationType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    },
  });
}

// ─── Generator Logs ───────────────────────────────────────────────────────────

export function useGetMyGeneratorLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<GeneratorLog[]>({
    queryKey: ['myGeneratorLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyGeneratorLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllGeneratorLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<GeneratorLog[]>({
    queryKey: ['allGeneratorLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGeneratorLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGeneratorLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { generatorType: string; inputData: string; outputData: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGeneratorLog(params.generatorType, params.inputData, params.outputData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGeneratorLogs'] });
    },
  });
}

// ─── Payment Links ────────────────────────────────────────────────────────────

export function useGetPaymentLinks() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentLink[]>({
    queryKey: ['paymentLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyPaymentLinks() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentLink[]>({
    queryKey: ['myPaymentLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPaymentLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePaymentLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { leadId: bigint; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPaymentLink(params.leadId, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
    },
  });
}

export function useUpdatePaymentLinkStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentLinkStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
    },
  });
}

export function useSetPaymentLinkUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; url: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPaymentLinkUrl(params.id, params.url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
    },
  });
}

export function useSetPaymentLinkQrCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; qrCodeDataUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPaymentLinkQrCode(params.id, params.qrCodeDataUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
    },
  });
}

// ─── Payment Logs ─────────────────────────────────────────────────────────────

export function useGetAllPaymentLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentLog[]>({
    queryKey: ['allPaymentLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPaymentLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavePaymentLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: PaymentLog) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePaymentLog(log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPaymentLogs'] });
    },
  });
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export function useGetAllInvoices() {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['allInvoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyInvoices() {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['myInvoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveInvoice(invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['myInvoices'] });
    },
  });
}

// ─── WhatsApp Logs ────────────────────────────────────────────────────────────

export function useGetAllWhatsAppLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<WhatsAppMessageLog[]>({
    queryKey: ['allWhatsAppLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWhatsAppLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveWhatsAppLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: WhatsAppMessageLog) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveWhatsAppLog(log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWhatsAppLogs'] });
    },
  });
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function useGetAllRecommendations() {
  const { actor, isFetching } = useActor();

  return useQuery<RecommendationOutput[]>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecommendations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRecommendation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendation: RecommendationOutput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRecommendation(recommendation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

// ─── Razorpay ─────────────────────────────────────────────────────────────────

export function useIsRazorpayConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isRazorpayConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isRazorpayConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetRazorpayConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { apiKey: string; apiSecret: string; webhookSecret: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRazorpayConfiguration(params.apiKey, params.apiSecret, params.webhookSecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isRazorpayConfigured'] });
    },
  });
}
