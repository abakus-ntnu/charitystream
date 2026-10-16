"use client";

import useSWR from "swr";

import BeerCounter from "@/components/BeerCounter";
import Card from "@/components/Card";
import CasinoBanner from "@/components/CasinoBanner";
import Donations from "@/components/Donations";
import DonationTotal from "@/components/DonationTotal";
import SilentAuction from "@/components/SilentAuction";
import StretchGoals from "@/components/StretchGoals";

import { fetcher } from "@/lib/helpers";

import { CharityState } from "@/models/types";

export default function Page() {
  const { data, error } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error)
    return <div className="p-8 text-center eyebrow">Kunne ikke laste data</div>;
  if (!data)
    return (
      <div className="p-8 text-center eyebrow animate-pulse">Laster...</div>
    );

  const total = data.totalAmount;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full px-4 md:px-10 pt-6 md:pt-8 flex items-center justify-between gap-4">
        <h1 className="logo m-0">
          Abakus<span className="logo__accent">Veldedighetsfest</span>
        </h1>
      </header>

      <main className="flex-1 flex flex-col gap-6 md:gap-10 w-full px-4 md:px-10 py-6 md:py-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <Card className="lg:col-span-2 md:p-8">
            <DonationTotal total={total} stretchGoals={data.stretchGoals} />
          </Card>
          <Card className="lg:row-span-2 md:p-8">
            <BeerCounter beerData={data.beer} />
          </Card>
          <Card className="flex flex-col">
            <StretchGoals
              stretchGoals={data.stretchGoals}
              totalAmount={total}
            />
          </Card>
          <Card className="flex flex-col">
            <Donations donations={data.vipps} topDonor={data.topDonors[0]} />
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <div className="lg:col-span-2 min-w-0">
            <SilentAuction auctions={data.auctions} bids={data.bids} />
          </div>
          <CasinoBanner />
        </section>
      </main>

      <footer className="w-full text-center p-6 text-[0.85rem] font-semibold text-text-faint">
        Laget med 🍺 av{" "}
        <a
          className="text-text-dim hover:text-text"
          href="https://github.com/webkom"
        >
          Webkom
        </a>
      </footer>
    </div>
  );
}
