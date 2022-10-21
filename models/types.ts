export interface Auction {
  _id: string;
  description: string;
}

export interface Donation {
  _id: string;
  name: string;
  amount: number;
}

export interface StretchGoal {
  _id: string;
  description: string;
  goal: number;
}

export interface Bid {
  name: string;
  email: string;
  item: string;
  amount: number;
}

export interface BeerData {
  count: number;
  price: number;
  maxDonation: number;
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
  topDonor: Donation;
  totalAmount: number;
  vipps: Donation[];
}
