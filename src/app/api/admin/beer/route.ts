import { NextRequest } from "next/server";

import { Beer } from "@/models/schema.js";

import { connectMongoose } from "@/api/utils";

function getPasswordFromHeaders(request: NextRequest) {
  return request.headers.get("password") || "";
}

function unauthorizedResponse() {
  return new Response("Ugyldig passord :'(", { status: 401 });
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const isAmount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

// Sets the total spent in the bar
export async function POST(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const body = await request.json();

  if (!isAmount(body.spent)) {
    return jsonResponse({ message: "spent må være et tall, minst 0" }, 400);
  }
  const beer = await Beer.findOneAndUpdate(
    {},
    { spent: body.spent },
    { upsert: true, new: true }
  );
  return jsonResponse(beer);
}

export async function GET(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const beer = await Beer.findOne({});
  return jsonResponse({ beer });
}
