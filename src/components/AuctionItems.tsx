import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { KeyedMutator } from "swr";

import Button from "@/components/Button";
import Field from "@/components/Field";

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
    <button
      type="button"
      className="group w-full h-56 flex flex-col items-stretch gap-3 p-5 text-left bg-panel cursor-pointer transition-colors hover:bg-panel-hover focus-visible:bg-panel-hover focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
      onClick={onClick}
    >
      <div className="eyebrow">{hasBid ? "Høyeste bud" : "Ingen bud"}</div>
      <div
        className={`text-3xl font-extrabold tabular-nums leading-none ${
          hasBid ? "text-gold" : "text-text-faint"
        }`}
      >
        {hasBid ? `${bid.amount},-` : "—"}
      </div>
      <p className="text-base font-semibold leading-snug flex-1 line-clamp-3 transition-colors group-hover:text-red-5">
        {auction.description}
      </p>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        {hasBid && bid.name ? (
          <span
            className="text-text-faint truncate"
            title={`Vinner: ${bid.name}`}
          >
            Vinner: <span className="text-text-dim">{bid.name}</span>
          </span>
        ) : (
          <span />
        )}
        <span className="font-semibold text-red-5 whitespace-nowrap group-hover:underline">
          By →
        </span>
      </div>
    </button>
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

  // Hide the rest of the app from screen readers while the modal is open
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

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
      borderRadius: 0,
      padding: 0,
      width: "min(calc(100vw - 2rem), 32rem)",
    },
    overlay: {
      backgroundColor: "rgba(17, 17, 17, 0.85)",
      zIndex: 50,
    },
  } as const;

  const nextMin = Math.max(
    Math.ceil(getActiveBidAmount() * 1.1),
    getActiveBidAmount() + MIN_BID_MODIFIER
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="page-title">Trykk på et auksjonsobjekt for å by!</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3">
        {auctions.map((auction) => (
          <AuctionCard
            key={auction._id}
            auction={auction}
            bid={bids.find((bid) => bid.item === auction._id) ?? ({} as Bid)}
            onClick={() => openModal(auction)}
          />
        ))}
      </div>
      <Modal
        isOpen={modalOpen}
        shouldCloseOnOverlayClick={true}
        onRequestClose={closeModal}
        style={modalStyles}
        onAfterOpen={activeAuction ? undefined : closeModal}
      >
        {activeAuction ? (
          <form
            className="bg-panel p-6 flex flex-col gap-5 animate-pop-in"
            onSubmit={bid}
          >
            <div className="flex flex-col gap-1">
              <div className="eyebrow">By på</div>
              <div className="text-2xl font-extrabold leading-tight">
                {activeAuction.description}
              </div>
              <p className="text-sm text-text-faint">
                Nåværende bud:{" "}
                <span className="font-bold text-gold tabular-nums">
                  {getActiveBidAmount()},-
                </span>
              </p>
            </div>
            <Field label="Navn" htmlFor="name" error={formData.error?.name}>
              <input
                className="input"
                id="name"
                type="text"
                placeholder="Ditt ekte navn"
                value={formData.name || ""}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                }}
              />
            </Field>
            <Field label="E-post" htmlFor="email">
              <input
                className="input"
                id="email"
                type="email"
                value={formData.email || ""}
                placeholder="ola@nordmann.no"
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                }}
              />
            </Field>
            <Field label="Pris" htmlFor="amount" error={formData.error?.amount}>
              <input
                className="input tabular-nums"
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
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={closeModal}
              >
                Avbryt
              </Button>
              <Button type="submit" className="flex-1">
                Send bud
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start bg-panel p-6 gap-5 animate-pop-in">
            <p className="text-base font-semibold whitespace-pre-line">
              {success}
            </p>
            <Button variant="secondary" onClick={closeModal}>
              Lukk
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuctionItems;
