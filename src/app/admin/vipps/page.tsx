"use client";

import { FormEvent, useContext, useState } from "react";
import useSWR from "swr";

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

  const { data: spleis, mutate: mutateSpleis } = useSWR<{
    webhookEnabled: boolean;
  }>(
    state?.token ? ["/api/admin/spleis", state.token] : null,
    ([url, password]: [string, string]) =>
      fetchRequest(url, { password }).then((res) => res.json())
  );

  const toggleWebhook = async () => {
    if (!spleis) return;
    const webhookEnabled = !spleis.webhookEnabled;
    const res = await fetchRequest("/api/admin/spleis", {
      method: "POST",
      password: state.token ?? undefined,
      body: { webhookEnabled },
      addAlert,
    });
    if (res.ok) {
      mutateSpleis({ webhookEnabled });
      addAlert(
        webhookEnabled
          ? "Spleis-donasjoner kommer nå via webhook"
          : "Spleis-donasjoner hentes nå fra CSV",
        "green"
      );
    }
  };

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

      <Section title="Spleis">
        <p className="m-0 text-text-dim">
          {spleis == null
            ? "Laster inn"
            : spleis.webhookEnabled
            ? "Webhook er på: Spleis sender hver donasjon til oss. CSV-hentingen er av."
            : "Webhook er av: donasjoner hentes fra Spleis-CSV omtrent hvert minutt."}
        </p>
        <Button
          variant={spleis?.webhookEnabled ? "gold" : "secondary"}
          disabled={spleis == null}
          onClick={toggleWebhook}
        >
          {spleis?.webhookEnabled ? "Skru av webhook" : "Skru på webhook"}
        </Button>
      </Section>
    </>
  );
};

export default Page;
