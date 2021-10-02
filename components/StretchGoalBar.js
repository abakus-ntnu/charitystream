const StretchGoalBar = ({ totalAmount, maxAmount, goals }) => {
  const meterLen = Math.floor((totalAmount / maxAmount) * 100);

  return (
    <div className="flex relative h-full w-full m-1">
      <div className="flex flex-col h-full w-12 overflow-hidden bg-green-200 rounded-3xl justify-end">
        <div
          style={{ height: `${meterLen}%`, transition: "height 2s" }}
          className="bg-green-500 shadow-none w-full"
        />
      </div>
      {goals.map((goal) => {
        const goalPosition = Math.floor((goal.goal / maxAmount) * 100);

        return (
          <div
            key={goal.description}
            className="absolute leading-4 flex w-full"
            style={{ bottom: `calc(${goalPosition}%)`, left: 0 }}
          >
            <div className="border-b border-black w-12 flex-shrink-0" />
            <p className="relative ml-2" style={{ top: "0.5rem" }}>
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
