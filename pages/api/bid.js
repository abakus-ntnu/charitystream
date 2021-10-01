import mongoose from "mongoose";
import { Bid } from "../../models/schema.js";
import { url } from "./state";
import { MAX_BID_AMOUNT } from "../../lib/constants";

export default async function handler(req, res) {
  const { method } = req;

  mongoose.connect(url);

  switch (method) {
    case "POST":
      const bid = new Bid(req.body);
      if (bid.amount > MAX_BID_AMOUNT) {
        res
          .status(403)
          .json({ error: "Bids must between 0 and " + MAX_BID_AMOUNT + " kr" });
      } else {
        await bid.save();
        res.status(200).json(bid);
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
