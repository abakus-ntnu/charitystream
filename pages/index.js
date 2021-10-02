import useSWR from "swr";
import StretchGoals from "../components/StretchGoals";
import SilentAuction from "../components/SilentAuction";
import Vipps from "../components/Vipps";
import BeerCounter from "../components/BeerCounter";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error } = useSWR("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen justify-evenly">
      <div className="flex flex-grow items-center m-6">
        <StretchGoals
          stretchGoals={data.stretchGoals}
          totalAmount={data.totalAmount}
        />
        <BeerCounter beerCount={data.beerCount.count} />
        <Vipps items={data.vipps} topDonor={data.topDonor} />
      </div>
      <div className="">
        <SilentAuction items={data.auctions} />
      </div>
    </div>
  );
}
