"use client";

import Link from "next/link";
import useSWR from "swr";

import AuctionItems from "@/components/AuctionItems";

import { fetcher } from "@/lib/helpers";

import { CharityState } from "@/models/types";

const NavBar = () => (
  <nav className="w-full max-w-content mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
    <Link href="/" className="logo">
      Abakus<span className="logo__accent">Veldedighetsfest</span>
    </Link>
  </nav>
);

export default function AuctionItemsPage() {
  const { data, error, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error)
    return <div className="p-8 text-center eyebrow">Kunne ikke laste data</div>;
  if (!data)
    return (
      <div className="p-8 text-center eyebrow animate-pulse">Laster...</div>
    );

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="w-full max-w-content mx-auto px-4 md:px-8 pb-10">
        <AuctionItems
          mutate={mutate}
          auctions={data.auctions}
          bids={data.bids}
        />
      </main>
    </div>
  );
}
