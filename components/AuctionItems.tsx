import { useState } from "react";
import Modal from "react-modal";
import { KeyedMutator } from "swr";

import { MAX_BID_AMOUNT, MIN_BID_MODIFIER } from "@/lib/constants";
import { fetchRequest } from "@/lib/helpers";

import { Auction, Bid, CharityState } from "@/models/types";

Modal.setAppElement("#__next");

const AuctionCard = ({
  auction,
  bid,
  onClick,
}: {
  auction: Auction;
  bid: Bid;
  onClick: () => void;
}) => {
  return (
    <div
      className="lg:w-48 w-40 rounded overflow-hidden shadow-lg lg:m-5 m-2 text-center px-3 py-2 cursor-pointer hover:bg-gray-600 bg-gray-800"
      onClick={onClick}
    >
      <div className="font-bold text-xl mb-2">{bid.amount},-</div>
      <hr />
      <p className="text-white text-base mb-8">{auction.description}</p>
      {bid.name && <b>Vinner: {bid.name}</b>}
    </div>
  );
};

interface FormData extends Bid {
  error: {
    name?: string;
    amount?: number;
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
  const [activeAuction, setActiveAuction] = useState<Auction>(null);
  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [success, setSuccess] = useState("");

  const getActiveBidAmount = () =>
    bids.find((bid) => bid.item === activeAuction._id)?.amount ?? 0;

  const closeModal = () => {
    clearError();
    setModalOpen(false);
  };

  const openModal = (item) => {
    setActiveAuction(item);
    setModalOpen(true);
  };

  const clearError = () => {
    setFormData({ ...formData, error: undefined });
  };

  const validate = (formData) => {
    const currentPrice = getActiveBidAmount() + MIN_BID_MODIFIER;
    clearError();
    if (formData.amount < currentPrice) {
      setFormData({
        ...formData,
        error: {
          ...formData.error,
          amount: `Budet ditt kan ikke være mindre enn ${currentPrice},- kr!`,
        },
      });
      return false;
    } else if (formData.amount > MAX_BID_AMOUNT) {
      setFormData({
        ...formData,
        error: {
          ...formData.error,
          amount: `Budet ditt kan ikke være større enn ${MAX_BID_AMOUNT},- kr!`,
        },
      });
      return false;
    }
    if (!formData.name || !formData.name.length || formData.name.length < 3) {
      setFormData({
        ...formData,
        error: {
          ...formData.error,
          name: "Navnet må være lenger enn to bokstaver",
        },
      });
      return false;
    }
    return true;
  };

  const bid = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
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
          } \n Feilmelding: ${(await res.json()).error}`
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
    },
    overlay: {
      backgroundColor: "rgba(100,100,100, 0.5)",
    },
  };

  return (
    <div>
      <div className="text-4xl text-center p-5 ">
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
          <div className="w-full max-w-xs bg-gray-800 rounded">
            {activeAuction ? (
              <form
                className="bg-gray-600 shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={bid}
              >
                <div className="text-2xl">By på</div>
                <div className="text-2xl text-white font-bold italic">
                  {activeAuction.description}
                </div>
                <p>
                  Nåværende bud: {getActiveBidAmount()}
                  ,-
                </p>
                <div className="mb-4">
                  <label
                    className="block text-white text-lg font-bold mb-2"
                    htmlFor="name"
                  >
                    Navn
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                      className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3"
                      role="alert"
                    >
                      <svg
                        className="fill-current w-4 h-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
                      </svg>
                      <p>{formData.error.name}</p>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label
                    className="block text-white text-lg font-bold mb-2"
                    htmlFor="email"
                  >
                    E-post
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    placeholder="ola@nordmann.no"
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                    }}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-white text-lg font-bold mb-2"
                    htmlFor="amount"
                  >
                    Pris
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="amount"
                    type="number"
                    step="1"
                    min="0"
                    placeholder={String(
                      Math.max(
                        Math.ceil(getActiveBidAmount() * 1.1),
                        getActiveBidAmount() + MIN_BID_MODIFIER
                      )
                    )}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                  {formData.error && formData.error.amount && (
                    <div
                      className="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3"
                      role="alert"
                    >
                      <svg
                        className="fill-current w-4 h-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
                      </svg>
                      <p>{formData.error.amount}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={closeModal}
                  >
                    Avbryt
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    Send bud
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col justify-evenly items-center text-center w-full max-w-xs bg-gray-600 p-4 shadow-md">
                <p className="mb-4 text-xl text-white font-bold italic">
                  {success}
                </p>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
