import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RecommendationOutput {
    projectedROI?: string;
    upsellSuggestion: string;
    budget?: bigint;
    recommendedService: string;
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
export interface IntegrationSettings {
    stripeEnabled: boolean;
    razorpayEnabled: boolean;
    automations: AutomationSettings;
    webhookUrl?: string;
}
export type ServicesResult = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: Array<ManagedService>;
};
export interface ManagedService {
    id: string;
    features: Array<string>;
    pricingType: PricingType;
    packages: Array<ServicePackage>;
    sortOrder: bigint;
    name: string;
    createdAt: bigint;
    customRequirementLabel: string;
    deliveryTime: string;
    updatedAt: bigint;
    imageUrl: string;
    shortDescription: string;
    quantityEnabled: boolean;
    addOns: Array<ServiceAddOn>;
    isVisible: boolean;
    category: string;
    detailedDescription: string;
    basePrice: bigint;
    isUserCreated: boolean;
}
export type UpdateServiceResult = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: ManagedService;
};
export interface SalesSystemConfig {
    description: string;
    systemSettings: string;
    enabled: boolean;
    apiEndpoint: string;
    apiKey: string;
    systemName: string;
}
export interface ServiceAddOn {
    name: string;
    description: string;
    price: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Token {
    principal: Principal;
    issuedAt: Time;
    expiry: Time;
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
export type ServiceCatalogResult = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: ManagedService;
};
export interface Service {
    id: bigint;
    qrCodeDataUrl?: string;
    features: Array<string>;
    pricingPro: PricingTier;
    subcategory: string;
    name: string;
    razorpayKeyId?: string;
    pricingBasic: PricingTier;
    description: string;
    settings: ServiceSettings;
    pricingPremium: PricingTier;
    razorpayOrderId?: string;
    razorpayEnabled: boolean;
    category: string;
    paymentLinkUrl?: string;
}
export type PasswordAuthResult = {
    __kind__: "ok";
    ok: Token;
} | {
    __kind__: "error";
    error: string;
};
export interface ServicePackage {
    features: Array<string>;
    name: string;
    deliveryTime: string;
    price: bigint;
}
export interface AutomationSettings {
    projectOnboarding: AutomationConfig;
    paymentConfirmation: AutomationConfig;
    sequenceBuilder: AutomationConfig;
    autoWhatsAppReplies: AutomationConfig;
    proposalAutoSend: AutomationConfig;
}
export interface AutomationConfig {
    enabled: boolean;
    config: string;
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
export interface UserProfile {
    name: string;
    businessName?: string;
    email: string;
}
export enum PricingType {
    Hourly = "Hourly",
    Custom = "Custom",
    Fixed = "Fixed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createManagedService(service: ManagedService): Promise<ServiceCatalogResult>;
    createRecommendation(recommendation: RecommendationOutput): Promise<bigint>;
    deleteManagedService(id: string): Promise<ServiceCatalogResult>;
    deleteRecommendation(id: bigint): Promise<void>;
    duplicateManagedService(id: string): Promise<ServiceCatalogResult>;
    getAllRecommendations(): Promise<Array<RecommendationOutput>>;
    getAllServices(): Promise<Array<Service>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIntegrationSettings(userId: Principal): Promise<IntegrationSettings | null>;
    getManagedService(id: string): Promise<ServiceCatalogResult>;
    getManagedServices(): Promise<Array<ManagedService>>;
    getManagedServicesByCategory(category: string): Promise<Array<ManagedService>>;
    getRecommendation(id: bigint): Promise<RecommendationOutput | null>;
    getSalesSystemConfig(userId: Principal): Promise<SalesSystemConfig | null>;
    getService(id: bigint): Promise<Service | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    login(email: string, password: string): Promise<PasswordAuthResult>;
    register(email: string, password: string, initialRole: UserRole): Promise<PasswordAuthResult>;
    reorderManagedServices(orderedIds: Array<string>): Promise<ServicesResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveIntegrationSettings(settings: IntegrationSettings): Promise<void>;
    saveSalesSystemConfig(config: SalesSystemConfig): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateManagedService(id: string, service: ManagedService): Promise<UpdateServiceResult>;
    updateRecommendation(id: bigint, recommendation: RecommendationOutput): Promise<void>;
}
