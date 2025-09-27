"use client";

import useSWR from "swr";

import BeerCounter from "@/components/BeerCounter";
import Card from "@/components/Card";
import Donations from "@/components/Donations";
import SilentAuction from "@/components/SilentAuction";
import StretchGoals from "@/components/StretchGoals";

import { fetcher, formatCurrency } from "@/lib/helpers";

import { CharityState } from "@/models/types";

export default function Page() {
  const { data, error } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error)
    return <div className="p-8 text-center">Kunne ikke laste data</div>;
  if (!data)
    return <div className="p-8 text-center animate-pulse">Laster...</div>;

  const calculateMatch = () => {
    if (!data.matchingGroup) return 0;
    return Math.min(
      Math.floor(data.totalAmount * data.matchingGroup.fraction),
      data.matchingGroup.max
    );
  };

  const totalWithMatch = data.totalAmount + calculateMatch();
  const matchDenom = data.matchingGroup?.fraction
    ? Math.round(1 / data.matchingGroup.fraction)
    : 0;

  return (
    <div className="flex flex-col min-h-screen justify-between md:justify-start relative">
      <header className="w-full px-4 md:px-10 pt-6 md:pt-10 flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-shadow-soft">
          Abakus Veldedighetsfest
        </h1>
        <Card className="w-full flex flex-col items-center gap-6 py-6">
          <div className="flex flex-row flex-wrap justify-center items-start gap-10">
            <div className="flex flex-col items-center min-w-[140px]">
              <p className="uppercase tracking-wide text-xs text-neutral-400 mb-1">
                Totalt donert
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(data.totalAmount)}
              </p>
            </div>
            {data.matchingGroup && (
              <div className="flex flex-col items-center min-w-[160px]">
                <p className="uppercase tracking-wide text-xs text-neutral-400 mb-1">
                  {data.matchingGroup.name} matcher hver {matchDenom} krone
                </p>
                <p className="text-3xl font-semibold">
                  {formatCurrency(calculateMatch())}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center">
            <p className="uppercase tracking-wide text-xs text-neutral-400 mb-1">
              Totalt
            </p>
            <p className="text-4xl md:text-5xl font-semibold">
              {formatCurrency(totalWithMatch)}
            </p>
          </div>
        </Card>
      </header>

      <main className="flex flex-col gap-8 md:gap-12 px-4 md:px-10 py-6 md:py-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          <Card className="col-span-1 flex flex-col">
            <div className="text-sm uppercase tracking-wide text-neutral-400 mb-1 font-semibold">
              Stretch goals
            </div>
            <StretchGoals
              stretchGoals={data.stretchGoals}
              totalAmount={data.totalAmount}
              matchingGroup={data.matchingGroup}
            />
          </Card>
          <div className="col-span-1 flex flex-col items-center justify-center">
            <BeerCounter beerData={data.beer} />
          </div>
          <Card className="col-span-1 flex flex-col">
            <Donations donations={data.vipps} topDonor={data.topDonors[0]} />
          </Card>
        </section>

        <section className="max-w-7xl mx-auto w-full">
          <Card className="w-full">
            <SilentAuction auctions={data.auctions} bids={data.bids} />
          </Card>
        </section>
      </main>

      <footer className="w-full text-center py-6 text-sm text-neutral-500">
        Laget med 🍺 av Webkom
      </footer>
    </div>
  );
}
