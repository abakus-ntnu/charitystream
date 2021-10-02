const StretchGoalBar = ({ totalAmount, maxAmount, stretchGoals }) => {
  const meterLen = Math.floor((totalAmount / maxAmount) * 100);

  const nextGoal = stretchGoals.find(
    (stretchGoal) => stretchGoal.goal > totalAmount
  );
  const lowestGoal = stretchGoals[0];

  return (
    <div className="flex relative h-full w-full m-1">
      <div className="flex flex-col h-full w-12 overflow-hidden bg-green-200 rounded-3xl justify-end">
        <div
          style={{ height: `${meterLen}%`, transition: "height 2s" }}
          className="bg-green-500 shadow-none w-full"
        />
      </div>
      {stretchGoals.map((goal) => {
        const goalPosition = Math.floor((goal.goal / maxAmount) * 100);
        const goalReached = goal.goal <= totalAmount;
        const goalNext = goal === nextGoal;
        const isLowest = goal === lowestGoal;

        return (
          <div
            key={goal._id}
            className="absolute flex w-full"
            style={{ bottom: `calc(${goalPosition}%)`, left: 0 }}
          >
            <div className={"border-b border-black w-12 flex-shrink-0"} />
            <p className={`ml-2 text-2xl ${goalNext ? "text-indigo-400 animate-pulse" : ""} ${goalReached ? "line-through text-green-400" : ""}`}
               style={{ top: "0.5rem", transform: `translateY(${isLowest ? "90" : "50"}%)` }}
            >
              {goal.goal + "kr  - " + goal.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

{
  /*
  <div className="text-center">
          <div className="text-2xl">Mål:</div>
          <hr />
          <table className="table-auto">
            <tbody>
              {nextGoals.map((item, i) => {
                const color =
                  i == nextGoals.length - 1
                    ? "text-indigo-400 animate-pulse"
                    : "";
                return (
                  <tr key={item.description}>
                    <td className={`px-4 text-left text-lg ${color}`}>
                      {item.description}
                    </td>
                    <td className={`px-4 ${color}`}>{item.goal} ,-</td>
                  </tr>
                );
              })}
              {reachedGoals.map((item) => (
                <tr key={item.description}>
                  <td className="px-4 line-through text-green-400 text-left text-lg">
                    {item.description}
                  </td>
                  <td className="px-4 text-green-400 line-through">
                    {item.goal} ,-
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
   */
}

export default StretchGoalBar;
