import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text; // "Admin", "Manager", "Client"
    businessName : ?Text;
  };

  public type Service = {
    id : Nat;
    name : Text;
    description : Text;
    priceBasic : Nat;
    pricePro : Nat;
    pricePremium : Nat;
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
    channel : Text; // Email, LinkedIn, Instagram, WhatsApp, SMS
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
    stage : Text; // New Lead, Contacted, Qualified, Proposal Sent, Closed, Lost
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
    offerType : Text; // Festival, Student, Limited-Time
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
    generatorType : Text; // proposal, pricing, script, etc.
    userId : Principal;
    inputData : Text;
    outputData : Text;
    createdAt : Time.Time;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
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

  var nextServiceId = 1;
  var nextProjectId = 1;
  var nextOrderId = 1;
  var nextLeadId = 1;
  var nextCRMActivityId = 1;
  var nextOfferId = 1;
  var nextLegalPageId = 1;
  var nextNotificationId = 1;
  var nextGeneratorLogId = 1;

  // Helper functions
  func isAdminRole(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.role == "Admin" };
      case null { false };
    };
  };

  func isManagerRole(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.role == "Manager" or profile.role == "Admin" };
      case null { false };
    };
  };

  func isClientRole(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.role == "Client" };
      case null { false };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminRole(caller)) {
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

  // Service Management
  public query ({ caller }) func getAllServices() : async [Service] {
    // Public access - anyone can view services
    services.values().toArray();
  };

  public query ({ caller }) func getService(id : Nat) : async ?Service {
    // Public access - anyone can view service details
    services.get(id);
  };

  public shared ({ caller }) func addService(name : Text, description : Text, priceBasic : Nat, pricePro : Nat, pricePremium : Nat) : async Nat {
    if (not isAdminRole(caller)) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };

    let service : Service = {
      id = nextServiceId;
      name;
      description;
      priceBasic;
      pricePro;
      pricePremium;
    };
    services.add(nextServiceId, service);
    let id = nextServiceId;
    nextServiceId += 1;
    id;
  };

  public shared ({ caller }) func updateService(id : Nat, name : Text, description : Text, priceBasic : Nat, pricePro : Nat, pricePremium : Nat) : async () {
    if (not isAdminRole(caller)) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };

    let service : Service = {
      id;
      name;
      description;
      priceBasic;
      pricePro;
      pricePremium;
    };
    services.add(id, service);
  };

  public shared ({ caller }) func deleteService(id : Nat) : async () {
    if (not isAdminRole(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };
    services.remove(id);
  };

  // Project Management
  public shared ({ caller }) func createProject(clientId : Principal, serviceId : Nat, onboardingData : ?OnboardingData) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    // Admin/Manager can create for any client, Client can only create for themselves
    if (not isManagerRole(caller) and caller != clientId) {
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

    // Admin/Manager can view all, Client can only view their own
    if (not isManagerRole(caller) and caller != clientId) {
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
        // Admin/Manager can view all, Client can only view their own
        if (not isManagerRole(caller) and caller != project.clientId) {
          Runtime.trap("Unauthorized: Can only view your own projects");
        };
        ?project;
      };
      case null { null };
    };
  };

  public shared ({ caller }) func updateProjectStatus(id : Nat, status : Text) : async () {
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can update project status");
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
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can view all projects");
    };
    projects.values().toArray();
  };

  // Order Management
  public shared ({ caller }) func createOrder(projectId : Nat, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    // Verify project ownership
    switch (projects.get(projectId)) {
      case (?project) {
        if (not isManagerRole(caller) and caller != project.clientId) {
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

    // Verify project ownership
    switch (projects.get(projectId)) {
      case (?project) {
        if (not isManagerRole(caller) and caller != project.clientId) {
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

    // Admin/Manager can view all, Client can only view their own
    if (not isManagerRole(caller) and caller != clientId) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().toArray().filter(func(o : Order) : Bool { o.clientId == clientId });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async () {
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can update order status");
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
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can view all leads");
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
        // Only assigned user or manager can update
        let canUpdate = isManagerRole(caller) or (switch (lead.assignedTo) {
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
      };
      case null { Runtime.trap("Lead not found") };
    };
  };

  public shared ({ caller }) func assignLead(leadId : Nat, userId : Principal) : async () {
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can assign leads");
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
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can delete leads");
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
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can view all CRM activities");
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
        // Only assigned user, creator, or manager can update
        let canUpdate = isManagerRole(caller) or activity.createdBy == caller or (switch (activity.assignedTo) {
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

  // Offer Management
  public query ({ caller }) func getAllOffers() : async [Offer] {
    // Public access - anyone can view active offers
    offers.values().toArray();
  };

  public shared ({ caller }) func createOffer(name : Text, discountPercent : Nat, offerType : Text) : async Nat {
    if (not isAdminRole(caller)) {
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
    if (not isAdminRole(caller)) {
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

  // Coupon Management
  public query ({ caller }) func getCoupon(code : Text) : async ?Coupon {
    // Public access - anyone can check coupon validity
    coupons.get(code);
  };

  public shared ({ caller }) func createCoupon(code : Text, discountPercent : Nat, expiresAt : ?Time.Time) : async () {
    if (not isAdminRole(caller)) {
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
    if (not isAdminRole(caller)) {
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

  // Legal Pages Management
  public query ({ caller }) func getAllLegalPages() : async [LegalPage] {
    // Public access - anyone can view legal pages
    legalPages.values().toArray();
  };

  public query ({ caller }) func getLegalPage(id : Nat) : async ?LegalPage {
    // Public access - anyone can view legal pages
    legalPages.get(id);
  };

  public shared ({ caller }) func createLegalPage(title : Text, content : Text) : async Nat {
    if (not isAdminRole(caller)) {
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
    if (not isAdminRole(caller)) {
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
    if (not isManagerRole(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can create notifications");
    };

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
    if (not isAdminRole(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all generator logs");
    };
    generatorLogs.values().toArray();
  };

  // Stripe integration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Added missing isStripeConfigured function
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  // Renamed setStripeConfig to setStripeConfiguration
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not isAdminRole(caller)) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  // Renamed createStripeCheckout to createCheckoutSession
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

  // getStripeSessionStatus function updated to shared
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    let config = switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?c) { c };
    };
    await Stripe.getSessionStatus(config, sessionId, transform);
  };

  // transform function
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
