import { NextRequest, NextResponse } from "next/server";

import { HS_MATCH_LIMIT } from "@/lib/constants";

import {
  Auction,
  Beer,
  MatchingGroup,
  SlidoView,
  StreamLink,
  StretchGoal,
  Vipps,
} from "@/models/schema.js";

import { getHighestBids } from "@/api/highestBids";
import { connectMongoose } from "@/api/utils";

const findTopDonors = async () => {
  const a = await Vipps.aggregate([
    { $group: { _id: "$name", amount: { $sum: "$amount" } } },
  ]);

  a.sort((v1, v2) => v2.amount - v1.amount);

  a.forEach((v) => (v.name = v._id));

  return a;
};

export async function GET(request: NextRequest) {
  connectMongoose();

  if ((await MatchingGroup.count()) == 0) {
    const s = new MatchingGroup({ fraction: 0.25, max: 25000, name: "AVF" });
    s.save();
  }

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

  const barSpent = beer?.spent ?? 0;
  const hsMatch = Math.min(barSpent, HS_MATCH_LIMIT);
  const totalAmount =
    bids.reduce((a, b) => {
      return a + b.amount;
    }, 0) +
    hsMatch +
    vipps.reduce((a, b) => {
      return a + b.amount;
    }, 0);

  return NextResponse.json({
    bids,
    auctions,
    totalAmount,
    vipps: vipps.slice(vipps.length - 10, vipps.length),
    streamLink,
    slidoView,
    stretchGoals,
    topDonors,
    beer: { spent: barSpent, hsMatch, matchLimit: HS_MATCH_LIMIT },
    matchingGroup,
  });
}
