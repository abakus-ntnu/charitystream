import { inspect } from "node:util";

import { SpleisSync, Vipps } from "@/models/schema.js";

import { parseSpleisCsv } from "@/api/spleisCsv";

const CSV_URL =
  "https://www.spleis.no/api/private/project/518623/rewards-info.csv";

let nextCheckAt = 0;

const claimSync = async () => {
  const now = new Date();
  const delay = 45_000 + Math.random() * 30_000;
  try {
    await SpleisSync.updateOne(
      {
        _id: "spleis",
        nextSyncAt: { $not: { $gt: now } },
        webhookEnabled: { $ne: true },
      },
      { nextSyncAt: new Date(now.getTime() + delay) },
      { upsert: true }
    );
    return true;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return false;
    throw error;
  }
};

const record = (message: string, error?: string) => {
  const now = new Date();
  return SpleisSync.updateOne(
    { _id: "spleis" },
    {
      lastAttemptAt: now,
      lastMessage: message,
      lastError: error ?? null,
      ...(!error && { lastSuccessAt: now }),
    }
  );
};

const describeResponse = (res: Response, body: string) =>
  [
    `HTTP ${res.status} ${res.statusText}`,
    `GET ${CSV_URL}`,
    ...Array.from(res.headers.entries())
      .filter(([name]) => name !== "set-cookie")
      .map(([name, value]) => `${name}: ${value}`),
    "",
    body.slice(0, 3000),
  ].join("\n");

export const syncSpleisIfDue = async () => {
  const token = process.env.SPLEIS_USER_TOKEN;
  if (!token || Date.now() < nextCheckAt) return;
  nextCheckAt = Date.now() + 15_000;
  if (!(await claimSync())) return;

  try {
    const res = await fetch(CSV_URL, {
      headers: { cookie: `spleis-user-token=${token}` },
      cache: "no-store",
    });
    const text = await res.text();
    const donations = res.ok ? parseSpleisCsv(text) : null;
    if (!donations) {
      const page = text.match(/<title>([^<]*)<\/title>/i)?.[1] ?? text;
      const message = `HTTP ${res.status}: ${page
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120)}`;
      console.error(`Spleis sync failed: ${message}`);
      await record(message, describeResponse(res, text));
      return;
    }

    if (donations.length > 0) {
      await Vipps.bulkWrite([
        ...donations.map(({ key, name, message, amount }) => ({
          updateOne: {
            filter: { spleisTransactionId: key },
            update: { $setOnInsert: { name, message, amount } },
            upsert: true,
          },
        })),
        {
          deleteMany: {
            filter: {
              spleisTransactionId: {
                $regex: /^csv:/,
                $nin: donations.map(({ key }) => key),
              },
            },
          },
        },
      ]);
    }
    await record(`${donations.length} donasjoner i CSV`);
  } catch (error) {
    await record(
      String(error),
      inspect(error, { depth: 4 }).slice(0, 3000)
    ).catch(() => {});
    throw error;
  }
};
