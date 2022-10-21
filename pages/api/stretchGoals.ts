import mongoose from "mongoose";
import { StretchGoal } from "../../models/schema.js";
import { url } from "./state";

export default async function handler(req, res) {
  const { method, headers } = req;

  if (headers.password !== process.env.POST_PASSWORD) {
    res.status(401).end();
    return;
  }

  mongoose.connect(url);

  switch (method) {
    case "POST":
      const stretchGoal = new StretchGoal(req.body);
      await stretchGoal.save();
      res.status(200).json(stretchGoal);
      break;
    case "DELETE": {
      console.log(req.body.goalId);
      await StretchGoal.deleteOne({ _id: req.body.goalId });
      res.status(200).json({ deleted: req.body.goalId });
      break;
    }
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
