import { NextRequest, NextResponse } from "next/server";

import { Beer } from "@/models/schema.js";

import { authIsValid, connectMongoose } from "@/api/utils";

const unauthorizedResponse = () =>
  new Response("Ugyldig passord :'(", { status: 401 });

const isAmount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

// Sets the total spent in the bar
export async function POST(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || ""))
    return unauthorizedResponse();
  connectMongoose();
  const body = await request.json();

  if (!isAmount(body.spent)) {
    return NextResponse.json(
      { message: "spent må være et tall, minst 0" },
      { status: 400 }
    );
  }
  const beer = await Beer.findOneAndUpdate(
    {},
    { spent: body.spent },
    { upsert: true, new: true }
  );
  return NextResponse.json(beer);
}

export async function GET(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || ""))
    return unauthorizedResponse();
  connectMongoose();
  const beer = await Beer.findOne({});
  return NextResponse.json({ beer });
}
