import { FormEvent, useContext, useState } from "react";
import useSWR from "swr";

import Layout from "@/components/admin/Layout";
import SetPasswordBox from "@/components/admin/SetPasswordBox";

import Alerts from "@/lib/Alerts";
import { fetcher, fetchRequest } from "@/lib/helpers";
import State from "@/lib/State";

import { CharityState } from "@/models/types";

const Beer = () => {
  const [count, setCount] = useState<null | number>();
  const [price, setPrice] = useState<null | number>();

  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const { data, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

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

  const updateBeer = async (count: number): Promise<boolean> => {
    const res = await fetchRequest("/api/admin/beer", {
      method: "POST",
      password: state.token,
      body: { count },
      addAlert,
    });
    if (res.ok) {
      addAlert(`Antall øl oppdatert til ${count}!`, "green");
    }
    return res.ok;
  };

  const updateBeerPrice = async (price: number): Promise<boolean> => {
    const res = await fetchRequest("/api/admin/beer", {
      method: "POST",
      password: state.token,
      body: { price },
      addAlert,
    });
    if (res.ok) {
      addAlert(`Prisen per øl er oppdatert til ${price} kr!`, "green");
    }
    return res.ok;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (count === null) {
      addAlert(`Antall øl mangler!`, "red");
      return;
    }
    if (await updateBeer(count)) {
      setCount(null);
      mutate();
    }
  };

  const submitPrice = async (e: FormEvent) => {
    e.preventDefault();
    if (price < 0) {
      addAlert(`Vennligst skriv inn en pris større enn 0`, "red");
      return;
    }
    if (await updateBeerPrice(price)) {
      setPrice(null);
      mutate();
    }
  };

  return (
    <Layout full>
      <div className="w-full py-6 px-4 sm:px-10">
        <h1 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900">
          Oppdater antall øl:
        </h1>
        <div className="w-full">
          <div className="mt-5 w-full">
            <form onSubmit={submit}>
              <input
                id="count"
                type="number"
                name="count"
                placeholder={String(data.beer?.count ?? "")}
                className="block w-full py-3 px-1 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                required
                value={count ?? ""}
                onChange={(e) => setCount(Number(e.target.value))}
              />
              <button
                type="submit"
                className="w-full py-3 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
              >
                Oppdater antall
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="w-full py-6 px-4 sm:px-10">
        <h1 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900">
          Oppdater prisen per øl:
        </h1>
        <div className="w-full">
          <div className="mt-5 w-full">
            <form onSubmit={submitPrice}>
              <input
                id="count"
                type="number"
                name="count"
                placeholder={String(data.beer?.price ?? "")}
                className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                required
                value={price ?? ""}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
              <button
                type="submit"
                className="w-full py-3 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
              >
                Oppdater ølpris
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Beer;
