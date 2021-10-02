import mongoose from "mongoose";

import { BeerCount } from "../../models/schema.js";
import { url } from "./state";

export default async function handler(req, res) {
  const { method, headers } = req;

  mongoose.connect(url);

  switch (method) {
    case "POST": {
      if (headers.password !== process.env.POST_PASSWORD) {
        res.status(401).end();
        return;
      }

      await BeerCount.findOneAndUpdate({}, { count: req.body.count });

      res.status(200).json(await BeerCount.findOne({}));
    }

    case "GET":
      {
        const beerCount = await BeerCount.findOne({});
        res.end(
          JSON.stringify({
            beerCount,
          })
        );
      }

      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
