import mongoose from "mongoose";

import {
  Auction,
  Vipps,
  StreamLink,
  SlidoView,
  StretchGoal,
  Bid,
  AuctionOption,
  Beer,
  MatchingGroup,
} from "../../models/schema.js";

const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const dbname = "Charity";

const getHighestBids = async () => {
  const auctionOptions = await AuctionOption.findOne({});
  const displayNames = { name: auctionOptions.displayWinners ? 1 : undefined };
  return Bid.aggregate([
    // Find the highest bids for each item
    {
      $sort: {
        amount: -1,
      },
    },
    {
      $group: {
        _id: "$item",
        amount: {
          $max: "$amount",
        },
        name: {
          $first: "$name",
        },
      },
    },
    {
      $project: {
        amount: "$amount",
        item: "$_id",
        ...displayNames,
      },
    },
    // Make sure the bids are in the same order every time
    {
      $sort: {
        id: 1,
      },
    },
  ]);
};

const findTopDonors = async () => {
  const a = await Vipps.aggregate([
    { $group: { _id: "$name", amount: { $sum: "$amount" } } },
  ]);

  a.sort((v1, v2) => v2.amount - v1.amount);

  a.forEach((v) => (v.name = v._id));

  return a;
};

// export const url = `mongodb://0.0.0.0:27017/${dbname}?retryWrites=true&w=majority`;
export const url = `mongodb+srv://${username}:${password}@cluster.au8e8.mongodb.net/${dbname}?retryWrites=true&w=majority`;

export default async function handler(_, res) {
  mongoose.connect(url);

  if ((await MatchingGroup.count()) == 0) {
    const s = new MatchingGroup({ fraction: 0.25, max: 25000, name: "AVF" });
    s.save();
  }

  console.log(await MatchingGroup.findOne({}));

  // Get all the state we need for the page
  const [
    vipps,
    streamLink,
    slidoView,
    stretchGoals,
    topDonors,
    auctions,
    bids,
    beer,
    matchingGroup,
  ] = await Promise.all([
    Vipps.find({}),
    StreamLink.findOne().sort({ date: -1 }).limit(1),
    SlidoView.findOne().sort({ date: -1 }).limit(1),
    StretchGoal.find({}).sort("goal"),
    findTopDonors(),
    Auction.find({}),
    getHighestBids(),
    Beer.findOne({}),
    MatchingGroup.findOne({}),
  ]);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  // Find totalAmount using the sum all vipps
  const beerDonation =
    beer && beer.count && beer.price ? beer.count * beer.price : 0;
  const beerMaxDonation = beer && beer.maxDonation ? beer.maxDonation : 0;
  const totalAmount =
    bids.reduce((a, b) => {
      return a + b.amount;
    }, 0) +
    (beerDonation < beerMaxDonation ? beerDonation : beerMaxDonation) +
    vipps.reduce((a, b) => {
      return a + b.amount;
    }, 0);

  res.end(
    JSON.stringify({
      bids,
      auctions,
      totalAmount,
      vipps: vipps.slice(vipps.length - 10, vipps.length),
      streamLink,
      slidoView,
      stretchGoals,
      topDonors,
      beer,
      matchingGroup,
    })
  );
}
