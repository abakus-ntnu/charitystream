import { NextRequest, NextResponse } from "next/server";

import { Vipps } from "@/models/schema.js";

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

  const vipps = new Vipps(body);
  await vipps.save();
  return NextResponse.json(vipps);
}
