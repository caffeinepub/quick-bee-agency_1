import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import { UserRole } from '../backend';
import type {
  UserProfile,
  Service,
  Project,
  Order,
  Lead,
  CRMActivity,
  Offer,
  Coupon,
  LegalPage,
  Notification,
  GeneratorLog,
  PaymentLink,
  PricingTier,
  ServiceSettings,
  OnboardingData,
  Time,
  StripeConfiguration,
} from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
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
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin Check
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Service Queries
export function useGetAllServices(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetService(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Service | null>({
    queryKey: ['service', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
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
        params.razorpayOrderId ?? null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create service: ${error.message}`);
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
        params.razorpayOrderId ?? null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update service: ${error.message}`);
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
      toast.success('Service deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete service: ${error.message}`);
    },
  });
}

export function useUpdateServicePaymentInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      paymentLinkUrl: string | null;
      qrCodeDataUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServicePaymentInfo(
        params.id,
        params.paymentLinkUrl,
        params.qrCodeDataUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Payment information updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment information: ${error.message}`);
    },
  });
}

export function useUpdateServiceRazorpay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      enabled: boolean;
      keyId: string | null;
      orderId: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServiceRazorpay(
        params.id,
        params.enabled,
        params.keyId,
        params.orderId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Razorpay settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update Razorpay settings: ${error.message}`);
    },
  });
}

export function useGetServiceRazorpayConfig(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<[boolean, string | null, string | null]>({
    queryKey: ['serviceRazorpayConfig', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getServiceRazorpayConfig(id);
    },
    enabled: !!actor && !isFetching,
  });
}

// Razorpay Configuration
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
      toast.success('Razorpay configured successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to configure Razorpay: ${error.message}`);
    },
  });
}

// Stripe Configuration
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
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
      toast.success('Stripe configured successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to configure Stripe: ${error.message}`);
    },
  });
}

// Project Queries
export function useGetProjectsByClient(clientId: Principal | null, enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects', clientId?.toString() || 'null'],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      return actor.getProjectsByClient(clientId);
    },
    enabled: !!actor && !isFetching && !!clientId && enabled,
  });
}

export function useGetProject(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Project | null>({
    queryKey: ['project', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProjects(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      clientId: Principal;
      serviceId: bigint;
      onboardingData: OnboardingData | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(params.clientId, params.serviceId, params.onboardingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
}

// Order Queries
export function useGetAllOrders(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

// Lead Queries
export function useGetAllLeads(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLeads();
    },
    enabled: !!actor && !isFetching && enabled,
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
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLead(
        params.name,
        params.email,
        params.phone,
        params.channel,
        params.microNiche
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create lead: ${error.message}`);
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
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLead(
        params.id,
        params.name,
        params.email,
        params.phone,
        params.channel,
        params.microNiche,
        params.status
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update lead: ${error.message}`);
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
      toast.success('Lead deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete lead: ${error.message}`);
    },
  });
}

// CRM Activity Queries
export function useGetAllCRMActivities(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<CRMActivity[]>({
    queryKey: ['crmActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCRMActivities();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

// Legal Pages Queries
export function useGetAllLegalPages(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<LegalPage[]>({
    queryKey: ['legalPages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLegalPages();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

// Notification Queries
export function useGetMyNotifications(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching && enabled,
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
    onError: (error: Error) => {
      toast.error(`Failed to mark notification as read: ${error.message}`);
    },
  });
}

// Payment Link Queries
export function useGetPaymentLinks(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentLink[]>({
    queryKey: ['paymentLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentLinks();
    },
    enabled: !!actor && !isFetching && enabled,
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
      toast.success('Payment link created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payment link: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Failed to update payment link URL: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Failed to update payment link QR code: ${error.message}`);
    },
  });
}
