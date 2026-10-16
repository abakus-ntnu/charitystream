import { FormEvent, useState } from "react";
import Modal from "react-modal";

import Button from "@/components/Button";
import Field from "@/components/Field";
import PixelSprite from "@/components/PixelSprite";

import { DRUNK_SPRITES, PALETTE } from "@/lib/abaku";
import { MAX_BID_AMOUNT, MIN_BID_MODIFIER } from "@/lib/constants";
import { fetchRequest, formatCurrency } from "@/lib/helpers";

import { Auction, Bid } from "@/models/types";

const ceilTo = (value: number, step: number) => Math.ceil(value / step) * step;

// Shortcuts from the minimum bid upwards, so bidding is a tap away
const quickBids = (min: number) =>
  [min, ceilTo(min + 100, 50), ceilTo(min + 500, 100)].filter(
    (amount, i, all) => amount <= MAX_BID_AMOUNT && all.indexOf(amount) === i
  );

type Errors = { name?: string; amount?: string };
type Result = { ok: true; amount: number } | { ok: false; message: string };

// The API answers in English; translate the cases bidders are likely to hit
const failureMessage = (error?: string) => {
  if (!error) return "Noe gikk galt. Prøv igjen om litt.";
  if (error.includes("ended")) return "Auksjonen er dessverre avsluttet.";
  if (error.includes("greater than current highest bid"))
    return "Noen rakk å by før deg! Prøv et høyere bud.";
  return error;
};

type Props = {
  auction: Auction | null;
  bid?: Bid;
  onClose: () => void;
  onBidPlaced: () => void;
};

const BidDialog = ({ auction, bid, onClose, onBidPlaced }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const current = bid?.amount ?? 0;
  const min = current + MIN_BID_MODIFIER;

  // Start fresh each time a new item is opened, but keep name and email
  const reset = () => {
    setAmount("");
    setErrors({});
    setResult(null);
  };

  const validate = (value: number): Errors => {
    if (!amount || isNaN(value)) return { amount: "Du må skrive inn et tall" };
    if (value < min)
      return { amount: `Budet ditt må være minst ${formatCurrency(min)}` };
    if (value > MAX_BID_AMOUNT)
      return {
        amount: `Budet ditt kan ikke være over ${formatCurrency(
          MAX_BID_AMOUNT
        )}`,
      };
    if (name.trim().length < 3)
      return { name: "Navnet må være lenger enn to bokstaver" };
    return {};
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    const value = Number(amount);
    const found = validate(value);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const res = await fetchRequest("/api/bid", {
        method: "POST",
        body: {
          name: name.trim(),
          email,
          amount: value,
          item: auction._id,
          description: auction.description,
        },
      });
      if (res.ok) {
        setResult({ ok: true, amount: value });
        onBidPlaced();
      } else {
        const body = await res.json().catch(() => null);
        setResult({ ok: false, message: failureMessage(body?.error) });
      }
    } catch {
      setResult({ ok: false, message: failureMessage() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!auction}
      onRequestClose={onClose}
      onAfterClose={reset}
      contentLabel={auction ? `By på ${auction.description}` : undefined}
      overlayClassName="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink/80 backdrop-blur-sm"
      className="w-full sm:max-w-lg max-h-full overflow-y-auto outline-none"
    >
      {auction && result?.ok && (
        <div className="flex flex-col items-center gap-4 p-6 md:p-8 bg-panel border-t-4 border-gold text-center animate-pop-in">
          <PixelSprite
            rows={DRUNK_SPRITES[0]}
            palette={PALETTE}
            scale={6}
            className="animate-bump"
          />
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-gold">Bud registrert</span>
            <h2 className="m-0 text-3xl font-extrabold">Du leder!</h2>
            <p className="m-0 text-text-dim">
              Ditt bud på{" "}
              <span className="font-bold text-gold tabular-nums">
                {formatCurrency(result.amount)}
              </span>{" "}
              på «{auction.description}» er registrert. Følg med, noen kan
              fortsatt by over deg!
            </p>
          </div>
          <Button variant="gold" className="w-full" onClick={onClose}>
            Se flere premier
          </Button>
        </div>
      )}

      {auction && result && !result.ok && (
        <div className="flex flex-col gap-4 p-6 md:p-8 bg-panel border-t-4 border-red-6 animate-pop-in">
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-red-5">Budet gikk ikke gjennom</span>
            <p className="m-0 text-lg font-semibold">{result.message}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Lukk
            </Button>
            <Button className="flex-1" onClick={() => setResult(null)}>
              Prøv igjen
            </Button>
          </div>
        </div>
      )}

      {auction && !result && (
        <form
          className="flex flex-col gap-5 p-6 md:p-8 bg-panel border-t-4 border-gold animate-pop-in"
          onSubmit={submit}
          noValidate
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="eyebrow">Du byr på</span>
              <h2 className="m-0 text-2xl font-extrabold leading-tight">
                {auction.description}
              </h2>
            </div>
            <button
              type="button"
              className="button button--ghost -mr-3 -mt-2 px-3 py-1 text-2xl leading-none"
              onClick={onClose}
              aria-label="Lukk"
            >
              ×
            </button>
          </div>

          <div className="flex items-end justify-between gap-4 p-4 bg-ink-alt">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="eyebrow text-sm">
                {current ? "Høyeste bud nå" : "Ingen bud ennå"}
              </span>
              <span
                key={current}
                className={`text-3xl font-extrabold tabular-nums leading-none origin-left ${
                  current ? "text-gold animate-bump" : "text-text-faint"
                }`}
              >
                {current ? formatCurrency(current) : "—"}
              </span>
            </div>
            {bid?.name && (
              <span className="text-sm text-text-faint text-right truncate">
                Leder: <span className="text-text-dim">{bid.name}</span>
              </span>
            )}
          </div>

          <Field label="Ditt bud" htmlFor="amount" error={errors.amount}>
            <div className="flex flex-wrap gap-2">
              {quickBids(min).map((quick) => (
                <button
                  key={quick}
                  type="button"
                  aria-pressed={Number(amount) === quick}
                  className={`button button--secondary flex-1 px-3 py-2 tabular-nums ${
                    Number(amount) === quick
                      ? "text-gold shadow-[inset_0_0_0_2px_var(--color-gold)]"
                      : ""
                  }`}
                  onClick={() => setAmount(String(quick))}
                >
                  {formatCurrency(quick)}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                className="input tabular-nums text-lg font-bold pr-12"
                id="amount"
                type="number"
                inputMode="numeric"
                step="1"
                min={min}
                max={MAX_BID_AMOUNT}
                placeholder={`Minst ${min}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint font-semibold pointer-events-none">
                kr
              </span>
            </div>
          </Field>

          <Field label="Navn" htmlFor="name" error={errors.name}>
            <input
              className="input"
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ditt ekte navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="E-post (valgfritt)" htmlFor="email">
            <input
              className="input"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ola@nordmann.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Button
            type="submit"
            variant="gold"
            className="w-full text-base"
            disabled={submitting}
          >
            {submitting
              ? "Sender bud…"
              : Number(amount) >= min
              ? `By ${formatCurrency(Number(amount))}`
              : "Send bud"}
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default BidDialog;
