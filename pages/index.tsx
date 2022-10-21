import useSWR from "swr";
import StretchGoals from "../components/StretchGoals";
import SilentAuction from "../components/SilentAuction";
import Donations from "../components/Donations";
import BeerCounter from "../components/BeerCounter";
import { CharityState } from "../models/types";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error } = useSWR("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const state = data as CharityState;

  return (
    <div className="flex flex-col-reverse md:flex-col md:h-screen justify-evenly">
      <div className="flex flex-col md:flex-row flex-grow items-center m-2 md:m-6">
        <StretchGoals
          stretchGoals={state.stretchGoals}
          totalAmount={state.totalAmount}
        />
        <BeerCounter beerData={state.beer} />
        <Donations donations={state.vipps} topDonor={state.topDonor} />
      </div>
      <SilentAuction auctions={state.auctions} bids={state.bids} />
    </div>
  );
}
