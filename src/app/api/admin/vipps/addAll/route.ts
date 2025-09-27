import mongodb from "mongodb";

import { Vipps } from "@/models/schema.js";

import { authIsValid, connectMongoose } from "@/api/utils";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Password",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  const password = req.headers.get("password") || "";
  if (!authIsValid(password)) {
    return new Response(JSON.stringify("Ugyldig passord :'("), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  await connectMongoose();

  const content = await req.text();
  if (!content) {
    return new Response(JSON.stringify({ error: "Empty body" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const rows = content
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
  if (rows.length === 0) {
    return new Response(JSON.stringify({ count: 0 }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  rows.shift();

  const operations: mongodb.AnyBulkWriteOperation<{
    name: string;
    amount: number;
    message?: string;
  }>[] = [{ deleteMany: { filter: {} } }];

  for (const row of rows) {
    const values = row.split(",");
    const amount = Number(values[6]) || 0;
    const firstName = values[14] || "";
    const lastName = values[15] || "";
    const message = values[16] || "";
    const vippsDoc = {
      name: `${firstName} ${lastName}`.trim(),
      amount,
      message,
    };
    operations.push({
      insertOne: {
        document: vippsDoc,
      },
    });
  }

  await Vipps.bulkWrite(operations);
  const count = await Vipps.countDocuments();

  return new Response(JSON.stringify(count), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
