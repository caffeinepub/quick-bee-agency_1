import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Stripe "stripe/stripe";

module {
  type UserProfile = {
    name : Text;
    email : Text;
    businessName : ?Text;
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    priceBasic : Nat;
    pricePro : Nat;
    pricePremium : Nat;
  };

  type Project = {
    id : Nat;
    clientId : Principal;
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
    clientId : Principal;
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
    assignedTo : ?Principal;
    createdAt : Time.Time;
    createdBy : Principal;
  };

  type CRMActivity = {
    id : Nat;
    leadId : ?Nat;
    projectId : ?Nat;
    activityType : Text;
    stage : Text;
    notes : Text;
    assignedTo : ?Principal;
    dueDate : ?Time.Time;
    createdBy : Principal;
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
    lastUpdatedBy : Principal;
    lastUpdatedAt : Time.Time;
  };

  type Notification = {
    id : Nat;
    userId : Principal;
    message : Text;
    notificationType : Text;
    isRead : Bool;
    createdAt : Time.Time;
  };

  type GeneratorLog = {
    id : Nat;
    generatorType : Text;
    userId : Principal;
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
    createdBy : Principal;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
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
    nextServiceId : Nat;
    nextProjectId : Nat;
    nextOrderId : Nat;
    nextLeadId : Nat;
    nextCRMActivityId : Nat;
    nextOfferId : Nat;
    nextLegalPageId : Nat;
    nextNotificationId : Nat;
    nextGeneratorLogId : Nat;
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
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
    stripeConfig : ?Stripe.StripeConfiguration;
    razorpayConfig : ?RazorpayConfig;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      services = old.services;
      projects = old.projects;
      orders = old.orders;
      leads = old.leads;
      crmActivities = old.crmActivities;
      offers = old.offers;
      coupons = old.coupons;
      legalPages = old.legalPages;
      notifications = old.notifications;
      generatorLogs = old.generatorLogs;
      paymentLinks = Map.empty<Nat, PaymentLink>();
      nextServiceId = old.nextServiceId;
      nextProjectId = old.nextProjectId;
      nextOrderId = old.nextOrderId;
      nextLeadId = old.nextLeadId;
      nextCRMActivityId = old.nextCRMActivityId;
      nextOfferId = old.nextOfferId;
      nextLegalPageId = old.nextLegalPageId;
      nextNotificationId = old.nextNotificationId;
      nextGeneratorLogId = old.nextGeneratorLogId;
      nextPaymentLinkId = 1;
      stripeConfig = old.stripeConfig;
      razorpayConfig = null;
    };
  };
};
