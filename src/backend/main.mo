import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";

actor {
  type MoodType = {
    #firedUp;
    #chill;
    #chaotic;
    #gaming;
    #drained;
    #happy;
  };

  type MoodEntry = {
    mood : MoodType;
    timestamp : Int;
  };

  module MoodEntry {
    public func compare(entry1 : MoodEntry, entry2 : MoodEntry) : Order.Order {
      Int.compare(entry2.timestamp, entry1.timestamp);
    };
  };

  let moodEntries = List.empty<MoodEntry>();

  public shared ({ caller }) func logMood(mood : MoodType) : async () {
    let entry : MoodEntry = {
      mood;
      timestamp = Time.now();
    };
    moodEntries.add(entry);
  };

  public query ({ caller }) func getMoodHistory() : async [MoodEntry] {
    moodEntries.toArray().sort();
  };
};
