import { NextRequest, NextResponse } from "next/server";

import { SpleisSync, Vipps } from "@/models/schema.js";

import { authIsValid, connectMongoose } from "@/api/utils";

const unauthorized = () => new Response("Ugyldig passord :'(", { status: 401 });

export async function GET(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || "")) {
    return unauthorized();
  }
  connectMongoose();
  const sync = await SpleisSync.findById("spleis");
  return NextResponse.json({ webhookEnabled: !!sync?.webhookEnabled });
}

export async function POST(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || "")) {
    return unauthorized();
  }
  const { webhookEnabled } = await request.json().catch(() => ({}));
  if (typeof webhookEnabled !== "boolean") {
    return NextResponse.json(
      { message: "webhookEnabled må være true eller false" },
      { status: 400 }
    );
  }

  connectMongoose();
  await SpleisSync.updateOne(
    { _id: "spleis" },
    webhookEnabled
      ? { webhookEnabled }
      : { webhookEnabled, $unset: { nextSyncAt: 1 } },
    { upsert: true }
  );
  if (!webhookEnabled) {
    // The CSV is the full list, so webhook rows would be counted twice once it resumes
    await Vipps.deleteMany({
      spleisTransactionId: { $exists: true, $not: /^csv:/ },
    });
  }
  return NextResponse.json({ webhookEnabled });
}
