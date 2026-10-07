import { NextRequest, NextResponse } from "next/server";

import { getHighestBids } from "@/api/highestBids";
import { authIsValid, connectMongoose } from "@/api/utils";

// The highest bids with the bidders' names and emails, so admins can reach the winners
export async function GET(request: NextRequest) {
  if (!authIsValid(request.headers.get("password") ?? "")) {
    return new Response("Ugyldig passord :'(", { status: 401 });
  }
  connectMongoose();
  return NextResponse.json(await getHighestBids({ admin: true }));
}
