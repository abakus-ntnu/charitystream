import mongoose from "mongoose";
import mongodb from "mongodb";
import Cors from "cors";
import { Vipps } from "../../../models/schema.js";
import { url } from "../state";
import fs from "fs";

const cors = Cors();

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  const { method, headers } = req;

  await runMiddleware(req, res, cors);

  mongoose.connect(url);

  if (headers.password !== process.env.POST_PASSWORD) {
    res.status(401).end();
    return;
  }

  switch (method) {
    case "POST":
      const content: string = req.body;

      const rows = content.split("\n");
      const header = rows.splice(0, 1);

      const operations: mongodb.AnyBulkWriteOperation<{
        name: string;
        amount: number;
      }>[] = [{ deleteMany: { filter: {} } }];

      for (const row of rows) {
        const values = row.split(",");

        const amount = values[6];
        const firstName = values[14];
        const lastName = values[15];

        const vipps = new Vipps({
          name: `${firstName} ${lastName}`,
          amount,
        });

        operations.push({
          insertOne: {
            document: vipps,
          },
        });
      }

      await Vipps.bulkWrite(operations);

      res.status(200).json(await Vipps.count());

      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
