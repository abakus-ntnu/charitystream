"use client";

import Link from "next/link";
import useSWR from "swr";

import AuctionItems from "@/components/AuctionItems";

import { fetcher } from "@/lib/helpers";

import { CharityState } from "@/models/types";

const NavBar = () => (
  <div className="w-full p-10">
    <Link href="/">
      <button className="mb-2 mt-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
        ← Tilbake til hovedsiden
      </button>
    </Link>
  </div>
);

export default function AuctionItemsPage() {
  const { data, error, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <NavBar />
      <AuctionItems mutate={mutate} auctions={data.auctions} bids={data.bids} />
    </div>
  );
}
