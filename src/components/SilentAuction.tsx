import GavelArt from "@/components/GavelArt";

import { formatCurrency } from "@/lib/helpers";

import { Auction, Bid } from "@/models/types";

import styles from "./SilentAuction.module.css";

declare module "react" {
  interface CSSProperties {
    "--duration"?: string;
  }
}

const BID_URL = "https://aba.wtf/fest";

// Enough cards per loop to fill wide screens without gaps
const MIN_CARDS_PER_LOOP = 8;
const SECONDS_PER_CARD = 5;

const AuctionCard = ({
  auction,
  bid,
  hottest,
}: {
  auction: Auction;
  bid?: Bid;
  hottest: boolean;
}) => {
  const hasBid = !!bid?.amount;
  return (
    <li className="w-60 min-h-40 lg:w-56 lg:min-h-0 flex-shrink-0 flex flex-col gap-2 lg:gap-1 p-4 lg:p-3 bg-ink-alt relative">
      {hottest && <span className="absolute inset-y-0 left-0 w-1 bg-gold" />}
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow lg:text-sm">
          {hasBid ? "Høyeste bud" : "Ingen bud ennå"}
        </span>
        {hottest && (
          <span className="eyebrow lg:text-sm text-gold">Mest bydd</span>
        )}
      </div>
      <div
        key={bid?.amount ?? 0}
        className={`text-2xl lg:text-xl font-extrabold tabular-nums leading-none ${
          hasBid
            ? "text-gold animate-bump origin-left"
            : "text-text-faint lg:hidden"
        }`}
      >
        {hasBid ? formatCurrency(bid.amount) : "—"}
      </div>
      <p className="m-0 flex-1 lg:flex-none text-sm lg:text-base font-semibold leading-snug line-clamp-2">
        {auction.description}
      </p>
      <div
        className={`text-xs text-text-faint truncate ${
          bid?.name ? "" : "lg:hidden"
        }`}
      >
        {bid?.name ? (
          <>
            Leder: <span className="text-text-dim">{bid.name}</span>
          </>
        ) : (
          !hasBid && "Bli den første til å by!"
        )}
      </div>
    </li>
  );
};

const SilentAuction = ({
  auctions,
  bids,
}: {
  auctions: Auction[];
  bids: Bid[];
}) => {
  const bidFor = (auction: Auction) =>
    bids.find((bid) => bid.item === auction._id);
  const highestBid = Math.max(
    0,
    ...auctions.map((a) => bidFor(a)?.amount ?? 0)
  );

  const repeats = Math.ceil(MIN_CARDS_PER_LOOP / Math.max(auctions.length, 1));
  const loop = Array.from({ length: repeats }, () => auctions).flat();
  const renderLoop = (copy: number) =>
    loop.map((auction, i) => {
      const bid = bidFor(auction);
      return (
        <AuctionCard
          key={`${copy}-${i}`}
          auction={auction}
          bid={bid}
          hottest={highestBid > 0 && bid?.amount === highestBid}
        />
      );
    });

  return (
    <div className="flex flex-col gap-6 lg:gap-3 h-full p-5 md:p-6 lg:p-4 bg-panel">
      <div className="grid grid-cols-[5rem_1fr] md:grid-cols-[7rem_1fr_auto] lg:grid-cols-[3.25rem_1fr_auto] items-center gap-x-6 lg:gap-x-4 gap-y-4">
        <span className="block bg-ink-alt">
          <GavelArt />
        </span>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="eyebrow">Stilleauksjon</span>
          <h2 className="m-0 text-xl md:text-2xl font-extrabold">
            By på unike premier
          </h2>
        </div>
        <a
          className="col-span-2 md:col-span-1 justify-self-start md:justify-self-end button button--gold no-underline whitespace-nowrap"
          href={BID_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          By på aba.wtf/fest →
        </a>
      </div>

      {auctions.length === 0 ? (
        <p className="m-0 text-sm text-text-faint">
          Auksjonsobjektene kommer snart!
        </p>
      ) : (
        <div className={styles.viewport}>
          <div
            className={styles.track}
            style={{ "--duration": `${loop.length * SECONDS_PER_CARD}s` }}
          >
            <ul className={styles.set} aria-label="Auksjonsobjekter">
              {renderLoop(0)}
            </ul>
            <ul className={styles.set} aria-hidden="true">
              {renderLoop(1)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SilentAuction;
