import PixelSprite from "@/components/PixelSprite";

import { formatCurrency } from "@/lib/helpers";

import { StretchGoal } from "@/models/types";

const CHECK_SPRITE = [
  "......K",
  ".....KK",
  "K...KK.",
  "KK.KK..",
  ".KKK...",
  "..K....",
];

const CHECK_PALETTE = { K: "#111111" };

const Checkbox = ({ reached, next }: { reached: boolean; next: boolean }) => (
  <span
    className={`flex-shrink-0 flex items-center justify-center size-5 ${
      reached
        ? "bg-green-6 animate-pop-in"
        : next
        ? "shadow-[inset_0_0_0_2px_var(--color-red-5)]"
        : "shadow-[inset_0_0_0_2px_var(--color-border)]"
    }`}
  >
    {reached && (
      <PixelSprite rows={CHECK_SPRITE} palette={CHECK_PALETTE} scale={2} />
    )}
  </span>
);

export default function StretchGoals({
  stretchGoals,
  totalAmount,
}: {
  stretchGoals: StretchGoal[];
  totalAmount: number;
}) {
  const nextGoal = stretchGoals.find((g) => g.goal > totalAmount);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-baseline gap-4 mb-4">
        <div className="eyebrow">Stretch goals</div>
      </div>

      {stretchGoals.length === 0 ? (
        <p className="text-sm text-text-faint">Ingen stretch goals er satt!</p>
      ) : (
        <ul className="flex flex-col" aria-label="Stretch goals">
          {stretchGoals.map((goal) => {
            const reached = goal.goal <= totalAmount;
            const next = goal === nextGoal;
            return (
              <li
                key={goal._id}
                className="flex items-center gap-3 py-2.5 border-b border-border-dim last:border-b-0"
              >
                {/* keyed so the check pops in when a goal is reached live */}
                <Checkbox key={String(reached)} reached={reached} next={next} />
                <span className="sr-only">
                  {reached ? "Nådd:" : next ? "Neste mål:" : "Ikke nådd:"}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-sm md:text-base ${
                    reached
                      ? "font-medium"
                      : next
                      ? "font-semibold"
                      : "text-text-faint"
                  }`}
                  title={goal.description}
                >
                  {goal.description}
                </span>
                <span
                  className={`ml-4 whitespace-nowrap tabular-nums text-sm md:text-base ${
                    reached
                      ? "font-bold text-green-6"
                      : next
                      ? "font-bold text-red-5"
                      : "text-text-faint"
                  }`}
                >
                  {formatCurrency(goal.goal)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
