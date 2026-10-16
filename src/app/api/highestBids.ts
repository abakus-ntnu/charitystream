import { AuctionOption, Bid } from "@/models/schema.js";

// The highest bid per auction item. Contact details are for admins only:
// the public sees bidder names just when an admin has chosen to show them.
export const getHighestBids = async ({ admin = false } = {}) => {
  const auctionOptions = await AuctionOption.findOne({});
  const showNames = admin || !!auctionOptions?.displayWinners;
  return Bid.aggregate([
    { $sort: { amount: -1 } },
    {
      $group: {
        _id: "$item",
        amount: { $max: "$amount" },
        name: { $first: "$name" },
        email: { $first: "$email" },
      },
    },
    {
      $project: {
        amount: 1,
        item: "$_id",
        ...(showNames && { name: 1 }),
        ...(admin && { email: 1 }),
      },
    },
  ]);
};
