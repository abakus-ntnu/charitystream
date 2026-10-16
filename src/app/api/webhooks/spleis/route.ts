import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

import { Vipps } from "@/models/schema.js";

import { connectMongoose } from "@/api/utils";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

const secretIsValid = (secret: string | null) => {
  const expected = process.env.SPLEIS_WEBHOOK_SECRET;
  if (!expected || !secret) return false;
  return timingSafeEqual(sha256(secret), sha256(expected));
};

export async function POST(request: NextRequest) {
  if (!secretIsValid(request.nextUrl.searchParams.get("secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { name, message, amount, transactionId } = body ?? {};
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof transactionId !== "string" ||
    !transactionId
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  connectMongoose();
  await Vipps.init();

  try {
    // We assume the amount is in kroner not øre
    // Additionally, there was no info in spleis guide about the datatypes
    // so we assume worst case
    await Vipps.create({
      name: typeof name === "string" ? name.slice(0, 100) : "",
      message: typeof message === "string" ? message.slice(0, 500) : "",
      amount,
      spleisTransactionId: transactionId,
    });
  } catch (error) {
    const { code, keyPattern } = error as {
      code?: number;
      keyPattern?: Record<string, unknown>;
    };
    if (code === 11000 && keyPattern?.spleisTransactionId) {
      return NextResponse.json({ duplicate: true });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
