import { NextRequest } from "next/server";

import { Auction, Bid } from "@/models/schema.js";

import { authIsValid, connectMongoose } from "@/api/utils";

function getPasswordFromHeaders(request: NextRequest) {
  return request.headers.get("password") || "";
}

function unauthorizedResponse() {
  return new Response("Ugyldig passord :'(", { status: 401 });
}

export async function POST(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const body = await request.json();
  const auction = new Auction(body);
  await auction.save();
  return new Response(JSON.stringify(auction), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const body = await request.json();
  await Auction.deleteOne({ _id: body.auctionId });
  await Bid.deleteMany({ item: body.auctionId });
  return new Response(JSON.stringify({ deleted: body.auctionId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
