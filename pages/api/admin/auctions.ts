import { Auction, Bid } from "@/models/schema.js";

import { authIsValid, connectMongoose } from "@/pages/api/utils";

export default async function handler(req, res) {
  const { method, headers } = req;

  // Require auth for all endpoints
  if (!authIsValid(headers.password, res)) return;

  connectMongoose();

  switch (method) {
    case "POST":
      const auction = new Auction(req.body);
      await auction.save();
      res.status(200).json(auction);
      break;
    case "DELETE": {
      await Auction.deleteOne({ _id: req.body.auctionId });
      await Bid.deleteMany({ item: req.body.auctionId });
      res.status(200).json({ deleted: req.body.auctionId });
      break;
    }
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
