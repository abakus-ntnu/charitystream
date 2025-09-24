import { NextRequest } from "next/server";

import { AuctionOption } from "@/models/schema.js";

import { authIsValid, connectMongoose } from "@/api/utils";

function getPasswordFromHeaders(request: NextRequest) {
  return request.headers.get("password") || "";
}

function unauthorizedResponse() {
  return new Response("Ugyldig passord :'(", { status: 401 });
}

export async function GET(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  let auctionOption = await AuctionOption.findOne({});
  if (!auctionOption) {
    auctionOption = await AuctionOption.create({});
  }
  return new Response(JSON.stringify(auctionOption), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const body = await request.json();
  await AuctionOption.findOneAndUpdate({}, body);
  const updated = await AuctionOption.findOne({});
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
