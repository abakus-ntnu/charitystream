import { FormEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import Layout from "@/components/admin/Layout";
import SetPasswordBox from "@/components/admin/SetPasswordBox";

import Alerts from "@/lib/Alerts";
import { fetcher, fetchRequest } from "@/lib/helpers";
import State from "@/lib/State";

import { AuctionOptions, CharityState } from "@/models/types";

const Auction = () => {
  const router = useRouter();
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
    if (!state?.token) {
      return;
    }
    (async () => {
      const res = await fetchRequest("/api/admin/auctionOptions", {
        password: state.token,
        addAlert,
      });

      if (res.status === 401) {
        // Invalid credentails
        router.push(`/admin`);
        return;
      }
      if (res.status !== 200) {
        return;
      }
      res.json().then((res) => setAuctionOptions(res));
    })();
  }, [state?.token, addAlert, router]);

  if (error)
    return (
      <Layout full>
        <div>Failed to load</div>
      </Layout>
    );
  if (!data)
    return (
      <Layout full>
        <p className="text-gray-900 p-4">Laster inn...</p>
      </Layout>
    );
  if (!state?.token)
    return (
      <Layout full>
        <SetPasswordBox action="legge til donasjoner" />
      </Layout>
    );

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
    const res = await fetchRequest("/api/admin/auctionOptions", {
      method: "POST",
      password: state.token,
      body: newOptions,
      addAlert,
    });
    setAuctionOptions(newOptions);
    if (res.ok) {
      addAlert(`Auksjons-innstillinger er oppdatert`, "green");
    }
  };

  const deleteBid = async (auctionId: string) => {
    if (auctionId.length === 0) return;

    const res = await fetchRequest("/api/admin/bid", {
      method: "DELETE",
      password: state.token,
      body: { auctionId },
      addAlert,
    });
    if (!res.ok) return;
    addAlert(
      `Budet ble slettet! Det kan ta noen sekunder før lista reloades`,
      "green"
    );
    mutate();
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
    const res = await fetchRequest("/api/admin/auctions", {
      method: "POST",
      password: state.token,
      body: { description },
      addAlert,
    });
    if (!res.ok) return;
    addAlert(`${description} ble lagt til.`, "green");
    setDescription("");
    mutate();
  };

  const onDeleteAuction = async (e) => {
    e.preventDefault();
    const res = await fetchRequest("/api/admin/auctions", {
      method: "DELETE",
      body: { auctionId: selectedAuctionId },
      addAlert,
      password: state.token,
    });
    if (!res.ok) return;
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
  };

  return (
    <Layout full>
      <div
        className="w-full p-2 sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg"
      >
        <h2 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900">
          Legg til auksjonsobjekt
        </h2>
        <div className="w-full">
          <div className="w-full">
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
                className="w-full py-3 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
              >
                Legg til auksjonsobjekt
              </button>
            </form>
          </div>
        </div>
        <h2 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900 mt-10">
          Fjern auksjonsobjekt
        </h2>
        <div className="w-full">
          <div className="w-full">
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
        <h1 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900 mt-10">
          Administrer auksjon
        </h1>
        <button
          className={`w-full py-3 mt-2 mr-1/12 bg-gray-${
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
          className={`w-full py-3 mt-3 bg-gray-${
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
        <h2 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900 mt-10">
          Fjern høyeste bud
        </h2>
        <div className="w-full">
          <div className="w-full">
            <form onSubmit={submitDeleteBid}>
              <select
                className="block w-full py-3 px-1 mb-4
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
    </Layout>
  );
};

export default Auction;
