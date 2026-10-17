import { after, NextRequest, NextResponse } from "next/server";

import { HS_MATCH_LIMIT } from "@/lib/constants";

import {
  Auction,
  Beer,
  SlidoView,
  StreamLink,
  StretchGoal,
  Vipps,
} from "@/models/schema.js";

import { getHighestBids } from "@/api/highestBids";
import { syncSpleisIfDue } from "@/api/spleisSync";
import { connectMongoose } from "@/api/utils";

const findTopDonors = () =>
  Vipps.aggregate([
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
  ]);

const sumVipps = async () => {
  const [sum] = await Vipps.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return sum?.total ?? 0;
};

export async function GET(request: NextRequest) {
  connectMongoose();
  after(syncSpleisIfDue);

  const [
    vipps,
    vippsTotal,
    streamLink,
    slidoView,
    stretchGoals,
    topDonors,
    auctions,
    bids,
    beer,
  ] = await Promise.all([
    Vipps.find().sort({ _id: -1 }).limit(10).lean(),
    sumVipps(),
    StreamLink.findOne().sort({ date: -1 }).limit(1),
    SlidoView.findOne().sort({ date: -1 }).limit(1),
    StretchGoal.find({}).sort("goal"),
    findTopDonors(),
    Auction.find({}),
    getHighestBids(),
    Beer.findOne({}),
  ]);

  const barSpent = beer?.spent ?? 0;
  const hsMatch = Math.min(barSpent, HS_MATCH_LIMIT);
  const totalAmount =
    bids.reduce((a, b) => a + b.amount, 0) + hsMatch + vippsTotal;

  return NextResponse.json({
    bids,
    auctions,
    totalAmount,
    vipps: vipps.reverse(),
    streamLink,
    slidoView,
    stretchGoals,
    topDonors,
    beer: { spent: barSpent, hsMatch },
  });
}
