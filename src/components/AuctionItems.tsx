import React, { useState } from "react";
import Modal from "react-modal";
import { KeyedMutator } from "swr";

import Card from "@/components/Card"; // NEW: use shared Card styling

import { MAX_BID_AMOUNT, MIN_BID_MODIFIER } from "@/lib/constants";
import { fetchRequest } from "@/lib/helpers";

import { Auction, Bid, CharityState } from "@/models/types";

const AuctionCard = ({
  auction,
  bid,
  onClick,
}: {
  auction: Auction;
  bid: Bid;
  onClick: () => void;
}) => {
  const hasBid = !!bid.amount;
  return (
    <Card
      className={`lg:w-48 w-40 h-56 flex flex-col justify-start items-stretch gap-2 lg:m-5 m-2 cursor-pointer transition duration-200 group hover:-translate-y-1 hover:shadow-lg ${
        hasBid ? "border-border" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-extrabold tracking-tight drop-shadow-sm">
          {bid.amount ? `${bid.amount},-` : "—"}
        </div>
      </div>
      <div className="h-px bg-border/60 my-1" />
      <p className="text-sm leading-snug flex-1 text-white/90 line-clamp-4">
        {auction.description}
      </p>
      {hasBid && bid.name && (
        <div
          className="text-xs text-white/60 mt-auto italic truncate"
          title={`Vinner: ${bid.name}`}
        >
          Vinner: <span className="text-white/80 not-italic">{bid.name}</span>
        </div>
      )}
    </Card>
  );
};

interface FormData extends Bid {
  error?: {
    name?: string;
    amount?: number | string; // widen so we can set string error text
  };
}

const AuctionItems = ({
  mutate,
  auctions,
  bids,
}: {
  mutate: KeyedMutator<CharityState>;
  auctions: Auction[];
  bids: Bid[];
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);
  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [success, setSuccess] = useState("");

  const getActiveBidAmount = () =>
    activeAuction
      ? bids.find((bid) => bid.item === activeAuction._id)?.amount ?? 0
      : 0;

  const closeModal = () => {
    clearError();
    setModalOpen(false);
    setActiveAuction(null);
  };

  const openModal = (item: Auction) => {
    setActiveAuction(item);
    setFormData({} as FormData);
    setSuccess("");
    setModalOpen(true);
  };

  const clearError = () => {
    setFormData({ ...formData, error: undefined });
  };

  const validate = (data: FormData) => {
    const currentPrice = getActiveBidAmount() + MIN_BID_MODIFIER;
    clearError();
    if (data.amount == null || isNaN(Number(data.amount))) {
      setFormData({
        ...data,
        error: { ...data.error, amount: "Du må skrive inn et tall" },
      });
      return false;
    }
    if (data.amount < currentPrice) {
      setFormData({
        ...data,
        error: {
          ...data.error,
          amount: `Budet ditt kan ikke være mindre enn ${currentPrice},- kr!`,
        },
      });
      return false;
    } else if (data.amount > MAX_BID_AMOUNT) {
      setFormData({
        ...data,
        error: {
          ...data.error,
          amount: `Budet ditt kan ikke være større enn ${MAX_BID_AMOUNT},- kr!`,
        },
      });
      return false;
    }
    if (!data.name || !data.name.length || data.name.length < 3) {
      setFormData({
        ...data,
        error: {
          ...data.error,
          name: "Navnet må være lenger enn to bokstaver",
        },
      });
      return false;
    }
    return true;
  };

  const bid = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!activeAuction) return;
    if (validate(formData)) {
      const res = await fetchRequest("/api/bid", {
        method: "POST",
        body: {
          ...formData,
          item: activeAuction._id,
          description: activeAuction.description,
        },
      });

      if (res.status == 200) {
        setSuccess(
          `Ditt bud på ${formData.amount} til ${activeAuction.description} ble registrert!`
        );
        await mutate();
      } else {
        setSuccess(
          `Budet ditt gikk ikke gjennom :(\n Feilkode: ${
            res.statusText
          }\u00A0\n Feilmelding: ${(await res.json()).error}`
        );
      }
      setActiveAuction(null);
      clearError();
    }
  };

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "none",
      border: "none",
      padding: 0,
    },
    overlay: {
      backgroundColor: "rgba(20,20,20, 0.70)",
      backdropFilter: "blur(4px)",
    },
  } as const;

  const nextMin = Math.max(
    Math.ceil(getActiveBidAmount() * 1.1),
    getActiveBidAmount() + MIN_BID_MODIFIER
  );

  return (
    <div>
      <div className="text-4xl text-center p-5 font-semibold text-shadow-soft">
        Trykk på et auksjonsobjekt for å by!
      </div>
      <div className="flex flex-row flex-wrap justify-evenly">
        {auctions.map((auction) => (
          <AuctionCard
            key={auction._id}
            auction={auction}
            bid={bids.find((bid) => bid.item === auction._id) ?? ({} as Bid)}
            onClick={() => openModal(auction)}
          />
        ))}
        <Modal
          isOpen={modalOpen}
          shouldCloseOnOverlayClick={true}
          onRequestClose={closeModal}
          style={modalStyles}
          onAfterOpen={activeAuction ? undefined : closeModal}
        >
          <div className="w-xs sm:w-sm md:w-md lg:w-lg xl:w-lg 2xl:w-lg">
            {activeAuction ? (
              <form
                className="bg-bg-card border border-border shadow-lg rounded-xl px-6 pt-6 pb-5 flex flex-col gap-4"
                onSubmit={bid}
              >
                <div className="flex flex-col gap-1">
                  <div className="text-lg font-medium text-white/70">By på</div>
                  <div className="text-2xl text-white font-bold italic leading-tight">
                    {activeAuction.description}
                  </div>
                  <p className="text-sm text-white/60">
                    Nåværende bud:{" "}
                    <span className="text-white/90">
                      {getActiveBidAmount()},-
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <label
                    className="block text-white text-sm font-semibold"
                    htmlFor="name"
                  >
                    Navn
                  </label>
                  <input
                    className="bg-black/30 border border-border rounded px-3 py-2 text-sm w-full outline-none transition"
                    id="name"
                    type="text"
                    placeholder="Ditt ekte navn"
                    value={formData.name || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                    }}
                  />
                  {formData.error && formData.error.name && (
                    <div
                      className="mt-1 text-sm border border-border rounded px-3 py-2"
                      role="alert"
                    >
                      {formData.error.name}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label
                    className="block text-white text-sm font-semibold"
                    htmlFor="email"
                  >
                    E-post
                  </label>
                  <input
                    className="bg-black/30 border border-border focus:ring-0 rounded px-3 py-2 text-sm w-full outline-none transition"
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    placeholder="ola@nordmann.no"
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    className="block text-white text-sm font-semibold"
                    htmlFor="amount"
                  >
                    Pris
                  </label>
                  <input
                    className="bg-black/30 border border-border focus:border-border-accent focus:ring-0 rounded px-3 py-2 text-sm w-full outline-none transition"
                    id="amount"
                    type="number"
                    step="1"
                    min={0}
                    placeholder={String(nextMin)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                  {formData.error && formData.error.amount && (
                    <div
                      className="mt-1 text-sm border border-border rounded px-3 py-2"
                      role="alert"
                    >
                      {formData.error.amount}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-md transition"
                    type="button"
                    onClick={closeModal}
                  >
                    Avbryt
                  </button>
                  <button
                    className="flex-1 hover:brightness-110 text-white bg-green-600 font-semibold py-2 rounded-md shadow transition"
                    type="submit"
                  >
                    Send bud
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col justify-evenly items-center text-center bg-bg-card border border-border rounded-xl p-6 shadow-lg gap-4">
                <p className="text-base text-white font-semibold italic whitespace-pre-line">
                  {success}
                </p>
                <button
                  className="hover:brightness-110 text-white font-semibold py-2 px-5 rounded-md shadow transition"
                  type="button"
                  onClick={closeModal}
                >
                  Lukk
                </button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AuctionItems;
