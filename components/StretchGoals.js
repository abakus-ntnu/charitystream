import StretchGoalBar from "./StretchGoalBar";
import styles from "./StretchGoals.module.css";
import cx from "classnames";

export default function StretchGoals(props) {
  const { stretchGoals, totalAmount } = props;
  const maxAmount = stretchGoals[stretchGoals.length - 1]?.goal;

  if (stretchGoals.length === 0) {
    return <p className="text-center">Ingen stretch goals er satt!</p>;
  }
  return (
    <div className="flex flex-col flex-grow h-full">
      <div className="italic text-center">
        <p className="text-5xl font-medium w-">
          Totalt donert: {totalAmount}kr{" "}
          <span style={{ color: "blue", marginLeft: "20px" }}>
            {" "}
            Legg inn bud på aba.wtf/fest
          </span>
        </p>
      </div>
      <div
        className={cx(
          styles.mobileHeight,
          "flex items-center flex-grow p-2 overflow-hidden h-full"
        )}
      >
        <div className="w-full h-full py-4">
          <StretchGoalBar
            totalAmount={totalAmount}
            maxAmount={maxAmount}
            stretchGoals={stretchGoals}
          />
        </div>
      </div>
    </div>
  );
}
