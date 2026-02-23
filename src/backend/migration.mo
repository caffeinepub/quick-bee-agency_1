import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type OldPricingTier = {
    price : Nat;
    features : [Text];
  };

  type OldServiceSettings = {
    isVisible : Bool;
    isFeatured : Bool;
    availability : Text;
    customMetadata : Text;
  };

  type OldService = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    subcategory : Text;
    pricingBasic : OldPricingTier;
    pricingPro : OldPricingTier;
    pricingPremium : OldPricingTier;
    features : [Text];
    settings : OldServiceSettings;
  };

  type OldProject = {
    id : Nat;
    clientId : Principal;
    serviceId : Nat;
    status : Text;
    startTime : Time.Time;
    onboardingData : ?OldOnboardingData;
  };

  type OldOnboardingData = {
    businessName : Text;
    niche : Text;
    goals : Text;
    budget : Nat;
    timeline : Text;
  };

  type OldOrder = {
    id : Nat;
    projectId : Nat;
    clientId : Principal;
    amount : Nat;
    paymentStatus : Text;
    createdAt : Time.Time;
  };

  type OldLead = {
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

  type OldCRMActivity = {
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

  type OldOffer = {
    id : Nat;
    name : Text;
    discountPercent : Nat;
    isActive : Bool;
    offerType : Text;
  };

  type OldCoupon = {
    code : Text;
    discountPercent : Nat;
    isActive : Bool;
    expiresAt : ?Time.Time;
  };

  type OldLegalPage = {
    id : Nat;
    title : Text;
    content : Text;
    lastUpdatedBy : Principal;
    lastUpdatedAt : Time.Time;
  };

  type OldNotification = {
    id : Nat;
    userId : Principal;
    message : Text;
    notificationType : Text;
    isRead : Bool;
    createdAt : Time.Time;
  };

  type OldGeneratorLog = {
    id : Nat;
    generatorType : Text;
    userId : Principal;
    inputData : Text;
    outputData : Text;
    createdAt : Time.Time;
  };

  type OldPaymentLink = {
    id : Nat;
    leadId : Nat;
    amount : Nat;
    status : Text;
    createdAt : Time.Time;
    createdBy : Principal;
    paymentLinkUrl : ?Text;
    qrCodeDataUrl : ?Text;
  };

  type OldActor = {
    services : Map.Map<Nat, OldService>;
    projects : Map.Map<Nat, OldProject>;
    orders : Map.Map<Nat, OldOrder>;
    leads : Map.Map<Nat, OldLead>;
    crmActivities : Map.Map<Nat, OldCRMActivity>;
    offers : Map.Map<Nat, OldOffer>;
    coupons : Map.Map<Text, OldCoupon>;
    legalPages : Map.Map<Nat, OldLegalPage>;
    notifications : Map.Map<Nat, OldNotification>;
    generatorLogs : Map.Map<Nat, OldGeneratorLog>;
    paymentLinks : Map.Map<Nat, OldPaymentLink>;
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
  };

  // New types for migration
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
    paymentLinkUrl : ?Text; // New field for payment link
    qrCodeDataUrl : ?Text; // New field for dynamic QR code data
  };

  type NewActor = {
    services : Map.Map<Nat, Service>;
    projects : Map.Map<Nat, OldProject>;
    orders : Map.Map<Nat, OldOrder>;
    leads : Map.Map<Nat, OldLead>;
    crmActivities : Map.Map<Nat, OldCRMActivity>;
    offers : Map.Map<Nat, OldOffer>;
    coupons : Map.Map<Text, OldCoupon>;
    legalPages : Map.Map<Nat, OldLegalPage>;
    notifications : Map.Map<Nat, OldNotification>;
    generatorLogs : Map.Map<Nat, OldGeneratorLog>;
    paymentLinks : Map.Map<Nat, OldPaymentLink>;
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
  };

  public func run(old : OldActor) : NewActor {
    let newServices = old.services.map<Nat, OldService, Service>(
      func(_id, oldService) {
        {
          oldService with
          paymentLinkUrl = null;
          qrCodeDataUrl = null;
        };
      }
    );
    {
      old with
      services = newServices;
    };
  };
};
