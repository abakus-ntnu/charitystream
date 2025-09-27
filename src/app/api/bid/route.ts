import { NextRequest } from "next/server";

import { MAX_BID_AMOUNT, MIN_BID_MODIFIER } from "@/lib/constants";

import { AuctionOption, Bid } from "@/models/schema.js";

import { connectMongoose } from "@/api/utils";

export async function POST(request: NextRequest) {
  connectMongoose();
  const body = await request.json();
  const auctionOptions = await AuctionOption.findOne({});
  if (auctionOptions?.freezeBidding) {
    return new Response(JSON.stringify({ error: `Auction has ended!` }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  const bid = new Bid(body);
  const highestBid = await Bid.findOne({ item: bid.item })
    .sort({ amount: -1 })
    .limit(1);
  if (bid.amount > MAX_BID_AMOUNT || bid.amount <= 0) {
    return new Response(
      JSON.stringify({ error: `Bids must between 0 and ${MAX_BID_AMOUNT} kr` }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  } else if (highestBid && bid.amount < highestBid.amount + MIN_BID_MODIFIER) {
    return new Response(
      JSON.stringify({
        error: `Bid must be greater than current highest bid plus the minimum bid modifier: ${
          highestBid.amount + MIN_BID_MODIFIER
        } kr`,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  } else {
    await bid.save();
    return new Response(JSON.stringify(bid), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: NextRequest) {
  connectMongoose();
  const body = await request.json();
  const highestBid = await Bid.findOne({ item: body.auctionId })
    .sort({ amount: -1 })
    .exec();
  if (highestBid) {
    await highestBid.remove();
  }
  return new Response(`Deleted highest bid for item ${body.item}`, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
