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

export const syncSpleisIfDue = async () => {
  const token = process.env.SPLEIS_USER_TOKEN;
  if (!token || Date.now() < nextCheckAt) return;
  nextCheckAt = Date.now() + 15_000;
  if (!(await claimSync())) return;

  const res = await fetch(CSV_URL, {
    headers: { cookie: `spleis-user-token=${token}` },
    cache: "no-store",
  });
  const donations = res.ok ? parseSpleisCsv(await res.text()) : null;
  if (!donations) {
    console.error(`Spleis sync failed (${res.status}), cookie expired?`);
    return;
  }
  if (donations.length === 0) return;

  await Vipps.bulkWrite([
    ...donations.map(({ key, name, message, amount }) => ({
      updateOne: {
        filter: { spleisTransactionId: key },
        update: {
          $setOnInsert: { name, message, amount },
        },
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
};
