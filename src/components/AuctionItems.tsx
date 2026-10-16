import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { KeyedMutator } from "swr";

import BidDialog from "@/components/BidDialog";
import GavelArt from "@/components/GavelArt";

import { MIN_BID_MODIFIER } from "@/lib/constants";
import { formatCurrency } from "@/lib/helpers";

import { Auction, Bid, CharityState } from "@/models/types";

const TAG = "px-2 py-0.5 text-xs font-bold uppercase tracking-wide";

const AuctionCard = ({
  auction,
  bid,
  hottest,
  onClick,
}: {
  auction: Auction;
  bid?: Bid;
  hottest: boolean;
  onClick: () => void;
}) => {
  const hasBid = !!bid?.amount;
  const min = (bid?.amount ?? 0) + MIN_BID_MODIFIER;
  return (
    <li className="flex">
      <button
        type="button"
        className="group relative w-full min-h-64 flex flex-col gap-4 p-5 text-left bg-panel cursor-pointer transition duration-200 hover:-translate-y-1 hover:bg-panel-hover hover:shadow-[inset_0_0_0_1px_var(--color-border)] focus-visible:bg-panel-hover focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 motion-reduce:hover:translate-y-0"
        onClick={onClick}
      >
        {hottest && <span className="absolute inset-x-0 top-0 h-1 bg-gold" />}
        <div className="flex items-center justify-between gap-3">
          {hottest && (
            <span className={`${TAG} bg-gold text-ink`}>Mest budt</span>
          )}
          {!hasBid && (
            <span className={`${TAG} bg-green-6/15 text-green-6`}>
              Ingen bud ennå
            </span>
          )}
        </div>

        <p className="m-0 flex-1 text-lg font-bold leading-snug line-clamp-3">
          {auction.description}
        </p>

        <div className="flex flex-col gap-1">
          <span className="eyebrow text-sm">
            {hasBid ? "Høyeste bud" : "Startbud"}
          </span>
          <span
            key={bid?.amount ?? 0}
            className={`text-3xl font-extrabold tabular-nums leading-none origin-left ${
              hasBid ? "text-gold animate-bump" : ""
            }`}
          >
            {formatCurrency(hasBid ? bid.amount : min)}
          </span>
          <span className="text-xs text-text-faint truncate">
            {bid?.name && (
              <>
                Leder: <span className="text-text-dim">{bid.name}</span>
              </>
            )}
          </span>
        </div>

        <div className="flex justify-end pt-3 border-t border-border-dim text-sm">
          <span className="font-bold text-red-5 whitespace-nowrap transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            By nå →
          </span>
        </div>
      </button>
    </li>
  );
};

const AuctionItems = ({
  mutate,
  auctions,
  bids,
}: {
  mutate: KeyedMutator<CharityState>;
  auctions: Auction[];
  bids: Bid[];
}) => {
  const [active, setActive] = useState<Auction | null>(null);

  // Hide the rest of the app from screen readers while the dialog is open
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  const bidFor = (auction: Auction) =>
    bids.find((bid) => bid.item === auction._id);
  const highestBid = Math.max(
    0,
    ...auctions.map((a) => bidFor(a)?.amount ?? 0)
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-[5rem_1fr] md:grid-cols-[9rem_1fr] items-center gap-x-6 gap-y-6 p-5 md:p-8 bg-panel border-t-4 border-gold">
        <span className="block bg-ink-alt">
          <GavelArt />
        </span>
        <div className="flex flex-col gap-2 min-w-0">
          <span className="eyebrow">Stilleauksjon</span>
          <h1 className="m-0 text-2xl md:text-4xl font-extrabold leading-tight">
            By på unike premier
          </h1>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-xl font-extrabold">Premiene</h2>

        <ul className="m-0 p-0 list-none grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {auctions.map((auction) => {
            const bid = bidFor(auction);
            return (
              <AuctionCard
                key={auction._id}
                auction={auction}
                bid={bid}
                hottest={highestBid > 0 && bid?.amount === highestBid}
                onClick={() => setActive(auction)}
              />
            );
          })}
        </ul>
      </section>

      <BidDialog
        auction={active}
        bid={active ? bidFor(active) : undefined}
        onClose={() => setActive(null)}
        onBidPlaced={() => mutate()}
      />
    </div>
  );
};

export default AuctionItems;
