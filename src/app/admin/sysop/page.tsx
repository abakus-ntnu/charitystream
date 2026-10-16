"use client";

import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import useSWR from "swr";

import Section from "@/components/admin/Section";
import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetchRequest } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

const WAIT_SECONDS = 10;
const HOLD_MS = 5_000;

const TARGETS = {
  bids: "alle bud",
  auctions: "alle auksjonsobjekter (og budene deres)",
  beer: "barens total",
  all: "ALT (donasjoner, bud, auksjonsobjekter, baren og stretch goals)",
};

type Target = keyof typeof TARGETS;

const HoldButton = ({ onComplete }: { onComplete: () => void }) => {
  const [holdStart, setHoldStart] = useState<number>();
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (holdStart == null) return;
    const timeout = setTimeout(onComplete, HOLD_MS);
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [holdStart, onComplete]);

  const start = () => {
    setNow(Date.now());
    setHoldStart(Date.now());
  };
  const stop = () => setHoldStart(undefined);
  const held = holdStart == null ? 0 : Math.max(0, now - holdStart);

  return (
    <Button
      className="flex-1 relative overflow-hidden select-none touch-none"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-ink/40 transition-[width] duration-100 ease-linear"
        style={{ width: `${(Math.min(held, HOLD_MS) / HOLD_MS) * 100}%` }}
      />
      <span className="relative">
        {holdStart == null
          ? `Hold inne i ${HOLD_MS / 1000}s`
          : `Hold ${Math.ceil((HOLD_MS - Math.min(held, HOLD_MS)) / 1000)}s`}
      </span>
    </Button>
  );
};

type ConfirmProps = {
  target: Target;
  step: number;
  onNext: () => void;
  onCancel: () => void;
  onNuke: (code: string) => void;
};

const Confirm = ({ target, step, onNext, onCancel, onNuke }: ConfirmProps) => {
  const [secondsLeft, setSecondsLeft] = useState(step === 1 ? WAIT_SECONDS : 0);
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
    if (step === 1) onNext();
    if (step === 3) onNuke(code);
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
        {step === 2 ? (
          <HoldButton onComplete={onNext} />
        ) : (
          <Button
            type="submit"
            className="flex-1"
            disabled={secondsLeft > 0 || (step === 3 && !code)}
          >
            {secondsLeft > 0 ? `Vent ${secondsLeft}s` : "Slett"}
          </Button>
        )}
      </div>
    </form>
  );
};

const Page = () => {
  const [pending, setPending] = useState<{ target: Target; step: number }>();
  const next = useCallback(
    () => setPending((p) => p && { ...p, step: p.step + 1 }),
    []
  );
  const [confirmingToggle, setConfirmingToggle] = useState(false);

  const { state } = useContext(State) as StateContextType;
  const { addAlert } = useContext(Alerts) as AlertsContextType;

  const { data: spleis, mutate: mutateSpleis } = useSWR<{
    webhookEnabled: boolean;
  }>(
    state?.token ? ["/api/admin/spleis", state.token] : null,
    (url: string, password: string) =>
      fetchRequest(url, { password }).then((res) => res.json())
  );

  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  const toggleWebhook = async () => {
    setConfirmingToggle(false);
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
      <Section title="Donasjoner: Integrasjon">
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
          onClick={() => setConfirmingToggle(true)}
        >
          {spleis?.webhookEnabled ? "Skru av webhook" : "Skru på webhook"}
        </Button>
      </Section>

      <Modal
        isOpen={confirmingToggle}
        onRequestClose={() => setConfirmingToggle(false)}
        contentLabel="Bekreft webhook-endring"
        overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm"
        className="w-full max-w-lg outline-none"
      >
        <div className="flex flex-col gap-4 p-6 md:p-8 bg-panel border-t-4 border-gold animate-pop-in">
          <span className="eyebrow text-gold">
            {spleis?.webhookEnabled ? "Skru av webhook?" : "Skru på webhook?"}
          </span>
          <p className="m-0 text-lg font-semibold">
            {spleis?.webhookEnabled
              ? "Webhook-donasjonene slettes og hentes på nytt fra Spleis-CSV i løpet av et minutt."
              : "CSV-hentingen stopper. Gjør dette bare når Spleis har bekreftet at webhooken er satt opp, ellers kommer ikke nye donasjoner inn."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmingToggle(false)}
            >
              Avbryt
            </Button>
            <Button variant="gold" className="flex-1" onClick={toggleWebhook}>
              {spleis?.webhookEnabled ? "Skru av" : "Skru på"}
            </Button>
          </div>
        </div>
      </Modal>

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
            onNext={next}
            onCancel={() => setPending(undefined)}
            onNuke={(code) => nuke(pending.target, code)}
          />
        )}
      </Modal>
    </>
  );
};

export default Page;
