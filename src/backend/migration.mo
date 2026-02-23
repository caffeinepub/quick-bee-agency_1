import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type UserProfile = {
    name : Text;
    email : Text;
    businessName : ?Text;
  };

  type PricingTier = {
    price : Nat;
    features : [Text];
  };

  type ServiceSettings = {
    isVisible : Bool;
    isFeatured : Bool;
    availability : Text;
    customMetadata : Text;
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    subcategory : Text;
    pricingBasic : PricingTier;
    pricingPro : PricingTier;
    pricingPremium : PricingTier;
    features : [Text];
    settings : ServiceSettings;
    paymentLinkUrl : ?Text;
    qrCodeDataUrl : ?Text;
    razorpayEnabled : Bool;
    razorpayKeyId : ?Text;
    razorpayOrderId : ?Text;
  };

  type Project = {
    id : Nat;
    clientId : Principal.Principal;
    serviceId : Nat;
    status : Text;
    startTime : Time.Time;
    onboardingData : ?OnboardingData;
  };

  type OnboardingData = {
    businessName : Text;
    niche : Text;
    goals : Text;
    budget : Nat;
    timeline : Text;
  };

  type Order = {
    id : Nat;
    projectId : Nat;
    clientId : Principal.Principal;
    amount : Nat;
    paymentStatus : Text;
    createdAt : Time.Time;
  };

  type Lead = {
    id : Nat;
    name : Text;
    email : Text;
    phone : ?Text;
    channel : Text;
    microNiche : Text;
    status : Text;
    assignedTo : ?Principal.Principal;
    createdAt : Time.Time;
    createdBy : Principal.Principal;
  };

  type CRMActivity = {
    id : Nat;
    leadId : ?Nat;
    projectId : ?Nat;
    activityType : Text;
    stage : Text;
    notes : Text;
    assignedTo : ?Principal.Principal;
    dueDate : ?Time.Time;
    createdBy : Principal.Principal;
    createdAt : Time.Time;
  };

  type Offer = {
    id : Nat;
    name : Text;
    discountPercent : Nat;
    isActive : Bool;
    offerType : Text;
  };

  type Coupon = {
    code : Text;
    discountPercent : Nat;
    isActive : Bool;
    expiresAt : ?Time.Time;
  };

  type LegalPage = {
    id : Nat;
    title : Text;
    content : Text;
    lastUpdatedBy : Principal.Principal;
    lastUpdatedAt : Time.Time;
  };

  type Notification = {
    id : Nat;
    userId : Principal.Principal;
    message : Text;
    notificationType : Text;
    isRead : Bool;
    createdAt : Time.Time;
  };

  type GeneratorLog = {
    id : Nat;
    generatorType : Text;
    userId : Principal.Principal;
    inputData : Text;
    outputData : Text;
    createdAt : Time.Time;
  };

  type RazorpayConfig = {
    apiKey : Text;
    apiSecret : Text;
    webhookSecret : Text;
  };

  type PaymentLink = {
    id : Nat;
    leadId : Nat;
    amount : Nat;
    status : Text;
    createdAt : Time.Time;
    createdBy : Principal.Principal;
    paymentLinkUrl : ?Text;
    qrCodeDataUrl : ?Text;
  };

  type OldService = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    subcategory : Text;
    pricingBasic : PricingTier;
    pricingPro : PricingTier;
    pricingPremium : PricingTier;
    features : [Text];
    settings : ServiceSettings;
    paymentLinkUrl : ?Text;
    qrCodeDataUrl : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    services : Map.Map<Nat, OldService>;
    projects : Map.Map<Nat, Project>;
    orders : Map.Map<Nat, Order>;
    leads : Map.Map<Nat, Lead>;
    crmActivities : Map.Map<Nat, CRMActivity>;
    offers : Map.Map<Nat, Offer>;
    coupons : Map.Map<Text, Coupon>;
    legalPages : Map.Map<Nat, LegalPage>;
    notifications : Map.Map<Nat, Notification>;
    generatorLogs : Map.Map<Nat, GeneratorLog>;
    paymentLinks : Map.Map<Nat, PaymentLink>;
    nextServiceId : Nat;
    nextProjectId : Nat;
    nextOrderId : Nat;
    nextLeadId : Nat;
    nextCRMActivityId : Nat;
    nextOfferId : Nat;
    nextLegalPageId : Nat;
    nextNotificationId : Nat;
    nextGeneratorLogId : Nat;
    nextPaymentLinkId : Nat;
    razorpayConfig : ?RazorpayConfig;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    services : Map.Map<Nat, Service>;
    projects : Map.Map<Nat, Project>;
    orders : Map.Map<Nat, Order>;
    leads : Map.Map<Nat, Lead>;
    crmActivities : Map.Map<Nat, CRMActivity>;
    offers : Map.Map<Nat, Offer>;
    coupons : Map.Map<Text, Coupon>;
    legalPages : Map.Map<Nat, LegalPage>;
    notifications : Map.Map<Nat, Notification>;
    generatorLogs : Map.Map<Nat, GeneratorLog>;
    paymentLinks : Map.Map<Nat, PaymentLink>;
    nextServiceId : Nat;
    nextProjectId : Nat;
    nextOrderId : Nat;
    nextLeadId : Nat;
    nextCRMActivityId : Nat;
    nextOfferId : Nat;
    nextLegalPageId : Nat;
    nextNotificationId : Nat;
    nextGeneratorLogId : Nat;
    nextPaymentLinkId : Nat;
    razorpayConfig : ?RazorpayConfig;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    let newServices = old.services.map<Nat, OldService, Service>(
      func(_id, oldService) {
        {
          oldService with
          razorpayEnabled = false;
          razorpayKeyId = null;
          razorpayOrderId = null;
        };
      }
    );

    {
      old with
      services = newServices;
    };
  };
};
