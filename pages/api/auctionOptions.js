import mongoose from "mongoose";
import { AuctionOption } from "../../models/schema.js";
import { url } from "./state";

export default async function handler(req, res) {
  const { method, headers } = req;
  mongoose.connect(url);

  if (headers.password !== process.env.POST_PASSWORD) {
    res.status(401).end();
    return;
  }

  switch (method) {
    case "GET":
      res.status(200).json(await AuctionOption.findOne({}));
      break;
    case "POST":
      {
        if (headers.password !== process.env.POST_PASSWORD) {
          res.status(401).end();
          return;
        }
        await AuctionOption.findOneAndUpdate({}, req.body);
        res.status(200).json(await AuctionOption.findOne({}));
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
