import StretchGoalBar from "@/components/StretchGoalBar";

import { MatchingGroup, StretchGoal } from "@/models/types";

export default function StretchGoals({
  stretchGoals,
  totalAmount,
  matchingGroup,
}: {
  stretchGoals: StretchGoal[];
  totalAmount: number;
  matchingGroup: MatchingGroup;
}) {
  const maxAmount = stretchGoals[stretchGoals.length - 1]?.goal;

  if (stretchGoals.length === 0) {
    return <p className="text-center">Ingen stretch goals er satt!</p>;
  }

  const calculateMatch = () =>
    Math.min(
      Math.floor(totalAmount * matchingGroup.fraction),
      matchingGroup.max
    );

  const effectiveTotal = totalAmount;

  return (
    <div className="w-full h-96">
      <StretchGoalBar
        totalAmount={effectiveTotal}
        maxAmount={maxAmount}
        stretchGoals={stretchGoals}
      />
    </div>
  );
}
