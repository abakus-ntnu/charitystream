"use client";

import { FormEvent, useContext, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import useSWR from "swr";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetcher, fetchRequest } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

import { AuctionOptions, CharityState } from "@/models/types";

const Page = () => {
  const router = useRouter();
  const [auctionOptions, setAuctionOptions] = useState<AuctionOptions>(
    {} as AuctionOptions
  );
  const [bidToDelete, setBidToDelete] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAuctionId, setSelectedSelectedAuctionId] = useState("");

  const { state } = useContext(State) as StateContextType;
  const { addAlert } = useContext(Alerts) as AlertsContextType;

  const { data, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  if (!state?.token) {
    redirect(`/admin`);
  }

  useEffect(() => {
    if (!state?.token) {
      return;
    }
    (async () => {
      const res = await fetchRequest("/api/admin/auctionOptions", {
        password: state.token ?? undefined,
        addAlert,
      });

      if (res.status === 401) {
        router.push(`/admin`);
        return;
      }
      if (res.status !== 200) {
        return;
      }
      res.json().then((res) => setAuctionOptions(res));
    })();
  }, [state?.token, addAlert, router]);

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
      password: state.token ?? undefined,
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
      password: state.token ?? undefined,
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
      password: state.token ?? undefined,
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
      password: state.token ?? undefined,
    });
    if (!res.ok) return;
    const deleted = data?.auctions.find((a) => a._id === selectedAuctionId);
    addAlert(`${deleted?.description ?? "Objekt"} ble slettet.`, "green");
    setSelectedSelectedAuctionId("");
    mutate();
  };

  return (
    <>
      <div className="w-full p-2 sm:px-10 sm:py-6 bg-white rounded-lg shadow-md lg:shadow-lg text-gray-900">
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
        <h2 className="font-bold sm:text-center text-2xl sm:text-3xl mt-10">
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
                {data?.auctions.map((auction) => {
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
        <h1 className="font-bold sm:text-center text-2xl sm:text-3xl mt-10">
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
        <h2 className="font-bold sm:text-center text-2xl sm:text-3xl mt-10">
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
                {data?.bids.map((bid) => {
                  const auction = data?.auctions.find(
                    (a) => a._id === bid.item
                  );
                  return (
                    <option value={auction?._id} key={auction?._id ?? bid.item}>
                      {bid.amount}kr &nbsp; - &nbsp;{" "}
                      {auction?.description ?? "-"}
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
        <h2 className="font-bold sm:text-center text-2xl sm:text-3xl mt-10">
          Vinnere auksjon
        </h2>
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Auksjonsobjekt</th>
                <th className="border-b p-2">Vinner e-post</th>
                <th className="border-b p-2">Bud</th>
              </tr>
            </thead>
            <tbody>
              {data?.auctions.map((auction) => {
                const winner = data?.bids.find(
                  (bid) => bid.item === auction._id
                );
                return (
                  <tr key={auction._id}>
                    <td className="border-b p-2">{auction.description}</td>
                    <td className="border-b p-2">
                      {winner?.email ?? <span>Ingen vinner</span>}
                    </td>
                    <td className="border-b p-2">
                      {winner?.amount ? `${winner.amount} kr` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Page;
