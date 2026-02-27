import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  UserProfile,
  Service,
  ServiceSettings,
  PricingTier,
  IntegrationSettings,
  SalesSystemConfig,
  RecommendationOutput,
  ManagedService,
  ServicePackage,
  ServiceAddOn,
  PricingType,
} from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// Re-export managed service types for convenience
export type { ManagedService, ServicePackage, ServiceAddOn };
export { PricingType };

// ─── Local type definitions (not in backend interface) ───────────────────────

export interface Lead {
  id: bigint;
  name: string;
  email: string;
  phone?: string;
  channel: string;
  microNiche: string;
  status: string;
  assignedTo?: Principal;
  createdAt: bigint;
  createdBy: Principal;
  qualificationScore: bigint;
  budgetRange?: bigint;
  urgencyLevel?: bigint;
  companySize?: string;
  decisionMakerStatus?: boolean;
}

export interface CRMActivity {
  id: bigint;
  leadId?: bigint;
  projectId?: bigint;
  activityType: string;
  stage: string;
  notes: string;
  assignedTo?: Principal;
  dueDate?: bigint;
  createdBy: Principal;
  createdAt: bigint;
}

export interface Project {
  id: bigint;
  clientId: Principal;
  serviceId: bigint;
  status: string;
  startTime: bigint;
  onboardingData?: OnboardingData;
}

export interface OnboardingData {
  businessName: string;
  niche: string;
  goals: string;
  budget: bigint;
  timeline: string;
}

export interface Order {
  id: bigint;
  projectId: bigint;
  clientId: Principal;
  amount: bigint;
  paymentStatus: string;
  createdAt: bigint;
}

export interface Offer {
  id: bigint;
  name: string;
  discountPercent: bigint;
  isActive: boolean;
  offerType: string;
}

export interface LegalPage {
  id: bigint;
  title: string;
  content: string;
  lastUpdatedBy: Principal;
  lastUpdatedAt: bigint;
}

export interface Notification {
  id: bigint;
  userId: Principal;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: bigint;
}

export interface GeneratorLog {
  id: bigint;
  generatorType: string;
  userId: Principal;
  inputData: string;
  outputData: string;
  createdAt: bigint;
}

export interface PaymentLink {
  id: bigint;
  leadId: bigint;
  amount: bigint;
  status: string;
  createdAt: bigint;
  createdBy: Principal;
  paymentLinkUrl?: string;
  qrCodeDataUrl?: string;
}

export interface PaymentLog {
  orderId: string;
  paymentId: string;
  signature: string;
  amount: bigint;
  status: string;
  timestamp: bigint;
}

export interface Invoice {
  invoiceId: string;
  clientId: Principal;
  serviceBreakdown: string;
  gstAmount: bigint;
  totalPaid: bigint;
  createdAt: bigint;
}

export interface WhatsAppMessageLog {
  recipientPhone: string;
  messageType: string;
  deliveryStatus: string;
  sentAt: bigint;
}

export interface RazorpayConfig {
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
}

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

// Stub mutations for service CRUD — backend methods don't exist in current interface
// These are kept for component compatibility but will throw if called
export function useCreateService() {
  return useMutation({
    mutationFn: async (_params: unknown): Promise<void> => {
      throw new Error('createService is not available in the current backend');
    },
  });
}

export function useUpdateService() {
  return useMutation({
    mutationFn: async (_params: unknown): Promise<void> => {
      throw new Error('updateService is not available in the current backend');
    },
  });
}

export function useDeleteService() {
  return useMutation({
    mutationFn: async (_id: bigint): Promise<void> => {
      throw new Error('deleteService is not available in the current backend');
    },
  });
}

export function useUpdateServicePaymentInfo() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; paymentLinkUrl: string | null; qrCodeDataUrl: string | null }): Promise<void> => {
      throw new Error('updateServicePaymentInfo is not available in the current backend');
    },
  });
}

export function useUpdateServiceRazorpay() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; enabled: boolean; keyId: string | null; orderId: string | null }): Promise<void> => {
      throw new Error('updateServiceRazorpay is not available in the current backend');
    },
  });
}

// ─── Managed Services ─────────────────────────────────────────────────────────

export function useGetManagedServices() {
  const { actor, isFetching } = useActor();

  return useQuery<ManagedService[]>({
    queryKey: ['managed-services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getManagedServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateManagedService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: ManagedService) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createManagedService(service);
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-services'] });
      toast.success('Service created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create service');
    },
  });
}

export function useUpdateManagedService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, service }: { id: string; service: ManagedService }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateManagedService(id, service);
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-services'] });
      toast.success('Service updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update service');
    },
  });
}

export function useDeleteManagedService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteManagedService(id);
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error: Error) => {
      if (error.message?.includes('non-user created') || error.message?.includes('Cannot remove')) {
        toast.error('This service is part of the original catalog and cannot be deleted.');
      } else {
        toast.error(error.message || 'Failed to delete service');
      }
    },
  });
}

export function useDuplicateManagedService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.duplicateManagedService(id);
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-services'] });
      toast.success('Service duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate service');
    },
  });
}

export function useReorderManagedServices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.reorderManagedServices(orderedIds);
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-services'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder services');
    },
  });
}

// ─── Projects (stub — backend methods not in current interface) ───────────────

export function useGetProjectsByClient(_clientId: string) {
  return useQuery<Project[]>({
    queryKey: ['projects', _clientId],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetProject(_id: bigint) {
  return useQuery<Project | null>({
    queryKey: ['project', _id.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useGetAllProjects() {
  return useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateProject() {
  return useMutation({
    mutationFn: async (_params: { clientId: Principal; serviceId: bigint; onboardingData: OnboardingData | null }): Promise<bigint> => {
      throw new Error('createProject is not available in the current backend');
    },
  });
}

export function useUpdateProjectStatus() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; status: string }): Promise<void> => {
      throw new Error('updateProjectStatus is not available in the current backend');
    },
  });
}

// ─── Orders (stub) ────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetOrdersByClient(_clientId: Principal) {
  return useQuery<Order[]>({
    queryKey: ['orders', _clientId.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (_params: { projectId: bigint; amount: bigint }): Promise<bigint> => {
      throw new Error('createOrder is not available in the current backend');
    },
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; status: string }): Promise<void> => {
      throw new Error('updateOrderStatus is not available in the current backend');
    },
  });
}

// ─── Leads (stub) ─────────────────────────────────────────────────────────────

export function useGetAllLeads() {
  return useQuery<Lead[]>({
    queryKey: ['allLeads'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetMyLeads() {
  return useQuery<Lead[]>({
    queryKey: ['myLeads'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateLead() {
  return useMutation({
    mutationFn: async (_params: {
      name: string;
      email: string;
      phone: string | null;
      channel: string;
      microNiche: string;
      budgetRange: bigint | null;
      urgencyLevel: bigint | null;
      companySize: string | null;
      decisionMakerStatus: boolean | null;
    }): Promise<bigint> => {
      throw new Error('createLead is not available in the current backend');
    },
  });
}

export function useUpdateLead() {
  return useMutation({
    mutationFn: async (_params: {
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
    }): Promise<void> => {
      throw new Error('updateLead is not available in the current backend');
    },
  });
}

export function useDeleteLead() {
  return useMutation({
    mutationFn: async (_id: bigint): Promise<void> => {
      throw new Error('deleteLead is not available in the current backend');
    },
  });
}

export function useAssignLead() {
  return useMutation({
    mutationFn: async (_params: { leadId: bigint; userId: Principal }): Promise<void> => {
      throw new Error('assignLead is not available in the current backend');
    },
  });
}

// ─── CRM Activities (stub) ────────────────────────────────────────────────────

export function useGetAllCRMActivities() {
  return useQuery<CRMActivity[]>({
    queryKey: ['allCRMActivities'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetMyCRMActivities() {
  return useQuery<CRMActivity[]>({
    queryKey: ['myCRMActivities'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetCRMActivitiesByLead(_leadId: bigint) {
  return useQuery<CRMActivity[]>({
    queryKey: ['crmActivities', _leadId.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateCRMActivity() {
  return useMutation({
    mutationFn: async (_params: {
      leadId: bigint | null;
      projectId: bigint | null;
      activityType: string;
      stage: string;
      notes: string;
      assignedTo: Principal | null;
      dueDate: bigint | null;
    }): Promise<bigint> => {
      throw new Error('createCRMActivity is not available in the current backend');
    },
  });
}

// ─── Offers (stub) ────────────────────────────────────────────────────────────

export function useGetAllOffers() {
  return useQuery<Offer[]>({
    queryKey: ['allOffers'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateOffer() {
  return useMutation({
    mutationFn: async (_params: { name: string; discountPercent: bigint; isActive: boolean; offerType: string }): Promise<bigint> => {
      throw new Error('createOffer is not available in the current backend');
    },
  });
}

export function useUpdateOffer() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; name: string; discountPercent: bigint; isActive: boolean; offerType: string }): Promise<void> => {
      throw new Error('updateOffer is not available in the current backend');
    },
  });
}

export function useDeleteOffer() {
  return useMutation({
    mutationFn: async (_id: bigint): Promise<void> => {
      throw new Error('deleteOffer is not available in the current backend');
    },
  });
}

// ─── Legal Pages (stub) ───────────────────────────────────────────────────────

export function useGetAllLegalPages() {
  return useQuery<LegalPage[]>({
    queryKey: ['allLegalPages'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateLegalPage() {
  return useMutation({
    mutationFn: async (_params: { title: string; content: string }): Promise<bigint> => {
      throw new Error('createLegalPage is not available in the current backend');
    },
  });
}

export function useUpdateLegalPage() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; title: string; content: string }): Promise<void> => {
      throw new Error('updateLegalPage is not available in the current backend');
    },
  });
}

// ─── Notifications (stub) ─────────────────────────────────────────────────────

export function useGetMyNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['myNotifications'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: async (_id: bigint): Promise<void> => {
      throw new Error('markNotificationRead is not available in the current backend');
    },
  });
}

// Alias for components that use the old name
export const useMarkNotificationAsRead = useMarkNotificationRead;

// ─── Generator Logs (stub) ────────────────────────────────────────────────────

export function useGetMyGeneratorLogs() {
  return useQuery<GeneratorLog[]>({
    queryKey: ['myGeneratorLogs'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateGeneratorLog() {
  return useMutation({
    mutationFn: async (_params: { generatorType: string; inputData: string; outputData: string }): Promise<bigint> => {
      throw new Error('createGeneratorLog is not available in the current backend');
    },
  });
}

// ─── Payment Links (stub) ─────────────────────────────────────────────────────

export function useGetAllPaymentLinks() {
  return useQuery<PaymentLink[]>({
    queryKey: ['allPaymentLinks'],
    queryFn: async () => [],
    enabled: false,
  });
}

// Alias for components using old name
export const useGetPaymentLinks = useGetAllPaymentLinks;
export const useGetMyPaymentLinks = useGetAllPaymentLinks;

export function useCreatePaymentLink() {
  return useMutation({
    mutationFn: async (_params: { leadId: bigint; amount: bigint }): Promise<bigint> => {
      throw new Error('createPaymentLink is not available in the current backend');
    },
  });
}

export function useSetPaymentLinkUrl() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; url: string }): Promise<void> => {
      throw new Error('setPaymentLinkUrl is not available in the current backend');
    },
  });
}

export function useSetPaymentLinkQrCode() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; qrCodeDataUrl: string }): Promise<void> => {
      throw new Error('setPaymentLinkQrCode is not available in the current backend');
    },
  });
}

export function useUpdatePaymentLinkStatus() {
  return useMutation({
    mutationFn: async (_params: { id: bigint; status: string }): Promise<void> => {
      throw new Error('updatePaymentLinkStatus is not available in the current backend');
    },
  });
}

// ─── Payment Logs (stub) ──────────────────────────────────────────────────────

export function useGetAllPaymentLogs() {
  return useQuery<PaymentLog[]>({
    queryKey: ['allPaymentLogs'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreatePaymentLog() {
  return useMutation({
    mutationFn: async (_params: { orderId: string; paymentId: string; signature: string; amount: bigint; status: string }): Promise<void> => {
      throw new Error('createPaymentLog is not available in the current backend');
    },
  });
}

// ─── Invoices (stub) ──────────────────────────────────────────────────────────

export function useGetAllInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ['allInvoices'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateInvoice() {
  return useMutation({
    mutationFn: async (_params: { invoiceId: string; serviceBreakdown: string; gstAmount: bigint; totalPaid: bigint }): Promise<void> => {
      throw new Error('createInvoice is not available in the current backend');
    },
  });
}

// ─── WhatsApp Logs (stub) ─────────────────────────────────────────────────────

export function useGetAllWhatsAppLogs() {
  return useQuery<WhatsAppMessageLog[]>({
    queryKey: ['allWhatsAppLogs'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateWhatsAppLog() {
  return useMutation({
    mutationFn: async (_params: { recipientPhone: string; messageType: string; deliveryStatus: string }): Promise<void> => {
      throw new Error('createWhatsAppLog is not available in the current backend');
    },
  });
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function useGetAllRecommendations() {
  const { actor, isFetching } = useActor();

  return useQuery<RecommendationOutput[]>({
    queryKey: ['allRecommendations'],
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
      queryClient.invalidateQueries({ queryKey: ['allRecommendations'] });
    },
  });
}

// ─── Razorpay Config (stub) ───────────────────────────────────────────────────

export function useGetRazorpayConfig() {
  return useQuery<RazorpayConfig | null>({
    queryKey: ['razorpayConfig'],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useSaveRazorpayConfig() {
  return useMutation({
    mutationFn: async (_params: { apiKey: string; apiSecret: string; webhookSecret: string }): Promise<void> => {
      throw new Error('saveRazorpayConfig is not available in the current backend');
    },
  });
}

// Aliases for RazorpayConfigPanel compatibility
export const useIsRazorpayConfigured = useGetRazorpayConfig;
export const useSetRazorpayConfiguration = useSaveRazorpayConfig;

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

// ─── Bulk Lead Operations (stub) ──────────────────────────────────────────────

export function useBulkUpdateLeadStatus() {
  return useMutation({
    mutationFn: async (_params: { ids: bigint[]; status: string }): Promise<void> => {
      throw new Error('bulkUpdateLeadStatus is not available in the current backend');
    },
  });
}

export function useBulkDeleteLeads() {
  return useMutation({
    mutationFn: async (_ids: bigint[]): Promise<void> => {
      throw new Error('bulkDeleteLeads is not available in the current backend');
    },
  });
}
