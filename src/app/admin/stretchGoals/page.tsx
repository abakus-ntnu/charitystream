"use client";

import { useContext, useState } from "react";
import { redirect } from "next/navigation";
import useSWR from "swr";

import Section from "@/components/admin/Section";
import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetcher, fetchRequest } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

import { CharityState } from "@/models/types";

const Page = () => {
  const { state } = useContext(State) as StateContextType;
  const { addAlert } = useContext(Alerts) as AlertsContextType;

  const { data, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState(0);
  const [selectedGoalId, setSelectedSelectedGoalId] = useState("");

  if (!state?.token) {
    redirect(`/admin`);
  }

  const onAddClick = async (e) => {
    e.preventDefault();
    const res = await fetchRequest("/api/admin/stretchGoals", {
      method: "POST",
      password: state.token ?? undefined,
      body: { description, goal },
      addAlert,
    });

    if (res.ok) {
      addAlert && addAlert(`${description} ble lagt til for ${goal}`, "green");
      setDescription("");
      setGoal(0);
      mutate();
    }
  };

  const onDeleteGoal = async (e) => {
    e.preventDefault();
    const res = await fetchRequest("/api/admin/stretchGoals", {
      method: "DELETE",
      password: state.token ?? undefined,
      body: { goalId: selectedGoalId },
      addAlert,
    });

    if (res.ok) {
      const deleted = data?.stretchGoals.find(
        (stretchGoal) => stretchGoal._id === selectedGoalId
      );
      addAlert &&
        addAlert(
          `${deleted?.description ?? "Stretch goal"} ble slettet.`,
          "green"
        );
      setDescription("");
      setGoal(0);
      setSelectedSelectedGoalId("");
      mutate();
    }
  };

  return (
    <>
      <Section title="Legg til stretch goal">
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
          <Field label="Beløp" htmlFor="goal">
            <input
              id="goal"
              type="number"
              name="goal"
              placeholder="Beløp"
              className="input tabular-nums"
              required
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
            />
          </Field>
          <Button type="submit" onClick={onAddClick}>
            Legg til stretch goal
          </Button>
        </form>
      </Section>

      <Section title="Fjern stretch goal">
        <form className="flex flex-col gap-4">
          <select
            className="input"
            aria-label="Stretch goal"
            onChange={(e) => {
              setSelectedSelectedGoalId(e.target.value);
            }}
          >
            <option>-- Velg Stretch Goal --</option>
            {data?.stretchGoals.map((stretchGoal) => {
              return (
                <option value={stretchGoal._id} key={stretchGoal._id}>
                  {stretchGoal.goal}kr &nbsp; - &nbsp; {stretchGoal.description}
                </option>
              );
            })}
          </select>
          <Button type="submit" variant="secondary" onClick={onDeleteGoal}>
            Fjern stretch goal
          </Button>
        </form>
      </Section>
    </>
  );
};

export default Page;
