import useSWR from "swr";
import StretchGoals from "../components/StretchGoals";
import SilentAuction from "../components/SilentAuction";
import Vipps from "../components/Vipps";
import styles from "../frontpage.module.css";
import Stream from "../components/Stream";
import Chat from "../components/Chat";
import BeerCounter from "../components/BeerCounter";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error } = useSWR("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <div className={"flex h-screen flex-wrap justify-evenly"}>
        <div className="flex w-screen">
          <StretchGoals
            stretchGoals={data.stretchGoals}
            totalAmount={data.totalAmount}
          />
          <div className={"flex-grow max-w-lg"}>
            <BeerCounter beerCount={data.beerCount.count} />
          </div>
          <div className="flex max-w-full flex-grow justify-center flex-wrap">
            <div className={"flex-grow max-w-lg"}>
              <Vipps items={data.vipps} topDonor={data.topDonor} />
            </div>
          </div>
        </div>
        <div className={"w-screen"}>
          <SilentAuction items={data.auctions} />
        </div>
      </div>
    </>
  );
}
