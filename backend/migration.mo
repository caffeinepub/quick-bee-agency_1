import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; businessName : ?Text }>;
    integrationSettings : Map.Map<Principal, { stripeEnabled : Bool; razorpayEnabled : Bool; webhookUrl : ?Text; automations : { autoWhatsAppReplies : { enabled : Bool; config : Text }; sequenceBuilder : { enabled : Bool; config : Text }; proposalAutoSend : { enabled : Bool; config : Text }; paymentConfirmation : { enabled : Bool; config : Text }; projectOnboarding : { enabled : Bool; config : Text } } }>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; businessName : ?Text }>;
    integrationSettings : Map.Map<Principal, { stripeEnabled : Bool; razorpayEnabled : Bool; webhookUrl : ?Text; automations : { autoWhatsAppReplies : { enabled : Bool; config : Text }; sequenceBuilder : { enabled : Bool; config : Text }; proposalAutoSend : { enabled : Bool; config : Text }; paymentConfirmation : { enabled : Bool; config : Text }; projectOnboarding : { enabled : Bool; config : Text } } }>;
    salesSystemConfigs : Map.Map<Principal, { systemName : Text; description : Text; enabled : Bool; apiEndpoint : Text; apiKey : Text; systemSettings : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      integrationSettings = old.integrationSettings;
      salesSystemConfigs = Map.empty<Principal, { systemName : Text; description : Text; enabled : Bool; apiEndpoint : Text; apiKey : Text; systemSettings : Text }>();
    };
  };
};
