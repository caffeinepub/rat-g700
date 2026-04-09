import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type Item = {
    id : Nat;
    name : Text;
    quantity : Nat;
    cost : ?Float;
    notes : ?Text;
  };

  module Item {
    public func compareByQuantity(item1 : Item, item2 : Item) : Order.Order {
      Nat.compare(item1.quantity, item2.quantity);
    };
  };

  public type Build = {
    id : Nat;
    name : Text;
    description : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    items : [Item];
  };

  module Build {
    public func compare(build1 : Build, build2 : Build) : Order.Order {
      Int.compare(build1.createdAt, build2.createdAt);
    };

    public func compareByName(build1 : Build, build2 : Build) : Order.Order {
      Text.compare(build1.name, build2.name);
    };
  };

  public type BuildData = {
    name : Text;
    description : Text;
  };

  public type Metadata = {
    description : Text;
    definitionBuild : Text;
  };

  public type SortDirection = {
    #asc;
    #desc;
  };

  public type UserProfile = {
    name : Text;
  };

  var buildIdCounter = 0;
  var itemIdCounter = 0;

  let builds = Map.empty<Principal, Map.Map<Nat, Build>>();
  let metaData = Map.empty<Principal, Metadata>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
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

  public shared ({ caller }) func setMetadata(metadata : Metadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set metadata");
    };
    metaData.add(caller, metadata);
  };

  public query ({ caller }) func getMetadata() : async ?Metadata {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access metadata");
    };
    metaData.get(caller);
  };

  public shared ({ caller }) func createBuild(data : BuildData) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create builds");
    };

    let buildId = buildIdCounter;
    buildIdCounter += 1;

    let newBuild = {
      id = buildId;
      name = data.name;
      description = data.description;
      createdAt = Time.now();
      updatedAt = Time.now();
      items = [];
    };

    let userBuilds = switch (builds.get(caller)) {
      case (null) { Map.empty<Nat, Build>() };
      case (?existing) { existing };
    };

    userBuilds.add(buildId, newBuild);
    builds.add(caller, userBuilds);

    buildId;
  };

  public shared ({ caller }) func updateBuild(buildId : Nat, data : BuildData, clearItems : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update builds");
    };

    let userBuilds = builds.get(caller);

    switch (userBuilds) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?userBuilds) {
        let build = userBuilds.get(buildId);

        switch (build) {
          case (null) {
            Runtime.trap("Build with id " # buildId.toText() # " not found");
          };
          case (?build) {
            let updatedBuild = {
              build with
              name = data.name;
              description = data.description;
              updatedAt = Time.now();
              items = if (clearItems) { [] } else {
                build.items;
              };
            };
            userBuilds.add(buildId, updatedBuild);
            builds.add(caller, userBuilds);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteBuild(buildId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete builds");
    };

    switch (builds.get(caller)) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?userBuilds) {
        if (not userBuilds.containsKey(buildId)) {
          Runtime.trap("Build with id " # buildId.toText() # " not found");
        };
        userBuilds.remove(buildId);
        builds.add(caller, userBuilds);
      };
    };
  };

  public query ({ caller }) func getBuild(buildId : Nat) : async ?Build {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access builds");
    };

    switch (builds.get(caller)) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?userBuilds) {
        userBuilds.get(buildId);
      };
    };
  };

  public query ({ caller }) func getBuilds() : async [Build] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access builds");
    };

    switch (builds.get(caller)) {
      case (null) { [] };
      case (?userBuilds) { userBuilds.values().toArray() };
    };
  };

  public query ({ caller }) func getBuildsSortedByName(direction : SortDirection) : async [Build] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access builds");
    };

    switch (builds.get(caller)) {
      case (null) { [] };
      case (?userBuilds) {
        let sorted = userBuilds.values().toArray().sort(Build.compareByName);
        switch (direction) {
          case (#asc) { sorted };
          case (#desc) { sorted.reverse() };
        };
      };
    };
  };

  public query ({ caller }) func getBuildsSortedByCreatedAt(direction : SortDirection) : async [Build] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access builds");
    };

    switch (builds.get(caller)) {
      case (null) { [] };
      case (?userBuilds) {
        let sorted = userBuilds.values().toArray().sort();
        switch (direction) {
          case (#asc) { sorted };
          case (#desc) { sorted.reverse() };
        };
      };
    };
  };

  public query ({ caller }) func getBuildsSortedByUpdatedAt(direction : SortDirection) : async [Build] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access builds");
    };

    switch (builds.get(caller)) {
      case (null) { [] };
      case (?userBuilds) {
        let buildsArray = userBuilds.values().toArray();
        let sortedArray = buildsArray.sort(
          func(a, b) {
            let timeCompare = Int.compare(a.updatedAt, b.updatedAt);
            switch (timeCompare) {
              case (#equal) {
                return Nat.compare(a.id, b.id);
              };
              case (_) {
                return timeCompare;
              };
            };
          }
        );
        switch (direction) {
          case (#asc) { sortedArray };
          case (#desc) { sortedArray.reverse() };
        };
      };
    };
  };

  public shared ({ caller }) func addItem(buildId : Nat, item : Item) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items");
    };

    let buildOpt = switch (builds.get(caller)) {
      case (null) { null };
      case (?userBuilds) { userBuilds.get(buildId) };
    };

    switch (buildOpt) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?build) {
        let newItem = {
          item with
          id = itemIdCounter;
        };
        itemIdCounter += 1;

        let updatedItems = build.items.concat([newItem]);
        let updatedBuild = {
          build with
          items = updatedItems;
          updatedAt = Time.now();
        };
        switch (builds.get(caller)) {
          case (null) { Runtime.trap("Build with id " # buildId.toText() # " not found") };
          case (?userBuilds) {
            userBuilds.add(buildId, updatedBuild);
            builds.add(caller, userBuilds);
          };
        };
        newItem.id;
      };
    };
  };

  public shared ({ caller }) func removeItem(buildId : Nat, itemId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items");
    };

    let buildOpt = switch (builds.get(caller)) {
      case (null) { null };
      case (?userBuilds) { userBuilds.get(buildId) };
    };

    switch (buildOpt) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?build) {
        if (not build.items.any(func(item) { item.id == itemId })) {
          Runtime.trap("Item with id " # itemId.toText() # " not found");
        };
        let filteredItems = build.items.filter(func(item) { item.id != itemId });
        let updatedBuild = {
          build with
          items = filteredItems;
          updatedAt = Time.now();
        };
        switch (builds.get(caller)) {
          case (null) { Runtime.trap("Build with id " # buildId.toText() # " not found") };
          case (?userBuilds) {
            userBuilds.add(buildId, updatedBuild);
            builds.add(caller, userBuilds);
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateItem(buildId : Nat, itemId : Nat, updatedItem : Item) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update items");
    };

    let buildOpt = switch (builds.get(caller)) {
      case (null) { null };
      case (?userBuilds) { userBuilds.get(buildId) };
    };

    switch (buildOpt) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?build) {
        if (not build.items.any(func(item) { item.id == itemId })) {
          Runtime.trap("Item with id " # itemId.toText() # " not found");
        };
        let updatedItems = build.items.map(
          func(item) {
            if (item.id == itemId) {
              updatedItem;
            } else {
              item;
            };
          }
        );
        let updatedBuild = {
          build with
          items = updatedItems;
          updatedAt = Time.now();
        };
        switch (builds.get(caller)) {
          case (null) { Runtime.trap("Build with id " # buildId.toText() # " not found") };
          case (?userBuilds) {
            userBuilds.add(buildId, updatedBuild);
            builds.add(caller, userBuilds);
          };
        };
      };
    };
  };

  public query ({ caller }) func getItems(buildId : Nat) : async ?[Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access items");
    };

    switch (builds.get(caller)) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?userBuilds) {
        switch (userBuilds.get(buildId)) {
          case (null) {
            Runtime.trap("Build with id " # buildId.toText() # " not found");
          };
          case (?build) {
            ?build.items;
          };
        };
      };
    };
  };

  public query ({ caller }) func getItemsSortedByQuantity(buildId : Nat, direction : SortDirection) : async ?[Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access items");
    };

    switch (builds.get(caller)) {
      case (null) {
        Runtime.trap("Build with id " # buildId.toText() # " not found");
      };
      case (?userBuilds) {
        switch (userBuilds.get(buildId)) {
          case (null) {
            Runtime.trap("Build with id " # buildId.toText() # " not found");
          };
          case (?build) {
            let sortedItems = build.items.sort(Item.compareByQuantity);
            let result = switch (direction) {
              case (#asc) { sortedItems };
              case (#desc) { sortedItems.reverse() };
            };
            ?result;
          };
        };
      };
    };
  };
};
