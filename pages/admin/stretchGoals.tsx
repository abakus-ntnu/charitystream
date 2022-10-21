import Layout from "../../components/admin/Layout";
import { useContext, useState } from "react";
import Alerts from "../../lib/Alerts";
import State from "../../lib/State";
import useSWR from "swr";
import { CharityState, StretchGoal } from "../../models/types";
import { fetcher, fetchRequest } from "../../lib/helpers";

const StretchGoals = () => {
  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const { data, mutate } = useSWR<CharityState>("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState(0);
  const [selectedGoalId, setSelectedSelectedGoalId] = useState("");

  if (!data) return <div>Loading...</div>;

  const onAddClick = async (e) => {
    e.preventDefault();
    await fetchRequest(
      "/api/stretchGoals",
      "POST",
      { description, goal },
      (res) => {
        if (res.ok) {
          addAlert(`${description} ble lagt til for ${goal}`, "green");
          setDescription("");
          setGoal(0);
          mutate();
        }
      },
      addAlert,
      state.token
    );
  };

  const onDeleteGoal = async (e) => {
    e.preventDefault();
    await fetchRequest(
      "/api/stretchGoals",
      "DELETE",
      { goalId: selectedGoalId },
      (res) => {
        if (res.ok) {
          addAlert(
            `${
              data.stretchGoals.find(
                (stretchGoal) => stretchGoal._id === selectedGoalId
              ).description
            } ble slettet.`,
            "green"
          );
          setDescription("");
          setGoal(0);
          setSelectedSelectedGoalId("");
          mutate();
        }
      },
      addAlert,
      state.token
    );
  };

  return (
    <Layout>
      <>
        <div
          className="w-full sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg"
        >
          <h1 className="font-bold text-center text-3xl text-gray-900">
            Legg til stretch goal
          </h1>
          <div className="w-full">
            <div className="mt-5 w-full">
              <form>
                <input
                  id="description"
                  type="text"
                  name="description"
                  placeholder="Beskrivelse"
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  id="goal"
                  type="number"
                  name="goal"
                  placeholder="Beløp"
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  required
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                />
                <button
                  onClick={onAddClick}
                  className="w-full py-3 mt-10 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
                >
                  Legg til stretch goal
                </button>
              </form>
            </div>
          </div>
          <h2 className="font-bold text-center text-2xl text-gray-900 mt-5">
            Fjern stretch goals
          </h2>
          <div className="w-full">
            <div className="mt-5 w-full">
              <form>
                <select
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  onChange={(e) => {
                    setSelectedSelectedGoalId(e.target.value);
                  }}
                >
                  <option>-- Velg Stretch Goal --</option>
                  {data.stretchGoals.map((stretchGoal) => {
                    return (
                      <option value={stretchGoal._id} key={stretchGoal._id}>
                        {stretchGoal.goal}kr &nbsp; - &nbsp;{" "}
                        {stretchGoal.description}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={onDeleteGoal}
                  className="w-full py-3 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
                >
                  Fjern stretch goal
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    </Layout>
  );
};

export default StretchGoals;
