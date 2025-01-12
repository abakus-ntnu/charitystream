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
    <div
      className="w-48 rounded overflow-hidden shadow-lg m-2 text-center px-3 py-2"
      style={{ background: "#c0392b" }}
    >
      <div className="font-bold text-2xl mb-2">{currentBidAmount},-</div>
      <hr />
      <p className="text-white text-base mt-4 mb-4">{description}</p>
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
    <div className="flex flex-col items-center">
      <p className="text-5xl font-medium w-">Legg inn bud på aba.wtf/fest</p>
      <div className={styles.wrapper}>
        <div
          className={styles.slideshow}
          style={{ "--duration": `${items.length * 2.5}s` }}
        >
          {items}
          {items}
        </div>
        <span className={styles.fade} />
      </div>
      <Link href="/auksjon" className="font-bold">
        <button className="mb-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
          Gå til stilleauksjon
        </button>
      </Link>
    </div>
  );
};

export default SilentAuction;
