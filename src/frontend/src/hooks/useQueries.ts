import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Service, Project, Order, Lead, CRMActivity, Offer, Coupon, LegalPage, Notification, GeneratorLog, OnboardingData, UserRole, PaymentLink, PricingTier, ServiceSettings } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// Critical queries - always enabled when actor is ready
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

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    }
  });
}

// Lazy-loaded queries - only fetch when explicitly enabled
export function useGetAllServices(enabled: boolean = false) {
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

export function useGetService(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Service | null>({
    queryKey: ['service', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getService(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      description: string; 
      category: string;
      subcategory: string;
      pricingBasic: PricingTier;
      pricingPro: PricingTier;
      pricingPremium: PricingTier;
      features: string[];
      settings: ServiceSettings;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createService(
        data.name, 
        data.description, 
        data.category,
        data.subcategory,
        data.pricingBasic,
        data.pricingPro,
        data.pricingPremium,
        data.features,
        data.settings,
        null,
        null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create service: ${error.message}`);
    }
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
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
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateService(
        data.id, 
        data.name, 
        data.description, 
        data.category,
        data.subcategory,
        data.pricingBasic,
        data.pricingPro,
        data.pricingPremium,
        data.features,
        data.settings,
        data.paymentLinkUrl !== undefined ? data.paymentLinkUrl : null,
        data.qrCodeDataUrl !== undefined ? data.qrCodeDataUrl : null
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.id.toString()] });
      toast.success('Service updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update service: ${error.message}`);
    }
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete service: ${error.message}`);
    }
  });
}

export function useUpdateServicePaymentInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      id: bigint; 
      paymentLinkUrl: string | null; 
      qrCodeDataUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateServicePaymentInfo(data.id, data.paymentLinkUrl, data.qrCodeDataUrl);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.id.toString()] });
      toast.success('Payment information updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update payment information: ${error.message}`);
    }
  });
}

export function useGetProjectsByClient(clientId: Principal | null, enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      return actor.getProjectsByClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null && enabled,
  });
}

export function useGetProject(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Project | null>({
    queryKey: ['project', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { clientId: Principal; serviceId: bigint; onboardingData?: OnboardingData }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(data.clientId, data.serviceId, data.onboardingData || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useGetOrdersByClient(clientId: Principal | null, enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      return actor.getOrdersByClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null && enabled,
  });
}

export function useGetAllOrders(enabled: boolean = false) {
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

export function useGetAllLeads(enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['allLeads'],
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
    mutationFn: async (data: { name: string; email: string; phone?: string; channel: string; microNiche: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLead(data.name, data.email, data.phone || null, data.channel, data.microNiche);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
    }
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; email: string; phone?: string; channel: string; microNiche: string; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateLead(data.id, data.name, data.email, data.phone || null, data.channel, data.microNiche, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
    }
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
    }
  });
}

export function useBulkDeleteLeads() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: bigint[]) => {
      if (!actor) throw new Error('Actor not available');
      const results = await Promise.allSettled(
        ids.map(id => actor.deleteLead(id))
      );
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      return { successCount, failureCount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
    }
  });
}

export function useGetAllCRMActivities(enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<CRMActivity[]>({
    queryKey: ['allCRMActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCRMActivities();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useCreateCRMActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { leadId?: bigint; projectId?: bigint; activityType: string; stage: string; notes: string; assignedTo?: Principal; dueDate?: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCRMActivity(
        data.leadId || null,
        data.projectId || null,
        data.activityType,
        data.stage,
        data.notes,
        data.assignedTo || null,
        data.dueDate || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCRMActivities'] });
    }
  });
}

export function useGetAllOffers(enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOffers();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetCoupon(code: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Coupon | null>({
    queryKey: ['coupon', code],
    queryFn: async () => {
      if (!actor || !code) return null;
      return actor.getCoupon(code);
    },
    enabled: !!actor && !isFetching && code !== null,
  });
}

export function useGetAllLegalPages(enabled: boolean = false) {
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

export function useGetMyNotifications(enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['myNotifications'],
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
      await actor.markNotificationAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });
}

export function useGetMyGeneratorLogs(enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<GeneratorLog[]>({
    queryKey: ['myGeneratorLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyGeneratorLogs();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

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
    mutationFn: async (data: { apiKey: string; apiSecret: string; webhookSecret: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setRazorpayConfiguration(data.apiKey, data.apiSecret, data.webhookSecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isRazorpayConfigured'] });
    }
  });
}

export function useGetPaymentLinks(enabled: boolean = false) {
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

export function useGetMyPaymentLinks(enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentLink[]>({
    queryKey: ['myPaymentLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPaymentLinks();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useCreatePaymentLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { leadId: bigint; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPaymentLink(data.leadId, data.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
    }
  });
}

export function useUpdatePaymentLinkStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePaymentLinkStatus(data.id, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });
}

export function useUpdatePaymentLinkUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; url: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setPaymentLinkUrl(data.id, data.url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
      toast.success('Payment link URL updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update payment link URL: ${error.message}`);
    }
  });
}

export function useUpdatePaymentLinkQRCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; qrCodeDataUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setPaymentLinkQrCode(data.id, data.qrCodeDataUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentLinks'] });
      toast.success('QR code updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update QR code: ${error.message}`);
    }
  });
}
