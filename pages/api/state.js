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
} from "../../models/schema.js";

const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const dbname = "Charity";

const getHighestBids = async () => {
  const auctionOptions = await AuctionOption.findOne({});
  const displayNames = {};
  if (auctionOptions.displayWinners) {
    displayNames.name = 1;
  }
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
        price: "$amount",
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

// export const url = `mongodb://0.0.0.0:27017/${dbname}?retryWrites=true&w=majority`;
export const url = `mongodb+srv://${username}:${password}@cluster.au8e8.mongodb.net/${dbname}?retryWrites=true&w=majority`;

export default async function handler(_, res) {
  mongoose.connect(url);

  // Get all the state we need for the page
  const [
    vipps,
    streamLink,
    slidoView,
    stretchGoals,
    topDonor,
    auctions,
    bids,
    beer,
  ] = await Promise.all([
    Vipps.find({}),
    StreamLink.findOne().sort({ date: -1 }).limit(1),
    SlidoView.findOne().sort({ date: -1 }).limit(1),
    StretchGoal.find({}).sort("goal"),
    Vipps.findOne({}).sort({ amount: -1 }).limit(1),
    Auction.find({}),
    getHighestBids(),
    Beer.findOne({}),
  ]);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  // Find totalAmount using the sum all vipps
  const beerDonation =
    beer && beer.count && beer.price ? beer.count * beer.price : 0;
  const beerMaxDonation = beer && beer.maxDonation ? beer.maxDonation : 0;
  const totalAmount =
    bids.reduce((a, b) => {
      return a + b.price;
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
      topDonor,
      beer,
    })
  );
}
