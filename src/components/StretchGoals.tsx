import { formatCurrency } from "@/lib/helpers";

import { StretchGoal } from "@/models/types";

const Checkbox = ({ reached, next }: { reached: boolean; next: boolean }) => (
  <span
    className={`flex-shrink-0 flex items-center justify-center size-5 lg:size-4 ${
      reached
        ? "bg-green-6 animate-pop-in"
        : next
        ? "bg-panel shadow-[inset_0_0_0_2px_var(--color-red-5)]"
        : "bg-panel shadow-[inset_0_0_0_2px_var(--color-border)]"
    } relative`}
  >
    {reached && (
      <svg viewBox="0 0 16 16" className="size-3.5 lg:size-3" aria-hidden>
        <path
          d="M3 8.5l3.5 3.5L13 4.5"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
      <div className="flex items-baseline gap-4 mb-4 lg:mb-1">
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
                className="group relative flex items-center gap-3 py-2.5 lg:py-px border-b border-border-dim last:border-b-0 lg:border-b-0"
              >
                <span
                  aria-hidden
                  className="hidden lg:block group-last:lg:hidden absolute left-[7px] top-1/2 h-full w-0.5 bg-border"
                />
                {/* keyed so the check pops in when a goal is reached live */}
                <Checkbox key={String(reached)} reached={reached} next={next} />
                <span className="sr-only">
                  {reached ? "Nådd:" : next ? "Neste mål:" : "Ikke nådd:"}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-sm md:text-base lg:text-sm lg:leading-4 ${
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
                  className={`ml-4 whitespace-nowrap tabular-nums text-sm md:text-base lg:text-sm lg:leading-4 ${
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
