"use client";

import { FormEvent, useContext, useState } from "react";

import Section from "@/components/admin/Section";
import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetchRequest } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

const Page = () => {
  const [name, setName] = useState<null | string>();
  const [amount, setAmount] = useState<null | number>();

  const { state } = useContext(State) as StateContextType;
  const { addAlert } = useContext(Alerts) as AlertsContextType;

  const addOneVipps = async (
    name: string,
    amount: number
  ): Promise<boolean> => {
    const res = await fetchRequest("/api/admin/vipps", {
      method: "POST",
      password: state.token ?? undefined,
      body: { name, amount: Number(amount) },
    });
    if (res.ok) {
      addAlert(`Donasjonen på ${amount}kr fra ${name} ble lagt til!`, "green");
    }
    return res.ok;
  };

  const addOne = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      addAlert && addAlert(`Donasjonen mangler navn!`, "red");
      return;
    }
    if (!amount) {
      addAlert && addAlert(`Donasjonen mangler mengde!`, "red");
      return;
    }

    if (await addOneVipps(name, amount)) {
      setName(null);
      setAmount(null);
    }
  };

  const uploadCsv = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const file = new FormData(form).get("file");
    if (!(file instanceof File) || !file.size) {
      addAlert("Ingen fil valgt", "red");
      return;
    }
    const res = await fetchRequest("/api/admin/spleis/csv", {
      method: "POST",
      password: state.token ?? undefined,
      body: { csv: await file.text(), source: "opplastet" },
      addAlert,
    });
    if (res.ok) {
      const { count } = await res.json();
      addAlert(`Spleis-CSV lastet opp: ${count} donasjoner`, "green");
      form.reset();
    }
  };

  return (
    <>
      <Section title="Legg til én donasjon">
        <form className="flex flex-col gap-4" onSubmit={addOne}>
          <Field label="Navn" htmlFor="name">
            <input
              id="name"
              type="text"
              name="name"
              placeholder="navn"
              className="input"
              required
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Mengde" htmlFor="amount">
            <input
              id="amount"
              type="number"
              name="amount"
              placeholder="100kr"
              className="input tabular-nums"
              required
              value={amount ?? ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </Field>
          <Button type="submit">Legg til donasjon</Button>
        </form>
      </Section>

      <Section title="Last opp Spleis-CSV (fallback)">
        <p className="m-0 text-text-dim">
          Bare hvis Poll og Script ikke fungerer. Last ned rewards-info.csv fra
          Spleis og last den opp her. Donasjoner som allerede er lagt inn telles
          ikke dobbelt.
        </p>
        <form className="flex flex-col gap-4" onSubmit={uploadCsv}>
          <Field label="Spleis-CSV" htmlFor="file">
            <input
              id="file"
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="input cursor-pointer py-2"
              required
            />
          </Field>
          <Button type="submit" variant="secondary">
            Last opp
          </Button>
        </form>
      </Section>
    </>
  );
};

export default Page;
