import { formatCurrency } from "@/lib/helpers";

import { StretchGoal } from "@/models/types";

const StretchGoalBar = ({
  totalAmount,
  maxAmount,
  stretchGoals,
}: {
  totalAmount: number;
  maxAmount: number;
  stretchGoals: StretchGoal[];
}) => {
  const fillPercent = Math.min(
    100,
    Math.max(0, (totalAmount / maxAmount) * 100)
  );

  const nextGoal = stretchGoals.find((g) => g.goal > totalAmount);
  const lowestGoal = stretchGoals[0];

  return (
    <div
      className="relative flex h-full w-full select-none"
      aria-label="Stretch goals fremdrift"
    >
      <div className="flex flex-col h-full w-16 overflow-hidden rounded-2xl border border-neutral-700/60 bg-neutral-800/40 justify-end">
        <div
          style={{
            height: `${fillPercent}%`,
            transition: "height 1.2s cubic-bezier(.4,0,.2,1)",
          }}
          className="w-full bg-green-300/20"
        />
      </div>

      {stretchGoals.map((goal) => {
        const goalPosition = Math.min(
          100,
          Math.max(0, (goal.goal / maxAmount) * 100)
        );
        const goalReached = goal.goal <= totalAmount;
        const goalNext = goal === nextGoal;
        const isLowest = goal === lowestGoal;

        return (
          <div
            key={goal._id}
            className="absolute flex w-full"
            style={{ bottom: `calc(${goalPosition}% - 25px)`, left: 0 }}
          >
            <div className="relative w-16 flex-shrink-0 flex justify-center">
              <div
                className={`h-0.5 w-full ${
                  goalReached ? "bg-emerald-400" : "bg-neutral-600"
                }`}
              />
            </div>
            <div
              className={`ml-3 text-xs md:text-sm pr-4 py-0.5 -translate-y-1/2 rounded inline-flex items-center gap-2 ${
                goalReached
                  ? "text-emerald-300"
                  : goalNext
                  ? "text-red-400"
                  : "text-neutral-400"
              } ${goalNext ? "font-semibold" : ""}`}
            >
              <span className="tabular-nums whitespace-nowrap">
                {formatCurrency(goal.goal)}
              </span>
              <span className="truncate" title={goal.description}>
                {goal.description}
              </span>
            </div>
          </div>
        );
      })}

      <div
        className="absolute left-16 ml-2 font-semibold text-xs md:text-sm flex items-center gap-2"
        style={{ bottom: `${fillPercent}%`, transform: "translateY(50%)" }}
      >
        <span className="tabular-nums">→ {formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};

export default StretchGoalBar;
