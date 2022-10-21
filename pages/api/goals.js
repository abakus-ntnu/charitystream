import mongoose from "mongoose";
import { StretchGoal } from "../../models/schema.js";
import { url } from "./state";

export default async function handler(req, res) {
  const { method, headers } = req;
  mongoose.connect(url);

  if (headers.password !== process.env.POST_PASSWORD) {
    res.status(401).end();
    return;
  }

  switch (method) {
    case "GET": {
      const goals = await StretchGoal.find({});
      res.end(
        JSON.stringify({
          goals,
        })
      );
      break;
    }

    case "POST": {
      if (headers.password !== process.env.POST_PASSWORD) {
        res.status(401).end();
        return;
      }

      StretchGoal.create({
        description: req.body.description,
        goal: req.body.goal,
      });

      res.status(200).json(await StretchGoal.find({}).sort("goal"));
      break;
    }

    case "PATCH": {
      if (headers.password !== process.env.POST_PASSWORD) {
        res.status(401).end();
        return;
      }
      await StretchGoal.findOneAndUpdate(
        { _id: req.body.id },
        { description: req.body.description, goal: req.body.goal }
      );

      res.status(200).json(await StretchGoal.find({}).sort("goal"));
      break;
    }
    case "DELETE": {
      if (headers.password !== process.env.POST_PASSWORD) {
        res.status(401).end();
        return;
      }

      StretchGoal.findOne({ _id: req.body.id }).exec(function (err, doc) {
        doc.remove();
      });

      res.status(200).end(`Deleted goal`);
      break;
    }

    default:
      res.setHeader("Allow", ["DELETE", "POST", "PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
