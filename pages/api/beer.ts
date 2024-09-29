import mongoose from "mongoose";

import { Beer } from "../../models/schema.js";
import { url } from "./state";
import { authIsValid } from "./utils";

export default async function handler(req, res) {
  const { method, headers } = req;

  // Require auth for all endpoints
  if (!authIsValid(headers.password, res)) return;

  mongoose.connect(url);

  switch (method) {
    case "POST": {
      if (req.body.count >= 0) {
        await Beer.findOneAndUpdate({}, { count: req.body.count });
      }

      if (req.body.price) {
        await Beer.findOneAndUpdate({}, { price: req.body.price });
      }

      if (req.body.maxDonation) {
        await Beer.findOneAndUpdate({}, { maxDonation: req.body.maxDonation });
      }

      res.status(200).json(await Beer.findOne({}));
      break;
    }

    case "PATCH": {
      const beer = await Beer.findOne({});
      const newBeerCount = beer.count + req.body.count;
      await Beer.findOneAndUpdate({}, { count: newBeerCount });

      res.status(200).json(await Beer.findOne({}));
      break;
    }
    case "GET": {
      const beer = await Beer.findOne({});
      res.end(
        JSON.stringify({
          beer,
        })
      );
      break;
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
