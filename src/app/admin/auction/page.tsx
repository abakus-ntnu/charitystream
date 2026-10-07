"use client";

import { FormEvent, useContext, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import useSWR from "swr";

import Section from "@/components/admin/Section";
import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetcher, fetchRequest } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

import { AuctionOptions, Bid, CharityState } from "@/models/types";

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
  // the public state leaves out who bid; admins get the winners' contact details here
  const { data: winners } = useSWR<Bid[]>(
    state?.token ? ["/api/admin/bids", state.token] : null,
    ([url, password]: [string, string]) =>
      fetchRequest(url, { password }).then((res) => res.json()),
    { refreshInterval: 5000 }
  );

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
      <Section title="Legg til auksjonsobjekt">
        <form className="flex flex-col gap-4">
          <Field label="Beskrivelse" htmlFor="description">
            <input
              id="description"
              type="text"
              name="description"
              placeholder="Beskrivelse"
              className="input"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Button type="submit" onClick={onAddAuction}>
            Legg til auksjonsobjekt
          </Button>
        </form>
      </Section>

      <Section title="Fjern auksjonsobjekt">
        <form className="flex flex-col gap-4">
          <select
            className="input"
            aria-label="Auksjonsobjekt"
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
          <Button type="submit" variant="secondary" onClick={onDeleteAuction}>
            Fjern auksjonsobjekt
          </Button>
        </form>
      </Section>

      <Section title="Administrer auksjon">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant={auctionOptions.freezeBidding ? "gold" : "secondary"}
            disabled={auctionOptions.freezeBidding == null}
            onClick={() => {
              toggleFreezeBids();
            }}
          >
            {auctionOptions.freezeBidding == null
              ? "Laster inn"
              : auctionOptions.freezeBidding
              ? "Tillat bud"
              : "Frys bud"}
          </Button>
          <Button
            variant={auctionOptions.displayWinners ? "gold" : "secondary"}
            disabled={auctionOptions.displayWinners == null}
            onClick={() => {
              toggleShowBiddders();
            }}
          >
            {auctionOptions.displayWinners == null
              ? "Laster inn"
              : auctionOptions.displayWinners
              ? "Skjul hvem som har gitt bud"
              : "Vis hvem som har gitt bud"}
          </Button>
        </div>
      </Section>

      <Section title="Fjern høyeste bud">
        <form className="flex flex-col gap-4" onSubmit={submitDeleteBid}>
          <select
            className="input"
            aria-label="Bud"
            onChange={(e) => {
              setBidToDelete(e.target.value);
            }}
          >
            <option>-- Velg et bud --</option>
            {data?.bids.map((bid) => {
              const auction = data?.auctions.find((a) => a._id === bid.item);
              return (
                <option value={auction?._id} key={auction?._id ?? bid.item}>
                  {bid.amount}kr &nbsp; - &nbsp; {auction?.description ?? "-"}
                </option>
              );
            })}
          </select>
          <Button type="submit" variant="secondary">
            Fjern bud
          </Button>
        </form>
      </Section>

      <Section title="Vinnere auksjon">
        <div className="w-full overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Auksjonsobjekt</th>
                <th>Vinner</th>
                <th>E-post</th>
                <th className="th--right">Bud</th>
              </tr>
            </thead>
            <tbody>
              {data?.auctions.map((auction) => {
                const winner = winners?.find((bid) => bid.item === auction._id);
                return (
                  <tr key={auction._id}>
                    <td>{auction.description}</td>
                    <td>
                      {winner?.name || (
                        <span className="text-text-faint">Ingen vinner</span>
                      )}
                    </td>
                    <td>
                      {winner?.email || (
                        <span className="text-text-faint">-</span>
                      )}
                    </td>
                    <td className="td--right">
                      {winner?.amount ? (
                        <span className="font-semibold text-gold">
                          {winner.amount} kr
                        </span>
                      ) : (
                        <span className="text-text-faint">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
};

export default Page;
