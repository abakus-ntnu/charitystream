"use client";

import { FormEvent, useContext, useState } from "react";
import { redirect } from "next/navigation";
import useSWR from "swr";

import Section from "@/components/admin/Section";
import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetcher, fetchRequest, formatCurrency } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

import { CharityState } from "@/models/types";

const Page = () => {
  const [spent, setSpent] = useState<number | null>(null);

  const { state } = useContext(State) as StateContextType;
  const { addAlert } = useContext(Alerts) as AlertsContextType;

  if (!state?.token) {
    redirect(`/admin`);
  }

  const { data, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  const submitTotal = async (e: FormEvent) => {
    e.preventDefault();
    if (spent == null || spent < 0) {
      addAlert(`Skriv inn et beløp på minst 0 kr`, "red");
      return;
    }
    const res = await fetchRequest("/api/admin/beer", {
      method: "POST",
      password: state.token ?? undefined,
      body: { spent },
      addAlert,
    });
    if (res.ok) {
      addAlert(
        `Totalt brukt i baren er satt til ${formatCurrency(spent)}!`,
        "green"
      );
      setSpent(null);
      mutate();
    }
  };

  return (
    <>
      <Section title="Sett totalt brukt i baren">
        <form className="flex flex-col gap-4" onSubmit={submitTotal}>
          <Field label="Totalt brukt (kr)" htmlFor="spent">
            <input
              id="spent"
              type="number"
              name="spent"
              min={0}
              placeholder={String(data?.beer?.spent ?? "")}
              className="input tabular-nums"
              required
              value={spent ?? ""}
              onChange={(e) => setSpent(Number(e.target.value))}
            />
          </Field>
          <Button type="submit">Oppdater total</Button>
        </form>
      </Section>
    </>
  );
};

export default Page;
