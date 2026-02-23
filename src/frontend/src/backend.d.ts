import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OnboardingData {
    businessName: string;
    goals: string;
    niche: string;
    budget: bigint;
    timeline: string;
}
export interface PricingTier {
    features: Array<string>;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Coupon {
    expiresAt?: Time;
    code: string;
    discountPercent: bigint;
    isActive: boolean;
}
export interface Service {
    id: bigint;
    qrCodeDataUrl?: string;
    features: Array<string>;
    pricingPro: PricingTier;
    subcategory: string;
    name: string;
    pricingBasic: PricingTier;
    description: string;
    settings: ServiceSettings;
    pricingPremium: PricingTier;
    category: string;
    paymentLinkUrl?: string;
}
export interface Order {
    id: bigint;
    clientId: Principal;
    paymentStatus: string;
    createdAt: Time;
    projectId: bigint;
    amount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface LegalPage {
    id: bigint;
    title: string;
    content: string;
    lastUpdatedAt: Time;
    lastUpdatedBy: Principal;
}
export interface Lead {
    id: bigint;
    status: string;
    assignedTo?: Principal;
    name: string;
    createdAt: Time;
    createdBy: Principal;
    email: string;
    microNiche: string;
    phone?: string;
    channel: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface ServiceSettings {
    customMetadata: string;
    availability: string;
    isFeatured: boolean;
    isVisible: boolean;
}
export interface CRMActivity {
    id: bigint;
    activityType: string;
    assignedTo?: Principal;
    createdAt: Time;
    createdBy: Principal;
    dueDate?: Time;
    stage: string;
    projectId?: bigint;
    leadId?: bigint;
    notes: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Offer {
    id: bigint;
    offerType: string;
    name: string;
    discountPercent: bigint;
    isActive: boolean;
}
export interface Notification {
    id: bigint;
    userId: Principal;
    notificationType: string;
    createdAt: Time;
    isRead: boolean;
    message: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Project {
    id: bigint;
    startTime: Time;
    status: string;
    clientId: Principal;
    onboardingData?: OnboardingData;
    serviceId: bigint;
}
export interface PaymentLink {
    id: bigint;
    qrCodeDataUrl?: string;
    status: string;
    createdAt: Time;
    createdBy: Principal;
    leadId: bigint;
    amount: bigint;
    paymentLinkUrl?: string;
}
export interface UserProfile {
    name: string;
    businessName?: string;
    email: string;
}
export interface GeneratorLog {
    id: bigint;
    inputData: string;
    userId: Principal;
    createdAt: Time;
    outputData: string;
    generatorType: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignLead(leadId: bigint, userId: Principal): Promise<void>;
    createCRMActivity(leadId: bigint | null, projectId: bigint | null, activityType: string, stage: string, notes: string, assignedTo: Principal | null, dueDate: Time | null): Promise<bigint>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCoupon(code: string, discountPercent: bigint, expiresAt: Time | null): Promise<void>;
    createGeneratorLog(generatorType: string, inputData: string, outputData: string): Promise<bigint>;
    createLead(name: string, email: string, phone: string | null, channel: string, microNiche: string): Promise<bigint>;
    createLegalPage(title: string, content: string): Promise<bigint>;
    createNotification(userId: Principal, message: string, notificationType: string): Promise<bigint>;
    createOffer(name: string, discountPercent: bigint, offerType: string): Promise<bigint>;
    createOrder(projectId: bigint, amount: bigint): Promise<bigint>;
    createPaymentLink(leadId: bigint, amount: bigint): Promise<bigint>;
    createProject(clientId: Principal, serviceId: bigint, onboardingData: OnboardingData | null): Promise<bigint>;
    createService(name: string, description: string, category: string, subcategory: string, pricingBasic: PricingTier, pricingPro: PricingTier, pricingPremium: PricingTier, features: Array<string>, settings: ServiceSettings, paymentLinkUrl: string | null, qrCodeDataUrl: string | null): Promise<bigint>;
    deleteLead(id: bigint): Promise<void>;
    deleteService(id: bigint): Promise<void>;
    getAllCRMActivities(): Promise<Array<CRMActivity>>;
    getAllGeneratorLogs(): Promise<Array<GeneratorLog>>;
    getAllLeads(): Promise<Array<Lead>>;
    getAllLegalPages(): Promise<Array<LegalPage>>;
    getAllOffers(): Promise<Array<Offer>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProjects(): Promise<Array<Project>>;
    getAllServices(): Promise<Array<Service>>;
    getCRMActivitiesByLead(leadId: bigint): Promise<Array<CRMActivity>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoupon(code: string): Promise<Coupon | null>;
    getLegalPage(id: bigint): Promise<LegalPage | null>;
    getMyCRMActivities(): Promise<Array<CRMActivity>>;
    getMyGeneratorLogs(): Promise<Array<GeneratorLog>>;
    getMyLeads(): Promise<Array<Lead>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyPaymentLinks(): Promise<Array<PaymentLink>>;
    getOrdersByClient(clientId: Principal): Promise<Array<Order>>;
    getOrdersByProject(projectId: bigint): Promise<Array<Order>>;
    getPaymentLinks(): Promise<Array<PaymentLink>>;
    getProject(id: bigint): Promise<Project | null>;
    getProjectsByClient(clientId: Principal): Promise<Array<Project>>;
    getService(id: bigint): Promise<Service | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isRazorpayConfigured(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markNotificationAsRead(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPaymentLinkQrCode(id: bigint, qrCodeDataUrl: string): Promise<void>;
    setPaymentLinkUrl(id: bigint, url: string): Promise<void>;
    setRazorpayConfiguration(apiKey: string, apiSecret: string, webhookSecret: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    toggleCoupon(code: string, isActive: boolean): Promise<void>;
    toggleOffer(id: bigint, isActive: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCRMActivity(id: bigint, activityType: string, stage: string, notes: string, dueDate: Time | null): Promise<void>;
    updateLead(id: bigint, name: string, email: string, phone: string | null, channel: string, microNiche: string, status: string): Promise<void>;
    updateLegalPage(id: bigint, title: string, content: string): Promise<void>;
    updateOrderStatus(id: bigint, status: string): Promise<void>;
    updatePaymentLinkStatus(id: bigint, status: string): Promise<void>;
    updateProjectStatus(id: bigint, status: string): Promise<void>;
    updateService(id: bigint, name: string, description: string, category: string, subcategory: string, pricingBasic: PricingTier, pricingPro: PricingTier, pricingPremium: PricingTier, features: Array<string>, settings: ServiceSettings, paymentLinkUrl: string | null, qrCodeDataUrl: string | null): Promise<void>;
    updateServicePaymentInfo(id: bigint, paymentLinkUrl: string | null, qrCodeDataUrl: string | null): Promise<void>;
}
