import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type OldService = {
    id : Nat;
    name : Text;
    description : Text;
    priceBasic : Nat;
    pricePro : Nat;
    pricePremium : Nat;
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

  type NewService = {
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
  };

  type OldActor = {
    services : Map.Map<Nat, OldService>;
  };

  type NewActor = {
    services : Map.Map<Nat, NewService>;
  };

  public func run(old : OldActor) : NewActor {
    let newServices = old.services.map<Nat, OldService, NewService>(
      func(_id, oldService) {
        {
          id = oldService.id;
          name = oldService.name;
          description = oldService.description;
          category = "Uncategorized";
          subcategory = "General";
          pricingBasic = { price = oldService.priceBasic; features = [] };
          pricingPro = { price = oldService.pricePro; features = [] };
          pricingPremium = { price = oldService.pricePremium; features = [] };
          features = [];
          settings = {
            isVisible = true;
            isFeatured = false;
            availability = "24/7";
            customMetadata = "";
          };
        };
      }
    );
    { services = newServices };
  };
};
