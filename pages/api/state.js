import mongoose from "mongoose";

import {
  Auction,
  Vipps,
  StreamLink,
  SlidoView,
  StretchGoal,
  Bid,
} from "../../models/schema.js";

const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const dbname = "Charity";

export const url = `mongodb+srv://${username}:${password}@cluster.au8e8.mongodb.net/${dbname}?retryWrites=true&w=majority`;
export default async function handler(_, res) {
  mongoose.connect(url);

  // Get all the state we need for the page
  const [vipps, streamLink, slidoView, stretchGoals, topDonor, auctions] =
    await Promise.all([
      Vipps.find({}),
      StreamLink.findOne().sort({ date: -1 }).limit(1),
      SlidoView.findOne().sort({ date: -1 }).limit(1),
      StretchGoal.find({}).sort("goal"),
      Vipps.findOne({}).sort({ amount: -1 }).limit(1),
      Bid.aggregate([
        {
          $group: {
            _id: "$item",
            amount: {
              $max: "$amount",
            },
          },
        },
        {
          $lookup: {
            from: "auctions",
            localField: "_id",
            foreignField: "id",
            as: "auctions",
          },
        },
        {
          $unwind: "$auctions",
        },
        {
          $project: {
            price: "$amount",
            description: "$auctions.description",
            id: "$auctions.id",
            _id: 0,
          },
        },
        {
          $sort: {
            id: 1,
          },
        },
      ]),
    ]);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  // Find totalAmount using the sum all vipps
  const totalAmount = vipps.reduce((a, b) => {
    return a + b.amount;
  }, 0);

  res.end(
    JSON.stringify({
      auctions,
      totalAmount,
      vipps: vipps.slice(vipps.length - 7, vipps.length),
      streamLink,
      slidoView,
      stretchGoals,
      topDonor,
    })
  );
}
