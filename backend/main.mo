import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

// Use migration module's run function for data transformation during canister upgrades
(with migration = Migration.run)
actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  // Default automation config
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

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let integrationSettings = Map.empty<Principal, IntegrationSettings>();
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

  var razorpayConfig : ?RazorpayConfig = null;
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  func createNotificationInternal(userId : Principal, message : Text, notificationType : Text) : Nat {
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

  // Integration Settings Management
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

  // User Profile Management
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

  // Service Management - Public access for viewing
  public query func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public query func getService(id : Nat) : async ?Service {
    services.get(id);
  };

  // createService is admin-only: services are platform-level content;
  // updateService and deleteService are also admin-only, so creation must be too.
  public shared ({ caller }) func createService(
    name : Text,
    description : Text,
    category : Text,
    subcategory : Text,
    pricingBasic : PricingTier,
    pricingPro : PricingTier,
    pricingPremium : PricingTier,
    features : [Text],
    settings : ServiceSettings,
    paymentLinkUrl : ?Text,
    qrCodeDataUrl : ?Text,
    razorpayEnabled : Bool,
    razorpayKeyId : ?Text,
    razorpayOrderId : ?Text,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create services");
    };

    let service : Service = {
      id = nextServiceId;
      name;
      description;
      category;
      subcategory;
      pricingBasic;
      pricingPro;
      pricingPremium;
      features;
      settings;
      paymentLinkUrl;
      qrCodeDataUrl;
      razorpayEnabled;
      razorpayKeyId;
      razorpayOrderId;
    };
    services.add(nextServiceId, service);
    let id = nextServiceId;
    nextServiceId += 1;
    id;
  };

  public shared ({ caller }) func updateService(
    id : Nat,
    name : Text,
    description : Text,
    category : Text,
    subcategory : Text,
    pricingBasic : PricingTier,
    pricingPro : PricingTier,
    pricingPremium : PricingTier,
    features : [Text],
    settings : ServiceSettings,
    paymentLinkUrl : ?Text,
    qrCodeDataUrl : ?Text,
    razorpayEnabled : Bool,
    razorpayKeyId : ?Text,
    razorpayOrderId : ?Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };

    let service : Service = {
      id;
      name;
      description;
      category;
      subcategory;
      pricingBasic;
      pricingPro;
      pricingPremium;
      features;
      settings;
      paymentLinkUrl;
      qrCodeDataUrl;
      razorpayEnabled;
      razorpayKeyId;
      razorpayOrderId;
    };
    services.add(id, service);
  };

  public shared ({ caller }) func deleteService(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin users can delete services");
    };
    services.remove(id);
  };

  // Razorpay-Specific Methods
  public shared ({ caller }) func updateServiceRazorpay(id : Nat, enabled : Bool, keyId : ?Text, orderId : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update Razorpay configuration");
    };

    switch (services.get(id)) {
      case (?service) {
        let updated : Service = {
          id = service.id;
          name = service.name;
          description = service.description;
          category = service.category;
          subcategory = service.subcategory;
          pricingBasic = service.pricingBasic;
          pricingPro = service.pricingPro;
          pricingPremium = service.pricingPremium;
          features = service.features;
          settings = service.settings;
          paymentLinkUrl = service.paymentLinkUrl;
          qrCodeDataUrl = service.qrCodeDataUrl;
          razorpayEnabled = enabled;
          razorpayKeyId = keyId;
          razorpayOrderId = orderId;
        };
        services.add(id, updated);
      };
      case null { Runtime.trap("Service not found") };
    };
  };

  public shared ({ caller }) func getServiceRazorpayConfig(id : Nat) : async (Bool, ?Text, ?Text) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access Razorpay configuration");
    };

    switch (services.get(id)) {
      case (?service) {
        (service.razorpayEnabled, service.razorpayKeyId, service.razorpayOrderId);
      };
      case null { Runtime.trap("Service not found") };
    };
  };

  // Project Management
  public shared ({ caller }) func createProject(clientId : Principal, serviceId : Nat, onboardingData : ?OnboardingData) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    if (not AccessControl.isAdmin(accessControlState, caller) and caller != clientId) {
      Runtime.trap("Unauthorized: Can only create projects for yourself");
    };

    let project : Project = {
      id = nextProjectId;
      clientId;
      serviceId;
      status = "Active";
      startTime = Time.now();
      onboardingData;
    };
    projects.add(nextProjectId, project);
    let id = nextProjectId;
    nextProjectId += 1;
    id;
  };

  public query ({ caller }) func getProjectsByClient(clientId : Principal) : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    if (not AccessControl.isAdmin(accessControlState, caller) and caller != clientId) {
      Runtime.trap("Unauthorized: Can only view your own projects");
    };

    projects.values().toArray().filter(func(p : Project) : Bool { p.clientId == clientId });
  };

  public query ({ caller }) func getProject(id : Nat) : async ?Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    switch (projects.get(id)) {
      case (?project) {
        if (not AccessControl.isAdmin(accessControlState, caller) and caller != project.clientId) {
          Runtime.trap("Unauthorized: Can only view your own projects");
        };
        ?project;
      };
      case null { null };
    };
  };

  public shared ({ caller }) func updateProjectStatus(id : Nat, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update project status");
    };

    switch (projects.get(id)) {
      case (?project) {
        let updated : Project = {
          id = project.id;
          clientId = project.clientId;
          serviceId = project.serviceId;
          status;
          startTime = project.startTime;
          onboardingData = project.onboardingData;
        };
        projects.add(id, updated);
      };
      case null { Runtime.trap("Project not found") };
    };
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all projects");
    };
    projects.values().toArray();
  };

  // Order Management
  public shared ({ caller }) func createOrder(projectId : Nat, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    switch (projects.get(projectId)) {
      case (?project) {
        if (not AccessControl.isAdmin(accessControlState, caller) and caller != project.clientId) {
          Runtime.trap("Unauthorized: Can only create orders for your own projects");
        };

        let order : Order = {
          id = nextOrderId;
          projectId;
          clientId = project.clientId;
          amount;
          paymentStatus = "Pending";
          createdAt = Time.now();
        };
        orders.add(nextOrderId, order);
        let id = nextOrderId;
        nextOrderId += 1;
        id;
      };
      case null { Runtime.trap("Project not found") };
    };
  };

  public query ({ caller }) func getOrdersByProject(projectId : Nat) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (projects.get(projectId)) {
      case (?project) {
        if (not AccessControl.isAdmin(accessControlState, caller) and caller != project.clientId) {
          Runtime.trap("Unauthorized: Can only view orders for your own projects");
        };
        orders.values().toArray().filter(func(o : Order) : Bool { o.projectId == projectId });
      };
      case null { Runtime.trap("Project not found") };
    };
  };

  public query ({ caller }) func getOrdersByClient(clientId : Principal) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    if (not AccessControl.isAdmin(accessControlState, caller) and caller != clientId) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().toArray().filter(func(o : Order) : Bool { o.clientId == clientId });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(id)) {
      case (?order) {
        let updated : Order = {
          id = order.id;
          projectId = order.projectId;
          clientId = order.clientId;
          amount = order.amount;
          paymentStatus = status;
          createdAt = order.createdAt;
        };
        orders.add(id, updated);
      };
      case null { Runtime.trap("Order not found") };
    };
  };

  // Lead Management
  public shared ({ caller }) func createLead(name : Text, email : Text, phone : ?Text, channel : Text, microNiche : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create leads");
    };

    let lead : Lead = {
      id = nextLeadId;
      name;
      email;
      phone;
      channel;
      microNiche;
      status = "New Lead";
      assignedTo = ?caller;
      createdAt = Time.now();
      createdBy = caller;
    };
    leads.add(nextLeadId, lead);
    let id = nextLeadId;
    nextLeadId += 1;
    id;
  };

  public query ({ caller }) func getAllLeads() : async [Lead] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all leads");
    };
    leads.values().toArray();
  };

  public query ({ caller }) func getMyLeads() : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };

    leads.values().toArray().filter(func(l : Lead) : Bool {
      switch (l.assignedTo) {
        case (?assigned) { assigned == caller };
        case null { false };
      };
    });
  };

  public shared ({ caller }) func updateLead(id : Nat, name : Text, email : Text, phone : ?Text, channel : Text, microNiche : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update leads");
    };

    switch (leads.get(id)) {
      case (?lead) {
        let canUpdate = AccessControl.isAdmin(accessControlState, caller) or (switch (lead.assignedTo) {
          case (?assigned) { assigned == caller };
          case null { false };
        });

        if (not canUpdate) {
          Runtime.trap("Unauthorized: Can only update your assigned leads");
        };

        let updated : Lead = {
          id = lead.id;
          name;
          email;
          phone;
          channel;
          microNiche;
          status;
          assignedTo = lead.assignedTo;
          createdAt = lead.createdAt;
          createdBy = lead.createdBy;
        };
        leads.add(id, updated);

        // Create notifications for status changes
        if (lead.status != status) {
          switch (lead.assignedTo) {
            case (?assignedUser) {
              ignore createNotificationInternal(assignedUser, "Lead '" # name # "' is now qualified. Payment link ready.", "lead_qualified");
            };
            case null {};
          };
        };
      };
      case null { Runtime.trap("Lead not found") };
    };
  };

  public shared ({ caller }) func assignLead(leadId : Nat, userId : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign leads");
    };

    switch (leads.get(leadId)) {
      case (?lead) {
        let updated : Lead = {
          id = lead.id;
          name = lead.name;
          email = lead.email;
          phone = lead.phone;
          channel = lead.channel;
          microNiche = lead.microNiche;
          status = lead.status;
          assignedTo = ?userId;
          createdAt = lead.createdAt;
          createdBy = lead.createdBy;
        };
        leads.add(leadId, updated);
      };
      case null { Runtime.trap("Lead not found") };
    };
  };

  public shared ({ caller }) func deleteLead(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    leads.remove(id);
  };

  // CRM Activity Management
  public shared ({ caller }) func createCRMActivity(leadId : ?Nat, projectId : ?Nat, activityType : Text, stage : Text, notes : Text, assignedTo : ?Principal, dueDate : ?Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create CRM activities");
    };

    let activity : CRMActivity = {
      id = nextCRMActivityId;
      leadId;
      projectId;
      activityType;
      stage;
      notes;
      assignedTo;
      dueDate;
      createdBy = caller;
      createdAt = Time.now();
    };
    crmActivities.add(nextCRMActivityId, activity);
    let id = nextCRMActivityId;
    nextCRMActivityId += 1;
    id;
  };

  public query ({ caller }) func getAllCRMActivities() : async [CRMActivity] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all CRM activities");
    };
    crmActivities.values().toArray();
  };

  public query ({ caller }) func getMyCRMActivities() : async [CRMActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view CRM activities");
    };

    crmActivities.values().toArray().filter(func(a : CRMActivity) : Bool {
      switch (a.assignedTo) {
        case (?assigned) { assigned == caller };
        case null { a.createdBy == caller };
      };
    });
  };

  public query ({ caller }) func getCRMActivitiesByLead(leadId : Nat) : async [CRMActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view CRM activities");
    };

    crmActivities.values().toArray().filter(func(a : CRMActivity) : Bool {
      switch (a.leadId) {
        case (?id) { id == leadId };
        case null { false };
      };
    });
  };

  public shared ({ caller }) func updateCRMActivity(id : Nat, activityType : Text, stage : Text, notes : Text, dueDate : ?Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update CRM activities");
    };

    switch (crmActivities.get(id)) {
      case (?activity) {
        let canUpdate = AccessControl.isAdmin(accessControlState, caller) or activity.createdBy == caller or (switch (activity.assignedTo) {
          case (?assigned) { assigned == caller };
          case null { false };
        });

        if (not canUpdate) {
          Runtime.trap("Unauthorized: Can only update your own CRM activities");
        };

        let updated : CRMActivity = {
          id = activity.id;
          leadId = activity.leadId;
          projectId = activity.projectId;
          activityType;
          stage;
          notes;
          assignedTo = activity.assignedTo;
          dueDate;
          createdBy = activity.createdBy;
          createdAt = activity.createdAt;
        };
        crmActivities.add(id, updated);
      };
      case null { Runtime.trap("CRM activity not found") };
    };
  };

  // Offer Management - Public access for viewing
  public query func getAllOffers() : async [Offer] {
    offers.values().toArray();
  };

  public shared ({ caller }) func createOffer(name : Text, discountPercent : Nat, offerType : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create offers");
    };

    let offer : Offer = {
      id = nextOfferId;
      name;
      discountPercent;
      isActive = true;
      offerType;
    };
    offers.add(nextOfferId, offer);
    let id = nextOfferId;
    nextOfferId += 1;
    id;
  };

  public shared ({ caller }) func toggleOffer(id : Nat, isActive : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle offers");
    };

    switch (offers.get(id)) {
      case (?offer) {
        let updated : Offer = {
          id = offer.id;
          name = offer.name;
          discountPercent = offer.discountPercent;
          isActive;
          offerType = offer.offerType;
        };
        offers.add(id, updated);
      };
      case null { Runtime.trap("Offer not found") };
    };
  };

  // Coupon Management - Public access for checking validity
  public query func getCoupon(code : Text) : async ?Coupon {
    coupons.get(code);
  };

  public shared ({ caller }) func createCoupon(code : Text, discountPercent : Nat, expiresAt : ?Time.Time) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create coupons");
    };

    let coupon : Coupon = {
      code;
      discountPercent;
      isActive = true;
      expiresAt;
    };
    coupons.add(code, coupon);
  };

  public shared ({ caller }) func toggleCoupon(code : Text, isActive : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle coupons");
    };

    switch (coupons.get(code)) {
      case (?coupon) {
        let updated : Coupon = {
          code = coupon.code;
          discountPercent = coupon.discountPercent;
          isActive;
          expiresAt = coupon.expiresAt;
        };
        coupons.add(code, updated);
      };
      case null { Runtime.trap("Coupon not found") };
    };
  };

  // Legal Pages Management - Public access for viewing
  public query func getAllLegalPages() : async [LegalPage] {
    legalPages.values().toArray();
  };

  public query func getLegalPage(id : Nat) : async ?LegalPage {
    legalPages.get(id);
  };

  public shared ({ caller }) func createLegalPage(title : Text, content : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create legal pages");
    };

    let page : LegalPage = {
      id = nextLegalPageId;
      title;
      content;
      lastUpdatedBy = caller;
      lastUpdatedAt = Time.now();
    };
    legalPages.add(nextLegalPageId, page);
    let id = nextLegalPageId;
    nextLegalPageId += 1;
    id;
  };

  public shared ({ caller }) func updateLegalPage(id : Nat, title : Text, content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update legal pages");
    };

    let page : LegalPage = {
      id;
      title;
      content;
      lastUpdatedBy = caller;
      lastUpdatedAt = Time.now();
    };
    legalPages.add(id, page);
  };

  // Notification Management
  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    notifications.values().toArray().filter(func(n : Notification) : Bool { n.userId == caller });
  };

  public shared ({ caller }) func createNotification(userId : Principal, message : Text, notificationType : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create notifications");
    };

    createNotificationInternal(userId, message, notificationType);
  };

  public shared ({ caller }) func markNotificationAsRead(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (notifications.get(id)) {
      case (?notification) {
        if (notification.userId != caller) {
          Runtime.trap("Unauthorized: Can only mark your own notifications as read");
        };

        let updated : Notification = {
          id = notification.id;
          userId = notification.userId;
          message = notification.message;
          notificationType = notification.notificationType;
          isRead = true;
          createdAt = notification.createdAt;
        };
        notifications.add(id, updated);
      };
      case null { Runtime.trap("Notification not found") };
    };
  };

  // Generator Logs
  public shared ({ caller }) func createGeneratorLog(generatorType : Text, inputData : Text, outputData : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create generator logs");
    };

    let log : GeneratorLog = {
      id = nextGeneratorLogId;
      generatorType;
      userId = caller;
      inputData;
      outputData;
      createdAt = Time.now();
    };
    generatorLogs.add(nextGeneratorLogId, log);
    let id = nextGeneratorLogId;
    nextGeneratorLogId += 1;
    id;
  };

  public query ({ caller }) func getMyGeneratorLogs() : async [GeneratorLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view generator logs");
    };

    generatorLogs.values().toArray().filter(func(l : GeneratorLog) : Bool { l.userId == caller });
  };

  public query ({ caller }) func getAllGeneratorLogs() : async [GeneratorLog] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all generator logs");
    };
    generatorLogs.values().toArray();
  };

  // Stripe integration
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let config = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?c) { c };
    };

    await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
  };

  // getStripeSessionStatus requires at least user-level auth to prevent
  // anonymous callers from probing session data.
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query Stripe session status");
    };

    let config = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?c) { c };
    };
    await Stripe.getSessionStatus(config, sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Razorpay integration
  public query func isRazorpayConfigured() : async Bool {
    razorpayConfig != null;
  };

  public shared ({ caller }) func setRazorpayConfiguration(apiKey : Text, apiSecret : Text, webhookSecret : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can configure Razorpay");
    };
    razorpayConfig := ?{ apiKey; apiSecret; webhookSecret };
  };

  public query ({ caller }) func getPaymentLinks() : async [PaymentLink] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payment links");
    };
    paymentLinks.values().toArray();
  };

  public query ({ caller }) func getMyPaymentLinks() : async [PaymentLink] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment links");
    };

    paymentLinks.values().toArray().filter(func(pl : PaymentLink) : Bool { pl.createdBy == caller });
  };

  public shared ({ caller }) func createPaymentLink(leadId : Nat, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment links");
    };

    switch (leads.get(leadId)) {
      case (?lead) {
        let canCreate = AccessControl.isAdmin(accessControlState, caller) or (switch (lead.assignedTo) {
          case (?assigned) { assigned == caller };
          case null { false };
        });

        if (not canCreate) {
          Runtime.trap("Unauthorized: Can only create payment links for your assigned leads");
        };

        let paymentLink : PaymentLink = {
          id = nextPaymentLinkId;
          leadId;
          amount;
          status = "created";
          createdAt = Time.now();
          createdBy = caller;
          paymentLinkUrl = null;
          qrCodeDataUrl = null;
        };
        paymentLinks.add(nextPaymentLinkId, paymentLink);
        let id = nextPaymentLinkId;
        nextPaymentLinkId += 1;
        id;
      };
      case null { Runtime.trap("Lead not found") };
    };
  };

  public shared ({ caller }) func updatePaymentLinkStatus(id : Nat, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update payment link status");
    };

    switch (paymentLinks.get(id)) {
      case (?link) {
        let updated : PaymentLink = {
          id = link.id;
          leadId = link.leadId;
          amount = link.amount;
          status;
          createdAt = link.createdAt;
          createdBy = link.createdBy;
          paymentLinkUrl = link.paymentLinkUrl;
          qrCodeDataUrl = link.qrCodeDataUrl;
        };
        paymentLinks.add(id, updated);

        if (status == "paid") {
          switch (leads.get(link.leadId)) {
            case (?lead) {
              let updatedLead : Lead = {
                id = lead.id;
                name = lead.name;
                email = lead.email;
                phone = lead.phone;
                channel = lead.channel;
                microNiche = lead.microNiche;
                status = "paid";
                assignedTo = lead.assignedTo;
                createdAt = lead.createdAt;
                createdBy = lead.createdBy;
              };
              leads.add(link.leadId, updatedLead);

              switch (lead.assignedTo) {
                case (?assignedUser) {
                  ignore createNotificationInternal(assignedUser, "Payment confirmed for lead '" # lead.name # "'.", "payment_confirmed");
                };
                case null {};
              };
            };
            case null {};
          };
        };
      };
      case null { Runtime.trap("Payment link not found") };
    };
  };

  public shared ({ caller }) func setPaymentLinkUrl(id : Nat, url : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment links");
    };

    switch (paymentLinks.get(id)) {
      case (?link) {
        if (not AccessControl.isAdmin(accessControlState, caller) and link.createdBy != caller) {
          Runtime.trap("Unauthorized: Can only update your own payment links");
        };

        let updated : PaymentLink = {
          id = link.id;
          leadId = link.leadId;
          amount = link.amount;
          status = link.status;
          createdAt = link.createdAt;
          createdBy = link.createdBy;
          paymentLinkUrl = ?url;
          qrCodeDataUrl = link.qrCodeDataUrl;
        };
        paymentLinks.add(id, updated);
      };
      case null { Runtime.trap("Payment link not found") };
    };
  };

  public shared ({ caller }) func setPaymentLinkQrCode(id : Nat, qrCodeDataUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment links");
    };

    switch (paymentLinks.get(id)) {
      case (?link) {
        if (not AccessControl.isAdmin(accessControlState, caller) and link.createdBy != caller) {
          Runtime.trap("Unauthorized: Can only update your own payment links");
        };

        let updated : PaymentLink = {
          id = link.id;
          leadId = link.leadId;
          amount = link.amount;
          status = link.status;
          createdAt = link.createdAt;
          createdBy = link.createdBy;
          paymentLinkUrl = link.paymentLinkUrl;
          qrCodeDataUrl = ?qrCodeDataUrl;
        };
        paymentLinks.add(id, updated);
      };
      case null { Runtime.trap("Payment link not found") };
    };
  };

  public shared ({ caller }) func updateServicePaymentInfo(id : Nat, paymentLinkUrl : ?Text, qrCodeDataUrl : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update service payment info");
    };

    switch (services.get(id)) {
      case (?service) {
        let updatedService : Service = {
          id = service.id;
          name = service.name;
          description = service.description;
          category = service.category;
          subcategory = service.subcategory;
          pricingBasic = service.pricingBasic;
          pricingPro = service.pricingPro;
          pricingPremium = service.pricingPremium;
          features = service.features;
          settings = service.settings;
          paymentLinkUrl;
          qrCodeDataUrl;
          razorpayEnabled = service.razorpayEnabled;
          razorpayKeyId = service.razorpayKeyId;
          razorpayOrderId = service.razorpayOrderId;
        };
        services.add(id, updatedService);
      };
      case null { Runtime.trap("Service not found") };
    };
  };
};
