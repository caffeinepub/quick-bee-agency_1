import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Stripe "stripe/stripe";

module {
  // Old types
  type OldIntegrationSettings = {
    stripeEnabled : Bool;
    razorpayEnabled : Bool;
    webhookUrl : ?Text;
  };

  // Complete old Service and Project types
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
    paymentLinkUrl : ?Text;
    qrCodeDataUrl : ?Text;
    razorpayEnabled : Bool;
    razorpayKeyId : ?Text;
    razorpayOrderId : ?Text;
  };

  type OldProject = {
    id : Nat;
    clientId : Principal;
    serviceId : Nat;
    status : Text;
    startTime : Time.Time;
    onboardingData : ?{
      businessName : Text;
      niche : Text;
      goals : Text;
      budget : Nat;
      timeline : Text;
    };
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; businessName : ?Text }>;
    integrationSettings : Map.Map<Principal, OldIntegrationSettings>;
    services : Map.Map<Nat, OldService>;
    projects : Map.Map<Nat, OldProject>;
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
    razorpayConfig : ?{ apiKey : Text; apiSecret : Text; webhookSecret : Text };
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  // Automation types
  type AutomationSettings = {
    autoWhatsAppReplies : { enabled : Bool; config : Text };
    sequenceBuilder : { enabled : Bool; config : Text };
    proposalAutoSend : { enabled : Bool; config : Text };
    paymentConfirmation : { enabled : Bool; config : Text };
    projectOnboarding : { enabled : Bool; config : Text };
  };

  type NewIntegrationSettings = {
    stripeEnabled : Bool;
    razorpayEnabled : Bool;
    webhookUrl : ?Text;
    automations : AutomationSettings;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; businessName : ?Text }>;
    integrationSettings : Map.Map<Principal, NewIntegrationSettings>;
    services : Map.Map<Nat, OldService>;
    projects : Map.Map<Nat, OldProject>;
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
    razorpayConfig : ?{ apiKey : Text; apiSecret : Text; webhookSecret : Text };
    stripeConfig : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    let newIntegrationSettings = old.integrationSettings.map<Principal, OldIntegrationSettings, NewIntegrationSettings>(
      func(_id, oldSettings) {
        {
          stripeEnabled = oldSettings.stripeEnabled;
          razorpayEnabled = oldSettings.razorpayEnabled;
          webhookUrl = oldSettings.webhookUrl;
          automations = {
            autoWhatsAppReplies = { enabled = false; config = "" };
            sequenceBuilder = { enabled = false; config = "" };
            proposalAutoSend = { enabled = false; config = "" };
            paymentConfirmation = { enabled = false; config = "" };
            projectOnboarding = { enabled = false; config = "" };
          };
        };
      }
    );

    {
      userProfiles = old.userProfiles;
      integrationSettings = newIntegrationSettings;
      services = old.services;
      projects = old.projects;
      nextServiceId = old.nextServiceId;
      nextProjectId = old.nextProjectId;
      nextOrderId = old.nextOrderId;
      nextLeadId = old.nextLeadId;
      nextCRMActivityId = old.nextCRMActivityId;
      nextOfferId = old.nextOfferId;
      nextLegalPageId = old.nextLegalPageId;
      nextNotificationId = old.nextNotificationId;
      nextGeneratorLogId = old.nextGeneratorLogId;
      nextPaymentLinkId = old.nextPaymentLinkId;
      razorpayConfig = old.razorpayConfig;
      stripeConfig = old.stripeConfig;
    };
  };
};
