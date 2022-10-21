import useSWR from "swr";
import StretchGoals from "../components/StretchGoals";
import SilentAuction from "../components/SilentAuction";
import Donations from "../components/Donations";
import BeerCounter from "../components/BeerCounter";
import { CharityState } from "../models/types";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="flex flex-col-reverse md:flex-col md:h-screen justify-evenly">
      <div className="flex flex-col md:flex-row flex-grow items-center m-2 md:m-6">
        <StretchGoals
          stretchGoals={data.stretchGoals}
          totalAmount={data.totalAmount}
        />
        <BeerCounter beerData={data.beer} />
        <Donations donations={data.vipps} topDonor={data.topDonor} />
      </div>
      <SilentAuction auctions={data.auctions} bids={data.bids} />
    </div>
  );
}
