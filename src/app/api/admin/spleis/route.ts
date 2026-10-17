import { NextRequest, NextResponse } from "next/server";

import { SpleisSync, Vipps } from "@/models/schema.js";

import { authIsValid, connectMongoose } from "@/api/utils";

const unauthorized = () => new Response("Ugyldig passord :'(", { status: 401 });

export async function GET(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || "")) {
    return unauthorized();
  }
  connectMongoose();
  const sync = await SpleisSync.findById(
    "spleis",
    "-_id mode lastAttemptAt lastSuccessAt lastMessage lastError"
  ).lean();
  return NextResponse.json({
    ...sync,
    mode: sync?.mode ?? "poll",
    tokenSet: !!process.env.SPLEIS_USER_TOKEN,
  });
}

export async function POST(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || "")) {
    return unauthorized();
  }
  const { mode } = await request.json().catch(() => ({}));
  if (!SpleisSync.schema.path("mode").options.enum.includes(mode)) {
    return NextResponse.json(
      { message: "mode må være webhook, poll eller script" },
      { status: 400 }
    );
  }

  connectMongoose();
  await SpleisSync.updateOne(
    { _id: "spleis" },
    { mode, $unset: { nextSyncAt: 1 } },
    { upsert: true }
  );
  if (mode !== "webhook") {
    await Vipps.deleteMany({
      spleisTransactionId: { $exists: true, $not: /^csv:/ },
    });
  }
  return NextResponse.json({ mode });
}
