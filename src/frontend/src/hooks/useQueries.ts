import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Service, Project, Order, Lead, CRMActivity, Offer, Coupon, LegalPage, Notification, GeneratorLog, OnboardingData, UserRole, PaymentLink } from '../backend';
import { Principal } from '@dfinity/principal';

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

export function useAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; priceBasic: bigint; pricePro: bigint; pricePremium: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addService(data.name, data.description, data.priceBasic, data.pricePro, data.pricePremium);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; description: string; priceBasic: bigint; pricePro: bigint; pricePremium: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateService(data.id, data.name, data.description, data.priceBasic, data.pricePro, data.pricePremium);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });
}

export function useGetProjectsByClient(clientId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      return actor.getProjectsByClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null,
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

export function useGetOrdersByClient(clientId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      return actor.getOrdersByClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null,
  });
}

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
      await actor.markNotificationAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });
}
