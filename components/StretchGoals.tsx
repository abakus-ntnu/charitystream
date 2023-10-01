import StretchGoalBar from "./StretchGoalBar";
import styles from "./StretchGoals.module.css";
import cx from "classnames";
import { MatchingGroup, StretchGoal } from "../models/types";

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

  return (
    <div className="flex flex-col flex-grow h-full">
      <div
        className={cx(
          styles.mobileHeight,
          "flex items-center flex-grow p-2 overflow-hidden h-full"
        )}
      >
        <div className="w-full h-full py-4">
          <StretchGoalBar
            totalAmount={totalAmount + calculateMatch()}
            maxAmount={maxAmount}
            stretchGoals={stretchGoals}
          />
        </div>
      </div>
    </div>
  );
}
