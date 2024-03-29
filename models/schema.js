import mongoose from "mongoose";

delete mongoose.connection.models["Auction"];
delete mongoose.connection.models["Vipps"];
delete mongoose.connection.models["StreamLink"];
delete mongoose.connection.models["SlidoView"];
delete mongoose.connection.models["StretchGoal"];
delete mongoose.connection.models["Bid"];
delete mongoose.connection.models["AuctionOption"];
delete mongoose.connection.models["Beer"];
delete mongoose.connection.models["MatchingGroup"];

const AuctionSchema = new mongoose.Schema(
  {
    description: { type: String, default: "NULL" },
  },
  { autoCreate: true }
);
export const Auction = mongoose.model("Auction", AuctionSchema);

const VippsSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    message: { type: String, default: "" },
  },
  { autoCreate: true, timestamps: true }
);
export const Vipps = mongoose.model("Vipps", VippsSchema);

const StreamLinkSchema = new mongoose.Schema(
  {
    link: { type: String, default: "" },
  },
  { autoCreate: true }
);
export const StreamLink = mongoose.model("StreamLink", StreamLinkSchema);

const SlidoViewSchema = new mongoose.Schema(
  {
    type: { type: String, default: "questions" },
  },
  { autoCreate: true }
);
export const SlidoView = mongoose.model("SlidoView", SlidoViewSchema);

const StretchGoalSchema = new mongoose.Schema(
  {
    description: { type: String, default: "" },
    goal: { type: Number, default: 0 },
  },
  { autoCreate: true }
);
export const StretchGoal = mongoose.model("StretchGoal", StretchGoalSchema);

const BidSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    item: { type: String, default: "" },
    amount: { type: Number, default: 0 },
  },
  { autoCreate: true, timestamps: true }
);
export const Bid = mongoose.model("Bid", BidSchema);

const BeerSchema = new mongoose.Schema(
  {
    count: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    maxDonation: { type: Number, default: 20000 },
  },
  { autoCreate: true }
);

export const Beer = mongoose.model("Beer", BeerSchema);

const AuctionOptionSchema = new mongoose.Schema(
  {
    freezeBidding: { type: Boolean, default: false },
    displayWinners: { type: Boolean, default: false },
  },
  { autoCreate: true }
);
export const AuctionOption = mongoose.model(
  "AuctionOption",
  AuctionOptionSchema
);

const MatchingGroupSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    fraction: { type: Number, default: 1 },
    max: { type: Number, default: 1000 },
  },
  { autoCreate: true }
);
export const MatchingGroup = mongoose.model(
  "MatchingGroup",
  MatchingGroupSchema
);
