export interface Auction {
  _id: string;
  description: string;
}

export interface Donation {
  _id: string;
  name: string;
  amount: number;
  message: string;
}

export interface StretchGoal {
  _id: string;
  description: string;
  goal: number;
}

export interface Bid {
  // hidden from the public until an admin chooses to show bidders
  name?: string;
  // only sent to admins
  email?: string;
  item: string;
  amount: number;
}

export interface BeerData {
  // total spent in the bar
  spent: number;
  // what HS adds to the donations: the amount spent, capped at HS_MATCH_LIMIT
  hsMatch: number;
}

export interface AuctionOptions {
  freezeBidding: boolean;
  displayWinners: boolean;
}

export interface CharityState {
  auctions: Auction[];
  beer: BeerData;
  bids: Bid[];
  slidoView: string | null;
  streamLink: string | null;
  stretchGoals: StretchGoal[];
  topDonors: Donation[];
  totalAmount: number;
  vipps: Donation[];
}
