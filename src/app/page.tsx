"use client";

import { useEffect, useState } from "react";
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
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () =>
      setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  if (error)
    return <div className="p-8 text-center eyebrow">Kunne ikke laste data</div>;
  if (!data)
    return (
      <div className="p-8 text-center eyebrow animate-pulse">Laster...</div>
    );

  const total = data.totalAmount;

  return (
    <div
      className="flex flex-col min-h-screen lg:fixed lg:inset-0 lg:min-h-0 lg:items-center lg:justify-center lg:overflow-hidden"
      style={{ "--tv-scale": scale } as React.CSSProperties}
    >
      <div className="flex-1 flex flex-col w-full lg:flex-none lg:w-[1280px] lg:h-[720px] lg:[scale:var(--tv-scale)] lg:px-7 lg:pt-6 lg:pb-3 lg:gap-4">
        <header className="w-full px-4 md:px-10 pt-6 md:pt-8 lg:p-0 flex items-center justify-between gap-4">
          <h1 className="logo m-0">
            Abakus<span className="logo__accent">Veldedighetsfest</span>
          </h1>
        </header>

        <main className="flex-1 grid grid-cols-1 gap-6 w-full px-4 md:px-10 py-6 md:py-8 lg:p-0 lg:min-h-0 lg:grid-cols-3 lg:grid-rows-[147px_56px_1fr_220px] lg:gap-4">
          <Card className="md:p-8 lg:p-4 lg:min-h-0 lg:col-start-2 lg:row-start-1">
            <DonationTotal total={total} stretchGoals={data.stretchGoals} />
          </Card>
          <Card className="md:p-8 lg:p-4 lg:min-h-0 lg:col-start-1 lg:row-start-1 lg:row-span-3">
            <BeerCounter beerData={data.beer} />
          </Card>
          <Card className="flex flex-col lg:p-4 lg:min-h-0 lg:col-start-3 lg:row-start-1 lg:row-span-2">
            <StretchGoals
              stretchGoals={data.stretchGoals}
              totalAmount={total}
            />
          </Card>
          <Card className="flex flex-col lg:p-4 lg:min-h-0 lg:col-start-2 lg:row-start-2 lg:row-span-2">
            <Donations donations={data.vipps} topDonor={data.topDonors[0]} />
          </Card>
          <div className="min-w-0 lg:min-h-0 lg:col-start-1 lg:col-span-2 lg:row-start-4">
            <SilentAuction auctions={data.auctions} bids={data.bids} />
          </div>
          <div className="lg:min-h-0 lg:col-start-3 lg:row-start-3 lg:row-span-2">
            <CasinoBanner />
          </div>
        </main>

        <footer className="w-full text-center p-6 lg:p-0 text-[0.85rem] font-semibold text-text-faint">
          Laget med 🍺 av{" "}
          <a
            className="text-text-dim hover:text-text"
            href="https://github.com/webkom"
          >
            Webkom
          </a>
        </footer>
      </div>
    </div>
  );
}
