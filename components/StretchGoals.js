import StretchGoalBar from "./StretchGoalBar";

export default function StretchGoals(props) {
  const { stretchGoals, totalAmount } = props;
  const maxAmount = stretchGoals[stretchGoals.length - 1]?.goal;
  const nextGoal = stretchGoals.find(
    (stretchGoal) => stretchGoal.goal > totalAmount
  );

  const nextGoals = stretchGoals
    .filter((stretchGoal) => stretchGoal.goal > totalAmount)
    .reverse();
  const reachedGoals = stretchGoals
    .filter((goal) => goal.goal <= totalAmount)
    .reverse();
  if (stretchGoals.length === 0) {
    return <p className="text-center">Ingen stretch goals er satt!</p>;
  }
  return (
    <div className="flex flex-col flex-grow h-full">
      <div className="italic text-center">
        <p className="text-3xl font-medium w-">Totalt innsamlet</p>
      </div>
      <div className="flex items-center flex-grow p-2 overflow-hidden">
        <div className="w-full h-full">
          {
            //      <p className="absolute flex items-center justify-center w-full h-full text-xl text-black">{`${totalAmount}kr av ${maxAmount}kr`}</p>
          }
          <StretchGoalBar
            totalAmount={totalAmount}
            maxAmount={maxAmount}
            goals={stretchGoals}
          />
          {/*<div className="flex text-xl font-semibold text-center justify-evenly">
              <p>
                Neste stretch goal:{" "}
                {nextGoal
                  ? `${nextGoal.description} på ${nextGoal.goal}kr`
                  : "Tomt for stretchGoals :("}{" "}
              </p>
            </div>*/}
        </div>
      </div>
    </div>
  );
}
