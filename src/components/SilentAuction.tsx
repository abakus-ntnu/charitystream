import Link from "next/link";

import { Auction, Bid } from "@/models/types";

import styles from "./SilentAuction.module.css";

declare module "react" {
  interface CSSProperties {
    "--duration"?: string;
  }
}

const AuctionCard = ({
  currentBidAmount,
  description,
}: {
  currentBidAmount: number;
  description: string;
}) => {
  return (
    <div className="w-44 md:w-48 flex-shrink-0 snap-start rounded-xl border border-neutral-700/60 bg-neutral-800/60 transition-colors shadow-md m-2 text-center px-3 py-3 flex flex-col justify-between relative overflow-hidden">
      <div className="font-bold text-xl md:text-2xl mb-2 text-red-400 tabular-nums drop-shadow-sm">
        {currentBidAmount},-
      </div>
      <p className="text-xs md:text-sm text-neutral-200 leading-snug line-clamp-4">
        {description}
      </p>
    </div>
  );
};

const SilentAuction = ({
  auctions,
  bids,
}: {
  auctions: Auction[];
  bids: Bid[];
}) => {
  const items = auctions.map((item, index) => (
    <AuctionCard
      key={index}
      description={item.description}
      currentBidAmount={bids.find((bid) => bid.item === item._id)?.amount ?? 0}
    />
  ));

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-lg md:text-xl font-medium mb-4 text-neutral-300 text-center px-2">
        Legg inn bud på{" "}
        <Link
          className="underline decoration-dotted hover:text-red-400 transition-colors"
          href="https://aba.wtf/fest"
          target="_blank"
          rel="noopener noreferrer"
        >
          aba.wtf/fest
        </Link>
      </p>

      <div className={`${styles.wrapper} silent-fade-mask hidden md:flex`}>
        <div
          className={styles.slideshow}
          style={{ "--duration": `${Math.max(items.length, 3) * 3}s` }}
          aria-label="Løpende auksjonsobjekter"
        >
          {items}
          {items}
        </div>
        <span className={styles.fade} />
      </div>
    </div>
  );
};

export default SilentAuction;
