import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Set "mo:core/Set";
import List "mo:core/List";
import Int "mo:core/Int";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Include MixinStorage for file/blob handling
  include MixinStorage();

  // Types
  public type UserProfile = {
    name : Text;
    email : Text;
    businessName : ?Text;
  };

  public type AutomationSettings = {
    autoWhatsAppReplies : AutomationConfig;
    sequenceBuilder : AutomationConfig;
    proposalAutoSend : AutomationConfig;
    paymentConfirmation : AutomationConfig;
    projectOnboarding : AutomationConfig;
  };

  public type IntegrationSettings = {
    stripeEnabled : Bool;
    razorpayEnabled : Bool;
    webhookUrl : ?Text;
    automations : AutomationSettings;
  };

  public type AutomationConfig = {
    enabled : Bool;
    config : Text;
  };

  public type SalesSystemConfig = {
    systemName : Text;
    description : Text;
    enabled : Bool;
    apiEndpoint : Text;
    apiKey : Text;
    systemSettings : Text;
  };

  public type SalesSystems = {
    serviceRecommendationConfig : SalesSystemConfig;
    proposalGeneratorConfig : SalesSystemConfig;
    pricingStrategyConfig : SalesSystemConfig;
    closingScriptConfig : SalesSystemConfig;
    followUpMessagesConfig : SalesSystemConfig;
    leadQualificationConfig : SalesSystemConfig;
  };

  public type PricingTier = {
    price : Nat;
    features : [Text];
  };

  public type ServiceSettings = {
    isVisible : Bool;
    isFeatured : Bool;
    availability : Text;
    customMetadata : Text;
  };

  public type Service = {
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

  public type Project = {
    id : Nat;
    clientId : Principal;
    serviceId : Nat;
    status : Text;
    startTime : Time.Time;
    onboardingData : ?OnboardingData;
  };

  public type OnboardingData = {
    businessName : Text;
    niche : Text;
    goals : Text;
    budget : Nat;
    timeline : Text;
  };

  public type Order = {
    id : Nat;
    projectId : Nat;
    clientId : Principal;
    amount : Nat;
    paymentStatus : Text;
    createdAt : Time.Time;
  };

  public type Lead = {
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
    qualificationScore : Nat;
    budgetRange : ?Nat;
    urgencyLevel : ?Nat;
    companySize : ?Text;
    decisionMakerStatus : ?Bool;
  };

  public type CRMActivity = {
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

  public type Offer = {
    id : Nat;
    name : Text;
    discountPercent : Nat;
    isActive : Bool;
    offerType : Text;
  };

  public type Coupon = {
    code : Text;
    discountPercent : Nat;
    isActive : Bool;
    expiresAt : ?Time.Time;
  };

  public type LegalPage = {
    id : Nat;
    title : Text;
    content : Text;
    lastUpdatedBy : Principal;
    lastUpdatedAt : Time.Time;
  };

  public type Notification = {
    id : Nat;
    userId : Principal;
    message : Text;
    notificationType : Text;
    isRead : Bool;
    createdAt : Time.Time;
  };

  public type GeneratorLog = {
    id : Nat;
    generatorType : Text;
    userId : Principal;
    inputData : Text;
    outputData : Text;
    createdAt : Time.Time;
  };

  public type RazorpayConfig = {
    apiKey : Text;
    apiSecret : Text;
    webhookSecret : Text;
  };

  public type PaymentLink = {
    id : Nat;
    leadId : Nat;
    amount : Nat;
    status : Text;
    createdAt : Time.Time;
    createdBy : Principal;
    paymentLinkUrl : ?Text;
    qrCodeDataUrl : ?Text;
  };

  public type RecommendationOutput = {
    recommendedService : Text;
    upsellSuggestion : Text;
    budget : ?Nat;
    projectedROI : ?Text;
  };

  public type PaymentLog = {
    orderId : Text;
    paymentId : Text;
    signature : Text;
    amount : Nat;
    status : Text;
    timestamp : Time.Time;
  };

  public type Invoice = {
    invoiceId : Text;
    clientId : Principal;
    serviceBreakdown : Text;
    gstAmount : Nat;
    totalPaid : Nat;
    createdAt : Time.Time;
  };

  public type WhatsAppMessageLog = {
    recipientPhone : Text;
    messageType : Text;
    deliveryStatus : Text;
    sentAt : Time.Time;
  };

  public type CRMUser = {
    email : Text;
    passwordHash : Text;
    role : AccessControl.UserRole;
    createdAt : Time.Time;
  };

  public type PasswordAuthResult = {
    #ok : Token;
    #error : Text;
  };

  public type Token = {
    principal : Principal;
    issuedAt : Time.Time;
    expiry : Time.Time;
  };

  // New Managed Services Types
  public type ManagedService = {
    id : Text;
    name : Text;
    shortDescription : Text;
    detailedDescription : Text;
    category : Text;
    pricingType : PricingType;
    basePrice : Nat;
    deliveryTime : Text;
    imageUrl : Text;
    features : [Text];
    packages : [ServicePackage];
    addOns : [ServiceAddOn];
    customRequirementLabel : Text;
    quantityEnabled : Bool;
    isVisible : Bool;
    sortOrder : Nat;
    createdAt : Int;
    updatedAt : Int;
    isUserCreated : Bool;
  };

  public type PricingType = {
    #Fixed;
    #Hourly;
    #Custom;
  };

  public type ServicePackage = {
    name : Text;
    price : Nat;
    deliveryTime : Text;
    features : [Text];
  };

  public type ServiceAddOn = {
    name : Text;
    price : Nat;
    description : Text;
  };

  public type ServiceCatalogResult = {
    #success : ManagedService;
    #error : Text;
  };

  public type ServicesResult = {
    #success : [ManagedService];
    #error : Text;
  };

  public type UpdateServiceResult = {
    #success : ManagedService;
    #error : Text;
  };

  let defaultAutomationConfig : AutomationConfig = {
    enabled = false;
    config = "";
  };

  let defaultAutomationSettings : AutomationSettings = {
    autoWhatsAppReplies = defaultAutomationConfig;
    sequenceBuilder = defaultAutomationConfig;
    proposalAutoSend = defaultAutomationConfig;
    paymentConfirmation = defaultAutomationConfig;
    projectOnboarding = defaultAutomationConfig;
  };

  let defaultServiceRecommendationConfig : SalesSystemConfig = {
    systemName = "Service Recommendation";
    description = "Recommend the most suitable service for the client";
    enabled = true;
    apiEndpoint = "https://enxcw-uaaaa-aaaap-abkba-cai.raw.icp0.io/serviceRecommendation";
    apiKey = "YOUR_API_KEY";
    systemSettings = "Service Recommendations Thresholds and Templates";
  };

  let defaultProposalGeneratorConfig : SalesSystemConfig = {
    systemName = "Proposal Generator";
    description = "Generate detailed proposals for clients";
    enabled = true;
    apiEndpoint = "https://enxcw-uaaaa-aaaap-abkba-cai.raw.icp0.io/proposalGenerator";
    apiKey = "YOUR_API_KEY";
    systemSettings = "Proposal Format Settings";
  };

  let defaultPricingStrategyConfig : SalesSystemConfig = {
    systemName = "Pricing Strategy";
    description = "Suggest optimal pricing strategies";
    enabled = true;
    apiEndpoint = "https://enxcw-uaaaa-aaaap-abkba-cai.raw.icp0.io/pricingStrategy";
    apiKey = "YOUR_API_KEY";
    systemSettings = "Pricing Strategy Settings";
  };

  let defaultClosingScriptConfig : SalesSystemConfig = {
    systemName = "Closing Script";
    description = "Generate scripts for closing deals";
    enabled = true;
    apiEndpoint = "https://enxcw-uaaaa-aaaap-abkba-cai.raw.icp0.io/closingScript";
    apiKey = "YOUR_API_KEY";
    systemSettings = "Closing Script Templates";
  };

  let defaultFollowUpMessagesConfig : SalesSystemConfig = {
    systemName = "Follow-up Messages";
    description = "Automate follow-up messages to clients";
    enabled = true;
    apiEndpoint = "https://enxcw-uaaaa-aaaap-abkba-cai.raw.icp0.io/followUpMessages";
    apiKey = "YOUR_API_KEY";
    systemSettings = "Follow-up Templates";
  };

  let defaultLeadQualificationConfig : SalesSystemConfig = {
    systemName = "Lead Qualification";
    description = "Qualify leads based on AI analysis";
    enabled = true;
    apiEndpoint = "https://enxcw-uaaaa-aaaap-abkba-cai.raw.icp0.io/leadQualification";
    apiKey = "YOUR_API_KEY";
    systemSettings = "Qualification Criteria";
  };

  let defaultSalesSystems : SalesSystems = {
    serviceRecommendationConfig = defaultServiceRecommendationConfig;
    proposalGeneratorConfig = defaultProposalGeneratorConfig;
    pricingStrategyConfig = defaultPricingStrategyConfig;
    closingScriptConfig = defaultClosingScriptConfig;
    followUpMessagesConfig = defaultFollowUpMessagesConfig;
    leadQualificationConfig = defaultLeadQualificationConfig;
  };

  //
  // State Storage
  //
  let users = Map.empty<Text, CRMUser>();
  let registeredEmails = Set.empty<Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let integrationSettings = Map.empty<Principal, IntegrationSettings>();
  let salesSystemConfigs = Map.empty<Principal, SalesSystemConfig>();
  let services = Map.empty<Nat, Service>();
  let projects = Map.empty<Nat, Project>();
  let orders = Map.empty<Nat, Order>();
  let leads = Map.empty<Nat, Lead>();
  let crmActivities = Map.empty<Nat, CRMActivity>();
  let offers = Map.empty<Nat, Offer>();
  let coupons = Map.empty<Text, Coupon>();
  let legalPages = Map.empty<Nat, LegalPage>();
  let notifications = Map.empty<Nat, Notification>();
  let generatorLogs = Map.empty<Nat, GeneratorLog>();
  let paymentLinks = Map.empty<Nat, PaymentLink>();
  let paymentLogs = Map.empty<Text, PaymentLog>();
  let invoices = Map.empty<Text, Invoice>();
  let whatsappLogs = Map.empty<Text, WhatsAppMessageLog>();
  let recommendations = Map.empty<Nat, RecommendationOutput>();

  // Managed services state (TEXT indexed for preserved order)
  var managedServices = Map.empty<Text, ManagedService>();

  var nextServiceId = 1;
  var nextProjectId = 1;
  var nextOrderId = 1;
  var nextLeadId = 1;
  var nextCRMActivityId = 1;
  var nextOfferId = 1;
  var nextLegalPageId = 1;
  var nextNotificationId = 1;
  var nextGeneratorLogId = 1;
  var nextPaymentLinkId = 1;
  var nextRecommendationId = 1;

  var razorpayConfig : ?RazorpayConfig = null;
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  func hashPassword(password : Text) : Text {
    // Placeholder for password hashing
    password.reverse();
  };

  // Managed service helper
  func validateManagedService(service : ManagedService) : ?Text {
    if (service.name.trimStart(#char ' ') == "") {
      return ?"Name is required";
    };
    if (service.basePrice < 0) {
      return ?"Base price cannot be negative";
    };
    null;
  };

  func generateServiceId() : Text {
    let timestamp = Int.abs(Time.now());
    let id = nextServiceId;
    nextServiceId += 1;
    timestamp.toText() # "-" # id.toText();
  };

  public shared ({ caller }) func createManagedService(service : ManagedService) : async ServiceCatalogResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin users can create managed services");
    };

    switch (validateManagedService(service)) {
      case (?error) { return #error(error) };
      case (null) {};
    };

    let id = generateServiceId();
    let newService = {
      service with
      id;
      createdAt = Time.now();
      updatedAt = Time.now();
      isUserCreated = true;
    };
    managedServices.add(id, newService);
    #success(newService);
  };

  public shared ({ caller }) func updateManagedService(id : Text, service : ManagedService) : async UpdateServiceResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin users can update managed services");
    };

    switch (managedServices.get(id)) {
      case (null) {
        return #error("Managed service not found");
      };
      case (?existing) {
        switch (validateManagedService(service)) {
          case (?error) { return #error(error) };
          case (null) {};
        };

        let updatedService = {
          service with
          id;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
          isUserCreated = existing.isUserCreated;
        };
        managedServices.add(id, updatedService);
        #success(updatedService);
      };
    };
  };

  public shared ({ caller }) func deleteManagedService(id : Text) : async ServiceCatalogResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin users can delete managed services");
    };

    switch (managedServices.get(id)) {
      case (null) { return #error("Managed service not found") };
      case (?service) {
        if (service.isUserCreated) {
          managedServices.remove(id);
          #success(service);
        } else { #error("Cannot remove non-user created service") };
      };
    };
  };

  public shared ({ caller }) func duplicateManagedService(id : Text) : async ServiceCatalogResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin users can duplicate managed services");
    };

    switch (managedServices.get(id)) {
      case (null) {
        #error("Managed service not found");
      };
      case (?service) {
        let newId = generateServiceId();
        let duplicatedService = {
          service with
          id = newId;
          createdAt = Time.now();
          updatedAt = Time.now();
          isUserCreated = true;
        };
        managedServices.add(newId, duplicatedService);
        #success(duplicatedService);
      };
    };
  };

  public shared ({ caller }) func reorderManagedServices(orderedIds : [Text]) : async ServicesResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin users can reorder managed services");
    };

    var order = 0;
    let updatedServices = orderedIds.map(
      func(id) {
        order += 10; // Increment sortOrder by 10
        switch (managedServices.get(id)) {
          case (null) {
            return ?order;
          }; // Continue with next id if not found
          case (?service) {
            managedServices.add(id, { service with sortOrder = order });
            return null;
          };
        };
      }
    );
    let services = managedServices.values().toArray();
    #success(services);
  };

  public query func getManagedServices() : async [ManagedService] {
    managedServices.values().toArray();
  };

  public query func getManagedServicesByCategory(category : Text) : async [ManagedService] {
    let filtered = managedServices.values().toArray().filter(
      func(service) { service.category == category }
    );
    filtered;
  };

  public query func getManagedService(id : Text) : async ServiceCatalogResult {
    switch (managedServices.get(id)) {
      case (?service) { #success(service) };
      case (null) { #error("Managed service not found") };
    };
  };

  // ---- Helper functions ---
  func createNotificationInternal(
    userId : Principal,
    message : Text,
    notificationType : Text,
  ) : Nat {
    let notification : Notification = {
      id = nextNotificationId;
      userId;
      message;
      notificationType;
      isRead = false;
      createdAt = Time.now();
    };
    notifications.add(nextNotificationId, notification);
    let id = nextNotificationId;
    nextNotificationId += 1;
    id;
  };

  func calculateQualificationScore(
    budgetRange : ?Nat,
    urgencyLevel : ?Nat,
    companySize : ?Text,
    decisionMakerStatus : ?Bool,
  ) : Nat {
    var score : Nat = 0;

    // Budget factor - 0 (low) to 3 (high)
    switch (budgetRange) {
      case (?budget) {
        switch (budget) {
          case (0) { score += 10 };
          case (1) { score += 28 };
          case (2) { score += 44 };
          case (3) { score += 60 };
          case (_) { score += 0 };
        };
      };
      case (null) {};
    };

    // Urgency factor - 0 (not urgent) to 3 (immediate)
    switch (urgencyLevel) {
      case (?urgency) {
        switch (urgency) {
          case (0) { score += 9 };
          case (1) { score += 18 };
          case (2) { score += 32 };
          case (3) { score += 43 };
          case (_) { score += 0 };
        };
      };
      case (null) {};
    };

    // Company size factor
    switch (companySize) {
      case (?size) {
        if (size == "large") { score += 33 } else {
          if (size == "medium") { score += 19 } else {
            score += 5;
          };
        };
      };
      case (null) { score += 8 };
    };

    // Decision maker status
    switch (decisionMakerStatus) {
      case (?isDecisionMaker) { if (isDecisionMaker) { score += 15 } else { score += 3 } };
      case (null) { score += 1 };
    };

    // Cap the score at 100
    if (score > 100) { 100 } else { score };
  };

  // Helper: check whether caller has access to a given lead
  // (admin can access all; users can only access leads assigned to them or created by them)
  func callerCanAccessLead(caller : Principal, lead : Lead) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    if (lead.createdBy == caller) { return true };
    switch (lead.assignedTo) {
      case (?assigned) { assigned == caller };
      case null { false };
    };
  };

  // - Email Fully-Functional Password Authentication Logic
  //
  // register: Only admins may register accounts with the #admin role.
  // Any authenticated user (non-guest) may register a new account with the #user role.
  // Guests (anonymous principals) cannot register at all.
  // This prevents privilege escalation via self-registration.
  public shared ({ caller }) func register(email : Text, password : Text, initialRole : AccessControl.UserRole) : async PasswordAuthResult {
    // Guests (anonymous principals) are not allowed to register accounts.
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      // Only admins may register #admin accounts.
      // For non-admin authenticated callers this path is unreachable, but we
      // keep the admin-role guard below for clarity.
      if (not AccessControl.isAdmin(accessControlState, caller)) {
        return #error("Unauthorized: You must be authenticated to register an account");
      };
    };

    // Only admins may create accounts with the #admin role.
    switch (initialRole) {
      case (#admin) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          return #error("Unauthorized: Only admins can register admin accounts");
        };
      };
      case (_) {};
    };

    // Check if email already registered
    if (registeredEmails.contains(email)) {
      return #error("Email already registered");
    };

    // Create and store new user
    let newUser : CRMUser = {
      email;
      passwordHash = hashPassword(password);
      role = initialRole;
      createdAt = Time.now();
    };

    users.add(email, newUser);
    registeredEmails.add(email);

    // Generate token based on caller's principal
    let token : Token = {
      principal = caller;
      issuedAt = Time.now();
      expiry = Time.now() + 2_592_000_000_000_000;
    };
    #ok(token);
  };

  // login: Open to all callers — it is the authentication entry point.
  public shared ({ caller }) func login(email : Text, password : Text) : async PasswordAuthResult {
    // Validate user existence
    let user = switch (users.get(email)) {
      case (?user) { user };
      case (null) { return #error("User or password invalid") };
    };

    // Validate password
    let passwordHash = hashPassword(password);
    if (user.passwordHash != passwordHash) {
      return #error("User or password invalid");
    };

    // Generate token (simple implementation)
    let token : Token = {
      principal = caller;
      issuedAt = Time.now();
      expiry = Time.now() + 2_592_000_000_000_000;
    };
    #ok(token);
  };

  // --- Recommendation Management
  public shared ({ caller }) func createRecommendation(recommendation : RecommendationOutput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create recommendations");
    };

    let id = nextRecommendationId;
    recommendations.add(id, recommendation);
    nextRecommendationId += 1;
    id;
  };

  public query ({ caller }) func getRecommendation(id : Nat) : async ?RecommendationOutput {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access recommendations");
    };
    recommendations.get(id);
  };

  public query ({ caller }) func getAllRecommendations() : async [RecommendationOutput] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access recommendations");
    };
    recommendations.values().toArray();
  };

  public shared ({ caller }) func updateRecommendation(id : Nat, recommendation : RecommendationOutput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update recommendations");
    };
    recommendations.add(id, recommendation);
  };

  public shared ({ caller }) func deleteRecommendation(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete recommendations");
    };
    recommendations.remove(id);
  };

  // --- Integration Settings Management
  public query ({ caller }) func getIntegrationSettings(userId : Principal) : async ?IntegrationSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access integration settings");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own integration settings");
    };
    integrationSettings.get(userId);
  };

  public shared ({ caller }) func saveIntegrationSettings(settings : IntegrationSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save integration settings");
    };
    integrationSettings.add(caller, settings);
  };

  // --- Sales System Config Management
  public query ({ caller }) func getSalesSystemConfig(userId : Principal) : async ?SalesSystemConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access sales system config");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own sales system config");
    };
    salesSystemConfigs.get(userId);
  };

  public shared ({ caller }) func saveSalesSystemConfig(config : SalesSystemConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save sales system configs");
    };
    salesSystemConfigs.add(caller, config);
  };

  // --- User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Service Management
  public query func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public query func getService(id : Nat) : async ?Service {
    services.get(id);
  };

  // Stripe integration required functions
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfigurationInternal() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfigurationInternal(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfigurationInternal(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
