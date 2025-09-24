"use client";

import useSWR from "swr";

import BeerCounter from "@/components/BeerCounter";
import Donations from "@/components/Donations";
import SilentAuction from "@/components/SilentAuction";
import StretchGoals from "@/components/StretchGoals";

import { fetcher } from "@/lib/helpers";

import { CharityState } from "@/models/types";

const MadeByWebkom = () => (
  <p className="absolute bottom-0 right-0 text-3xl">
    Laget med ☕ av Webkom{"<"}3{" "}
  </p>
);

export default function Page() {
  const { data, error } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const calculateMatch = () =>
    Math.min(
      Math.floor(data.totalAmount * data.matchingGroup.fraction),
      data.matchingGroup.max
    );

  const maxIsReached =
    data.matchingGroup && data.matchingGroup.max == calculateMatch();

  return (
    <div className="flex flex-col-reverse md:flex-col md:h-screen justify-evenly">
      <p className="text-5xl font-medium w-full text-center p-3">
        Totalt donert: {data.totalAmount}kr
        {data.matchingGroup && (
          <>
            {" "}
            | {data.matchingGroup.name} matcher{" "}
            {maxIsReached
              ? `til ${data.totalAmount + calculateMatch() + 6097}kr!`
              : `hver ${Math.round(
                  1 / data.matchingGroup.fraction
                )}. krone -> ${data.totalAmount + calculateMatch()}kr`}
          </>
        )}
      </p>
      <div className="flex flex-col md:flex-row flex-grow items-center m-2 md:m-6">
        <StretchGoals
          stretchGoals={data.stretchGoals}
          totalAmount={data.totalAmount}
          matchingGroup={data.matchingGroup}
        />
        <BeerCounter beerData={data.beer} />
        <Donations donations={data.vipps} topDonor={data.topDonors[0]} />
      </div>
      <SilentAuction auctions={data.auctions} bids={data.bids} />
      <MadeByWebkom />
    </div>
  );
}
