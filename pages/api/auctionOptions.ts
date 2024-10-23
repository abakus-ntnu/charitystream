import { AuctionOption } from "../../models/schema.js";
import { authIsValid, connectMongoose } from "./utils";

export default async function handler(req, res) {
  const { method, headers } = req;

  // Require auth for all endpoints
  if (!authIsValid(headers.password, res)) return;

  connectMongoose();

  switch (method) {
    case "GET":
      let auctionOption = await AuctionOption.findOne({});
      if (!auctionOption) {
        auctionOption = await AuctionOption.create({});
      }
      res.status(200).json(auctionOption);
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
