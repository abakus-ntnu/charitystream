import { StretchGoal } from "../../models/schema.js";
import { authIsValid, connectMongoose } from "./utils";

export default async function handler(req, res) {
  const { method, headers } = req;

  // Require auth for all endpoints
  if (!authIsValid(headers.password, res)) return;

  connectMongoose();

  switch (method) {
    case "POST":
      const stretchGoal = new StretchGoal(req.body);
      await stretchGoal.save();
      res.status(200).json(stretchGoal);
      break;
    case "DELETE": {
      await StretchGoal.deleteOne({ _id: req.body.goalId });
      res.status(200).json({ deleted: req.body.goalId });
      break;
    }
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
