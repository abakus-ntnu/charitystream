import { after, NextRequest, NextResponse } from "next/server";

import { HS_MATCH_LIMIT } from "@/lib/constants";

import {
  Auction,
  Beer,
  SlidoView,
  SpleisSnapshot,
  StreamLink,
  StretchGoal,
  Vipps,
} from "@/models/schema.js";

import { getHighestBids } from "@/api/highestBids";
import { syncSpleisIfDue } from "@/api/spleisSync";
import { connectMongoose } from "@/api/utils";

const donationStats = async () => {
  const [stats] = await Vipps.aggregate([
    {
      $unionWith: {
        coll: SpleisSnapshot.collection.name,
        pipeline: [
          { $unwind: "$donations" },
          { $replaceRoot: { newRoot: "$donations" } },
        ],
      },
    },
    {
      $facet: {
        latest: [{ $sort: { createdAt: -1, _id: -1 } }, { $limit: 10 }],
        total: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
        topDonors: [
          { $match: { name: { $nin: ["", null] } } },
          {
            $group: {
              _id: "$name",
              amount: { $sum: "$amount" },
              firstAt: { $min: "$createdAt" },
            },
          },
          { $sort: { amount: -1, firstAt: 1, _id: 1 } },
          { $limit: 1 },
          { $addFields: { name: "$_id" } },
        ],
      },
    },
  ]);
  return {
    latest: stats.latest,
    total: stats.total[0]?.total ?? 0,
    topDonors: stats.topDonors,
  };
};

export async function GET(request: NextRequest) {
  connectMongoose();
  after(syncSpleisIfDue);

  const [donations, streamLink, slidoView, stretchGoals, auctions, bids, beer] =
    await Promise.all([
      donationStats(),
      StreamLink.findOne().sort({ date: -1 }).limit(1),
      SlidoView.findOne().sort({ date: -1 }).limit(1),
      StretchGoal.find({}).sort("goal"),
      Auction.find({}),
      getHighestBids(),
      Beer.findOne({}),
    ]);

  const barSpent = beer?.spent ?? 0;
  const hsMatch = Math.min(barSpent, HS_MATCH_LIMIT);
  const totalAmount =
    bids.reduce((a, b) => a + b.amount, 0) + hsMatch + donations.total;

  return NextResponse.json({
    bids,
    auctions,
    totalAmount,
    vipps: donations.latest.reverse(),
    streamLink,
    slidoView,
    stretchGoals,
    topDonors: donations.topDonors,
    beer: { spent: barSpent, hsMatch },
  });
}
