import { NextRequest } from "next/server";

import { Beer } from "@/models/schema.js";

import { connectMongoose } from "@/api/utils";

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

  const existingBeer = await Beer.findOne({});
  if (!existingBeer) {
    const beer = new Beer(body);
    await beer.save();
    return new Response(JSON.stringify(beer), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body.count >= 0) {
    await Beer.findOneAndUpdate({}, { count: body.count });
  }
  if (body.price) {
    await Beer.findOneAndUpdate({}, { price: body.price });
  }
  if (body.maxDonation) {
    await Beer.findOneAndUpdate({}, { maxDonation: body.maxDonation });
  }
  const beer = await Beer.findOne({});
  return new Response(JSON.stringify(beer), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const body = await request.json();
  const beer = await Beer.findOne({});
  if (!beer) {
    return new Response(JSON.stringify({ error: "Beer not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const newBeerCount = beer.count + body.count;
  await Beer.findOneAndUpdate({}, { count: newBeerCount });
  const updatedBeer = await Beer.findOne({});
  return new Response(JSON.stringify(updatedBeer), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const beer = await Beer.findOne({});
  return new Response(JSON.stringify({ beer }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
