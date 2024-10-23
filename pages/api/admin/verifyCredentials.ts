import { authIsValid } from "@/api/utils";

export default async function handler(req, res) {
  const { method, headers } = req;

  // Require auth for all endpoints
  if (!authIsValid(headers.password, res)) {
    return;
  }

  switch (method) {
    case "POST":
      res.status(200).end("Vellykket");
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
