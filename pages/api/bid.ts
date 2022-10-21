import mongoose from "mongoose";
import { Bid, AuctionOption } from "../../models/schema.js";
import { url } from "./state";
import { MAX_BID_AMOUNT, MIN_BID_MODIFIER } from "../../lib/constants";

export default async function handler(req, res) {
  const { method, headers } = req;

  mongoose.connect(url);

  switch (method) {
    case "POST":
      const auctionOptions = await AuctionOption.findOne({});
      if (auctionOptions.freezeBidding) {
        res.status(403).json({ error: `Auction has ended!` });
        break;
      }
      const bid = new Bid(req.body);
      const highestBid = await Bid.findOne({ item: bid.item })
        .sort({ amount: -1 })
        .limit(1);
      if (bid.amount > MAX_BID_AMOUNT || bid.amount <= 0) {
        res
          .status(403)
          .json({ error: `Bids must between 0 and ${MAX_BID_AMOUNT} kr` });
      } else if (
        highestBid &&
        bid.amount < highestBid.amount + MIN_BID_MODIFIER
      ) {
        res.status(403).json({
          error: `Bid must be greater than current highest bid plus the minimum bid modifier: ${
            highestBid.amount + MIN_BID_MODIFIER
          } kr`,
        });
      } else {
        await bid.save();
        res.status(200).json(bid);
      }
      break;
    case "DELETE": {
      if (headers.password !== process.env.POST_PASSWORD) {
        res.status(401).end();
        return;
      }
      Bid.findOne({ item: req.body.auctionId })
        .sort({ amount: -1 })
        .exec(function (err, doc) {
          doc.remove();
        });

      res.status(200).end(`Deleted highest bid for item ${req.body.item}`);
      break;
    }
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
