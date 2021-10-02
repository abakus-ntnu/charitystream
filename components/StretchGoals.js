import StretchGoalBar from "./StretchGoalBar";

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
          Totalt donert: {totalAmount}kr
        </p>
      </div>
      <div className="flex items-center flex-grow p-2 overflow-hidden">
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
