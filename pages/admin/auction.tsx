import { useContext, useState, FormEvent, useEffect } from "react";
import useSWR from "swr";
import State from "../../lib/State";
import Alerts from "../../lib/Alerts";
import Layout from "../../components/admin/Layout";
import SetPasswordBox from "../../components/admin/SetPasswordBox";
import { AuctionOptions, CharityState } from "../../models/types";
import { fetcher, fetchRequest } from "../../lib/helpers";

const Auction = () => {
  const [auctionOptions, setAuctionOptions] = useState<AuctionOptions>(
    {} as AuctionOptions
  );
  const [bidToDelete, setBidToDelete] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAuctionId, setSelectedSelectedAuctionId] = useState("");

  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const { data, error, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (!state.token) {
      return;
    }
    fetchRequest(
      "/api/auctionOptions",
      "GET",
      {},
      (res) => {
        if (res.status !== 200) {
          return;
        }
        res.json().then((res) => setAuctionOptions(res));
      },
      addAlert,
      state.token
    );
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const toggleFreezeBids = () => {
    updateAuctionOptions({
      ...auctionOptions,
      freezeBidding: !auctionOptions.freezeBidding,
    });
  };

  const toggleShowBiddders = () => {
    updateAuctionOptions({
      ...auctionOptions,
      displayWinners: !auctionOptions.displayWinners,
    });
  };

  const updateAuctionOptions = async (newOptions: AuctionOptions) => {
    fetchRequest(
      "/api/auctionOptions",
      "POST",
      newOptions,
      (res) => {
        setAuctionOptions(newOptions);
        if (res.ok) {
          addAlert(`Auksjons-innstillinger er oppdatert`, "green");
        }
      },
      addAlert,
      state.token
    );
  };

  const deleteBid = async (auctionId: string) => {
    if (auctionId.length === 0) return;

    fetchRequest(
      "/api/bid",
      "DELETE",
      { auctionId },
      (res) => {
        if (res.ok) {
          addAlert(
            `Budet ble slettet! Det kan ta noen sekunder før lista reloades`,
            "green"
          );
          mutate();
        }
      },
      addAlert,
      state.token
    );
  };

  const submitDeleteBid = async (e: FormEvent) => {
    e.preventDefault();
    if (bidToDelete.length === 0) {
      addAlert(`Du må velge et bud!`, "red");
      return;
    }
    deleteBid(bidToDelete);
  };

  const onAddAuction = async (e) => {
    e.preventDefault();
    await fetchRequest(
      "/api/auctions",
      "POST",
      { description },
      (res) => {
        if (res.ok) {
          addAlert(`${description} ble lagt til.`, "green");
          setDescription("");
          mutate();
        }
      },
      addAlert,
      state.token
    );
  };

  const onDeleteAuction = async (e) => {
    e.preventDefault();
    await fetchRequest(
      "/api/auctions",
      "DELETE",
      { auctionId: selectedAuctionId },
      (res) => {
        if (res.ok) {
          addAlert(
            `${
              data.auctions.find(
                (stretchGoal) => stretchGoal._id === selectedAuctionId
              ).description
            } ble slettet.`,
            "green"
          );
          setSelectedSelectedAuctionId("");
          mutate();
        }
      },
      addAlert,
      state.token
    );
  };

  return (
    <Layout full>
      {!state?.token ? (
        <SetPasswordBox action="legge til donasjoner" />
      ) : (
        <div
          className="w-full sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg"
        >
          <h1 className="font-bold text-center text-3xl text-gray-900">
            Legg til auksjonsobjekt
          </h1>
          <div className="w-full">
            <div className="mt-5 w-full">
              <form>
                <input
                  id="description"
                  type="text"
                  name="description"
                  placeholder="Beskrivelse"
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  onClick={onAddAuction}
                  className="w-full py-3 mt-10 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
                >
                  Legg til auksjonsobjekt
                </button>
              </form>
            </div>
          </div>
          <h2 className="font-bold text-center text-2xl text-gray-900 mt-5">
            Fjern auksjonsobjekt
          </h2>
          <div className="w-full">
            <div className="mt-5 w-full">
              <form>
                <select
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  onChange={(e) => {
                    setSelectedSelectedAuctionId(e.target.value);
                  }}
                >
                  <option>-- Velg Auksjonsobjekt --</option>
                  {data.auctions.map((auction) => {
                    return (
                      <option value={auction._id} key={auction._id}>
                        {auction.description}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={onDeleteAuction}
                  className="w-full py-3 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
                >
                  Fjern Auksjonsobjekt
                </button>
              </form>
            </div>
          </div>
          <h1 className="font-bold text-center text-3xl text-gray-900 mt-10">
            Administrer auksjon
          </h1>
          <button
            className={`w-full py-3 mt-10 mr-1/12 bg-gray-${
              auctionOptions.freezeBidding ? "600" : "800"
            } rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-${
                      auctionOptions.freezeBidding ? "500" : "700"
                    } hover:shadow-none`}
            onClick={() => {
              toggleFreezeBids();
            }}
          >
            {auctionOptions.freezeBidding == null
              ? "Laster inn"
              : auctionOptions.freezeBidding
              ? "Tillat bud"
              : "Frys bud"}
          </button>
          <button
            type="submit"
            className={`w-full py-3 mt-5 bg-gray-${
              auctionOptions.displayWinners ? "600" : "800"
            } rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-${
                      auctionOptions.displayWinners ? "500" : "700"
                    } hover:shadow-none`}
            onClick={() => {
              toggleShowBiddders();
            }}
          >
            {auctionOptions.displayWinners == null
              ? "Laster inn"
              : auctionOptions.displayWinners
              ? "Skjul hvem som har gitt bud"
              : "Vis hvem som har gitt bud"}
          </button>
          <h2 className="font-bold text-center text-2xl text-gray-900 mt-5">
            Fjern høyeste bud
          </h2>
          <div className="w-full">
            <div className="mt-5 w-full">
              <form onSubmit={submitDeleteBid}>
                <select
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  onChange={(e) => {
                    setBidToDelete(e.target.value);
                  }}
                >
                  <option>-- Velg et bud --</option>
                  {data.bids.map((bid) => {
                    const auction = data.auctions.find(
                      (auction) => auction._id === bid.item
                    );
                    return (
                      <option value={auction._id} key={auction._id}>
                        {bid.amount}kr &nbsp; - &nbsp; {auction.description}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="submit"
                  className="w-full py-3 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
                >
                  Fjern bud
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Auction;
