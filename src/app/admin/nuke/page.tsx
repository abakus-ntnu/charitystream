"use client";

import { FormEvent, useContext, useEffect, useState } from "react";
import Modal from "react-modal";

import Section from "@/components/admin/Section";
import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetchRequest } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

const WAIT_SECONDS = 10;

const TARGETS = {
  bids: "alle bud",
  auctions: "alle auksjonsobjekter (og budene deres)",
  beer: "barens total",
  all: "ALT (donasjoner, bud, auksjonsobjekter og baren)",
};

type Target = keyof typeof TARGETS;

type ConfirmProps = {
  target: Target;
  step: number;
  onNext: () => void;
  onCancel: () => void;
  onNuke: (code: string) => void;
};

const Confirm = ({ target, step, onNext, onCancel, onNuke }: ConfirmProps) => {
  const [secondsLeft, setSecondsLeft] = useState(step < 3 ? WAIT_SECONDS : 0);
  const [code, setCode] = useState("");

  useEffect(() => {
    const interval = setInterval(
      () => setSecondsLeft((seconds) => Math.max(0, seconds - 1)),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) onNext();
    else onNuke(code);
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 p-6 md:p-8 bg-panel border-t-4 border-red-6 animate-pop-in"
    >
      <span className="eyebrow text-red-5">Bekreftelse {step} av 3</span>
      <p className="m-0 text-lg font-semibold">
        {step === 1 && `Er du sikker på at du vil slette ${TARGETS[target]}?`}
        {step === 2 && `Helt sikker? ${TARGETS[target]} blir borte for godt.`}
        {step === 3 && `Skriv inn atomkoden for å slette ${TARGETS[target]}.`}
      </p>
      {step === 3 && (
        <Field label="Atomkode" htmlFor="code">
          <input
            id="code"
            type="password"
            className="input"
            autoComplete="off"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <p className="m-0 text-sm text-text-dim">
            Spør Webkom om koden hvis du er usikker
          </p>
        </Field>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Avbryt
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={secondsLeft > 0 || (step === 3 && !code)}
        >
          {secondsLeft > 0 ? `Vent ${secondsLeft}s` : "Slett"}
        </Button>
      </div>
    </form>
  );
};

const Page = () => {
  const [pending, setPending] = useState<{ target: Target; step: number }>();

  const { state } = useContext(State) as StateContextType;
  const { addAlert } = useContext(Alerts) as AlertsContextType;

  const nuke = async (target: Target, code: string) => {
    const res = await fetchRequest("/api/admin/nuke", {
      method: "POST",
      password: state.token ?? undefined,
      body: { target, code },
      addAlert,
    });
    if (res.ok) {
      setPending(undefined);
      addAlert(`Slettet ${TARGETS[target]}`, "green");
    }
  };

  return (
    <>
      <Section title="Nuke">
        <p className="m-0 text-text-dim">
          Sletter data permanent fra databasen. Kan ikke angres.
        </p>
        <div className="flex flex-col gap-3">
          {(Object.keys(TARGETS) as Target[]).map((target) => (
            <Button
              key={target}
              variant={target === "all" ? "primary" : "secondary"}
              onClick={() => setPending({ target, step: 1 })}
            >
              Slett {TARGETS[target]}
            </Button>
          ))}
        </div>
      </Section>

      <Modal
        isOpen={!!pending}
        onRequestClose={() => setPending(undefined)}
        contentLabel="Bekreft sletting"
        overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm"
        className="w-full max-w-lg outline-none"
      >
        {pending && (
          <Confirm
            key={pending.step}
            target={pending.target}
            step={pending.step}
            onNext={() => setPending({ ...pending, step: pending.step + 1 })}
            onCancel={() => setPending(undefined)}
            onNuke={(code) => nuke(pending.target, code)}
          />
        )}
      </Modal>
    </>
  );
};

export default Page;
