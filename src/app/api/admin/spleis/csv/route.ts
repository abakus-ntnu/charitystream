import { NextRequest, NextResponse } from "next/server";

import { SpleisSync } from "@/models/schema.js";

import { importSpleisCsv } from "@/api/spleisSync";
import { authIsValid, connectMongoose } from "@/api/utils";

export async function POST(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") || "")) {
    return new Response("Ugyldig passord :'(", { status: 401 });
  }

  const { csv, source, fetchedAt } = await request.json().catch(() => ({}));
  if (typeof csv !== "string") {
    return NextResponse.json({ message: "Mangler csv" }, { status: 400 });
  }

  connectMongoose();
  if (await SpleisSync.exists({ _id: "spleis", mode: "webhook" })) {
    return NextResponse.json(
      { message: "Webhook er valgt, CSV ignoreres" },
      { status: 409 }
    );
  }

  const result = await importSpleisCsv(
    csv,
    String(source),
    new Date(
      Number.isFinite(fetchedAt) ? Math.min(fetchedAt, Date.now()) : Date.now()
    )
  );
  if (result == null) {
    return NextResponse.json(
      { message: "Filen er ikke en Spleis-CSV" },
      { status: 400 }
    );
  }
  if (result === "empty") {
    return NextResponse.json(
      { message: "Tom CSV ignorert, Spleis-listen er beholdt" },
      { status: 400 }
    );
  }
  if (result === "stale") {
    return NextResponse.json({ ignored: "eldre kopi" });
  }
  return NextResponse.json({ count: result });
}
