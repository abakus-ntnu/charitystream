import { formatCurrency, percentage } from "@/lib/helpers";
import { useCountUp } from "@/lib/useCountUp";

import { StretchGoal } from "@/models/types";

type Props = {
  total: number;
  stretchGoals: StretchGoal[];
};

const DonationTotal = ({ total, stretchGoals }: Props) => {
  const shown = useCountUp(total);

  const nextIndex = stretchGoals.findIndex((g) => g.goal > total);
  const nextGoal = stretchGoals[nextIndex];
  const previousGoal = nextIndex > 0 ? stretchGoals[nextIndex - 1].goal : 0;
  const progress = nextGoal
    ? percentage(total - previousGoal, nextGoal.goal - previousGoal)
    : 100;

  return (
    <div className="flex flex-col justify-between h-full gap-8">
      <div className="flex flex-col gap-1">
        <p className="eyebrow m-0">Totalt donert</p>
        <p className="stat-display text-green-6">
          <span
            key={shown.bumps}
            className={shown.bumps ? "inline-block animate-bump" : undefined}
          >
            {formatCurrency(shown.value)}
          </span>
        </p>
      </div>

      {stretchGoals.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            {nextGoal ? (
              <>
                <span className="min-w-0 truncate">
                  <span className="eyebrow mr-2">Neste mål</span>
                  <span className="font-semibold" title={nextGoal.description}>
                    {nextGoal.description}
                  </span>
                </span>
                <span className="text-text-dim tabular-nums whitespace-nowrap">
                  {formatCurrency(nextGoal.goal - total)} igjen
                </span>
              </>
            ) : (
              <span className="font-semibold text-green-6">
                Alle stretch goals er nådd!
              </span>
            )}
          </div>
          <div
            className="h-2 w-full bg-ink-alt overflow-hidden"
            role="progressbar"
            aria-label="Fremdrift mot neste stretch goal"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-green-6 transition-[width] duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationTotal;
