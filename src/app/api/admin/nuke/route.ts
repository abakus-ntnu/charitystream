import { NextRequest, NextResponse } from "next/server";

import { Auction, Beer, Bid, StretchGoal, Vipps } from "@/models/schema.js";

import { authIsValid, connectMongoose, secretMatches } from "@/api/utils";

const nukeAuctions = () =>
  Promise.all([Auction.deleteMany({}), Bid.deleteMany({})]);

const TARGETS = {
  bids: () => Bid.deleteMany({}),
  auctions: nukeAuctions,
  beer: () => Beer.deleteMany({}),
  all: () =>
    Promise.all([
      Vipps.deleteMany({}),
      nukeAuctions(),
      Beer.deleteMany({}),
      StretchGoal.deleteMany({}),
    ]),
};

export async function POST(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || "")) {
    return new Response("Ugyldig passord :'(", { status: 401 });
  }

  const { target, code } = await request.json().catch(() => ({}));
  if (!secretMatches(code, process.env.NUCLEAR_CODE)) {
    return NextResponse.json({ message: "Feil atomkode" }, { status: 403 });
  }
  if (!Object.hasOwn(TARGETS, target)) {
    return NextResponse.json({ message: "Ukjent mål" }, { status: 400 });
  }

  connectMongoose();
  await TARGETS[target as keyof typeof TARGETS]();
  return NextResponse.json({ nuked: target });
}
