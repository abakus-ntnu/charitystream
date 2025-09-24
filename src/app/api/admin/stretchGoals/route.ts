import { NextRequest } from "next/server";

import { StretchGoal } from "@/models/schema.js";

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
  const stretchGoal = new StretchGoal(body);
  await stretchGoal.save();
  return new Response(JSON.stringify(stretchGoal), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: NextRequest) {
  const password = getPasswordFromHeaders(request);
  if (password !== process.env.POST_PASSWORD) return unauthorizedResponse();
  connectMongoose();
  const body = await request.json();
  await StretchGoal.deleteOne({ _id: body.goalId });
  return new Response(JSON.stringify({ deleted: body.goalId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
