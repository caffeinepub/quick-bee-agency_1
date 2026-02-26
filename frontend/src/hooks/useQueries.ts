import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Service,
  Lead,
  Order,
  Project,
  CRMActivity,
  Notification,
  PaymentLink,
  LegalPage,
  IntegrationSettings,
  SalesSystemConfig,
  UserProfile,
  PricingTier,
  ServiceSettings,
  OnboardingData,
} from '../backend';

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

// ─── User Role ───────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
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

export function useGetService(id: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Service | null>({
    queryKey: ['service', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) throw new Error('Actor or id not available');
      return actor.getService(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
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
      paymentLinkUrl?: string | null;
      qrCodeDataUrl?: string | null;
      razorpayEnabled?: boolean;
      razorpayKeyId?: string | null;
      razorpayOrderId?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createService(
        params.name,
        params.description,
        params.category,
        params.subcategory,
        params.pricingBasic,
        params.pricingPro,
        params.pricingPremium,
        params.features,
        params.settings,
        params.paymentLinkUrl ?? null,
        params.qrCodeDataUrl ?? null,
        params.razorpayEnabled ?? false,
        params.razorpayKeyId ?? null,
        params.razorpayOrderId ?? null,
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
      paymentLinkUrl?: string | null;
      qrCodeDataUrl?: string | null;
      razorpayEnabled?: boolean;
      razorpayKeyId?: string | null;
      razorpayOrderId?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateService(
        params.id,
        params.name,
        params.description,
        params.category,
        params.subcategory,
        params.pricingBasic,
        params.pricingPro,
        params.pricingPremium,
        params.features,
        params.settings,
        params.paymentLinkUrl ?? null,
        params.qrCodeDataUrl ?? null,
        params.razorpayEnabled ?? false,
        params.razorpayKeyId ?? null,
        params.razorpayOrderId ?? null,
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
    mutationFn: async (params: { id: bigint; paymentLinkUrl?: string | null; qrCodeDataUrl?: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServicePaymentInfo(params.id, params.paymentLinkUrl ?? null, params.qrCodeDataUrl ?? null);
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
    mutationFn: async (params: { id: bigint; enabled: boolean; keyId?: string | null; orderId?: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServiceRazorpay(params.id, params.enabled, params.keyId ?? null, params.orderId ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export function useGetAllLeads() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLeads();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      email: string;
      phone?: string | null;
      channel: string;
      microNiche: string;
      budgetRange?: number | null;
      urgencyLevel?: number | null;
      companySize?: string | null;
      decisionMakerStatus?: boolean | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLead(
        params.name,
        params.email,
        params.phone ?? null,
        params.channel,
        params.microNiche,
        params.budgetRange != null ? BigInt(params.budgetRange) : null,
        params.urgencyLevel != null ? BigInt(params.urgencyLevel) : null,
        params.companySize ?? null,
        params.decisionMakerStatus ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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
      phone?: string | null;
      channel: string;
      microNiche: string;
      status: string;
      budgetRange?: number | null;
      urgencyLevel?: number | null;
      companySize?: string | null;
      decisionMakerStatus?: boolean | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLead(
        params.id,
        params.name,
        params.email,
        params.phone ?? null,
        params.channel,
        params.microNiche,
        params.status,
        params.budgetRange != null ? BigInt(params.budgetRange) : null,
        params.urgencyLevel != null ? BigInt(params.urgencyLevel) : null,
        params.companySize ?? null,
        params.decisionMakerStatus ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function useGetProjectsByClient(clientId: string | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Project[]>({
    queryKey: ['projects', clientId],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getProjectsByClient(Principal.fromText(clientId));
    },
    enabled: !!actor && !isFetching && !!identity && !!clientId,
  });
}

export function useGetAllProjects() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetProject(id: bigint | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Project | null>({
    queryKey: ['project', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) throw new Error('Actor or id not available');
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching && !!identity && id !== undefined,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      clientId: string;
      serviceId: bigint;
      onboardingData?: OnboardingData | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.createProject(
        Principal.fromText(params.clientId),
        params.serviceId,
        params.onboardingData ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
    },
  });
}

// ─── CRM Activities ───────────────────────────────────────────────────────────

export function useGetAllCRMActivities() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CRMActivity[]>({
    queryKey: ['crmActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCRMActivities();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useGetMyNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching && !!identity,
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── Payment Links ────────────────────────────────────────────────────────────

export function useGetPaymentLinks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PaymentLink[]>({
    queryKey: ['paymentLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentLinks();
    },
    enabled: !!actor && !isFetching && !!identity,
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
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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

// ─── Integration Settings ─────────────────────────────────────────────────────

export function useGetIntegrationSettings(userId?: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<IntegrationSettings | null>({
    queryKey: ['integrationSettings', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getIntegrationSettings(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!identity && !!userId,
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

// ─── Sales System Config ──────────────────────────────────────────────────────

export function useGetSalesSystemConfig(userId?: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SalesSystemConfig | null>({
    queryKey: ['salesSystemConfig', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getSalesSystemConfig(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!identity && !!userId,
  });
}

export function useUpdateSalesSystemConfig() {
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

// ─── Sales System Integrations (legacy compatibility) ─────────────────────────

export function useGetSalesSystemIntegrations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<IntegrationSettings | null>({
    queryKey: ['salesSystemIntegrations'],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const principal = identity.getPrincipal().toString();
      const { Principal } = await import('@dfinity/principal');
      return actor.getIntegrationSettings(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateSalesSystemIntegration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: IntegrationSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveIntegrationSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesSystemIntegrations'] });
      queryClient.invalidateQueries({ queryKey: ['integrationSettings'] });
    },
  });
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Razorpay ─────────────────────────────────────────────────────────────────

export function useIsRazorpayConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['razorpayConfigured'],
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
      queryClient.invalidateQueries({ queryKey: ['razorpayConfigured'] });
    },
  });
}

// ─── Generator Logs ───────────────────────────────────────────────────────────

export function useCreateGeneratorLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { generatorType: string; inputData: string; outputData: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGeneratorLog(params.generatorType, params.inputData, params.outputData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generatorLogs'] });
    },
  });
}

// ─── Service Recommendations ──────────────────────────────────────────────────

export interface ServiceRecommendation {
  name: string;
  description: string;
  suggestedTier: 'Basic' | 'Pro' | 'Premium';
  matchScore: number;
  reason: string;
}

export interface RecommendationFormData {
  businessType: string;
  budgetRange: number;
  goals: string;
}

function generateRuleBasedRecommendations(
  formData: RecommendationFormData,
  services: Service[],
): ServiceRecommendation[] {
  const { businessType, budgetRange, goals } = formData;
  const goalsLower = goals.toLowerCase();
  const businessLower = businessType.toLowerCase();

  const scored = services.slice(0, 10).map((service) => {
    let score = 50;
    const nameLower = service.name.toLowerCase();
    const descLower = service.description.toLowerCase();

    if (goalsLower.includes('social') && (nameLower.includes('social') || descLower.includes('social'))) score += 20;
    if (goalsLower.includes('seo') && (nameLower.includes('seo') || descLower.includes('seo'))) score += 20;
    if (goalsLower.includes('content') && (nameLower.includes('content') || descLower.includes('content'))) score += 15;
    if (goalsLower.includes('lead') && (nameLower.includes('lead') || descLower.includes('lead'))) score += 15;
    if (businessLower.includes('ecommerce') && (nameLower.includes('ecommerce') || descLower.includes('ecommerce'))) score += 10;
    if (businessLower.includes('saas') && (nameLower.includes('saas') || descLower.includes('saas'))) score += 10;

    let tier: 'Basic' | 'Pro' | 'Premium' = 'Basic';
    const basicPrice = Number(service.pricingBasic.price);
    const proPrice = Number(service.pricingPro.price);
    const premiumPrice = Number(service.pricingPremium.price);

    if (budgetRange >= premiumPrice) tier = 'Premium';
    else if (budgetRange >= proPrice) tier = 'Pro';
    else if (budgetRange >= basicPrice) tier = 'Basic';

    return {
      name: service.name,
      description: service.description,
      suggestedTier: tier,
      matchScore: Math.min(score, 100),
      reason: `Based on your ${businessType} business and ${budgetRange > 5000 ? 'high' : budgetRange > 1000 ? 'medium' : 'starter'} budget`,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}

export function useGetServiceRecommendations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: RecommendationFormData): Promise<ServiceRecommendation[]> => {
      let apiEndpoint = '';
      let apiKey = '';

      try {
        const cachedConfig = queryClient.getQueryData<SalesSystemConfig | null>(['salesSystemConfig']);
        if (cachedConfig?.apiEndpoint && cachedConfig.apiEndpoint !== 'YOUR_API_KEY') {
          apiEndpoint = cachedConfig.apiEndpoint;
          apiKey = cachedConfig.apiKey;
        }
      } catch {
        // ignore
      }

      if (apiEndpoint && apiEndpoint !== 'YOUR_API_KEY') {
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) return data as ServiceRecommendation[];
          }
        } catch {
          // Fall through to rule-based
        }
      }

      let services: Service[] = [];
      if (actor) {
        try {
          services = await actor.getAllServices();
        } catch {
          // ignore
        }
      }

      return generateRuleBasedRecommendations(formData, services);
    },
  });
}

// ─── Proposal Generator ───────────────────────────────────────────────────────

export interface ProposalFormData {
  clientName: string;
  clientBusinessType: string;
  selectedServices: string[];
  scope: string;
  budget: number;
}

export interface GeneratedProposal {
  title: string;
  clientName: string;
  date: string;
  executiveSummary: string;
  servicesIncluded: Array<{ name: string; description: string; tier: string }>;
  scope: string;
  investment: string;
  timeline: string;
  nextSteps: string;
}

function generateTemplateProposal(formData: ProposalFormData): GeneratedProposal {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return {
    title: `Digital Growth Proposal for ${formData.clientName}`,
    clientName: formData.clientName,
    date: today,
    executiveSummary: `We are pleased to present this proposal to ${formData.clientName}, a ${formData.clientBusinessType} business looking to accelerate growth. Our team has carefully analyzed your requirements and crafted a tailored solution designed to deliver measurable results and exceptional ROI.`,
    servicesIncluded: formData.selectedServices.map((svc) => ({
      name: svc,
      description: `Professional ${svc} services tailored to your business needs`,
      tier: formData.budget > 10000 ? 'Premium' : formData.budget > 3000 ? 'Pro' : 'Basic',
    })),
    scope: formData.scope || 'Full-service implementation including strategy, execution, and ongoing optimization.',
    investment: `Total Investment: $${formData.budget.toLocaleString()} — This covers all services outlined above with dedicated account management and monthly reporting.`,
    timeline: '4–8 weeks for full onboarding and initial results, with ongoing monthly optimization cycles.',
    nextSteps: `1. Review and approve this proposal\n2. Sign the service agreement\n3. Complete onboarding questionnaire\n4. Kickoff call scheduled within 48 hours of signing`,
  };
}

export function useGenerateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ProposalFormData): Promise<GeneratedProposal> => {
      let apiEndpoint = '';
      let apiKey = '';

      try {
        const cachedConfig = queryClient.getQueryData<SalesSystemConfig | null>(['salesSystemConfig']);
        if (cachedConfig?.apiEndpoint && cachedConfig.apiEndpoint !== 'YOUR_API_KEY') {
          apiEndpoint = cachedConfig.apiEndpoint;
          apiKey = cachedConfig.apiKey;
        }
      } catch {
        // ignore
      }

      if (apiEndpoint && apiEndpoint !== 'YOUR_API_KEY') {
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            const data = await response.json();
            if (data && typeof data === 'object' && data.title) {
              return data as GeneratedProposal;
            }
          }
        } catch {
          // Fall through to template
        }
      }

      return generateTemplateProposal(formData);
    },
  });
}
