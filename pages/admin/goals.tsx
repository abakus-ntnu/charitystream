import { useContext, useState, FormEvent, MouseEvent, useEffect } from "react";
import useSWR from "swr";
import State from "../../lib/State";
import Alerts from "../../lib/Alerts";
import Layout from "../../components/admin/Layout";
import SetPasswordBox from "../../components/admin/SetPasswordBox";

interface Goal {
  _id: string;
  description: string;
  goal: number;
}

const fetcher = (url) => fetch(url).then((res) => res.json());

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const [newDesc, setNewDesc] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<number | null>(null);

  const [editDesc, setEditDesc] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<number | null>(null);

  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const { data, error, mutate } = useSWR("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    const goalToEdit = data?.stretchGoals?.find((g) => g._id === goalToDelete);
    if (goalToEdit) {
      setEditDesc(goalToEdit.description);
      setEditGoal(goalToEdit.goal);
    }
  }, [data?.stretchGoals, goalToDelete]);

  const fetchRequest = async (
    url: string,
    method: string,
    body: any,
    handleRes: (res: any) => any
  ) => {
    const actualBody = method === "GET" ? null : JSON.stringify({ ...body });
    const res = await fetch(url, {
      method: method,
      headers: {
        password: state.token,
        "Content-Type": "application/json",
      },
      body: actualBody,
    });
    await handleRes(res);
    if (res.status !== 200) {
      const json = await res.json();
      addAlert(
        `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
        "red"
      );
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const addGoal = async (desc: string, goal: number): Promise<boolean> => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: {
        password: state.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: desc, goal }),
    });
    if (res.ok) {
      addAlert(`Stretchgoal ${desc} på ${goal} kr ble lagt til!`, "green");
      return true;
    }
    if (res.status !== 200) {
      try {
        const json = await res.json();
        addAlert(
          `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
          "red"
        );
      } catch (e) {
        addAlert(`${res.statusText}`, "red");
      }
    }
    return false;
  };

  const deleteGoal = async (goalId: string) => {
    if (goalId.length === 0) return;

    fetchRequest("/api/goals", "DELETE", { id: goalId }, (res) => {
      if (res.ok) {
        addAlert(
          `StretchGoal ble slettet! Det kan ta noen sekunder før lista reloades`,
          "green"
        );
        mutate();
      }
    });
  };

  const editStretchGoal = async (e: MouseEvent) => {
    if (editDesc.length === 0) return;

    fetchRequest(
      "/api/goals",
      "PATCH",
      { id: goalToDelete, description: editDesc, goal: editGoal },
      (res) => {
        if (res.ok) {
          addAlert(
            `StretchGoal ble endret! Det kan ta noen sekunder før lista reloades`,
            "green"
          );
          mutate();
        }
      }
    );
  };

  const submitDeleteGoal = async (e: FormEvent) => {
    e.preventDefault();
    if (goalToDelete.length === 0) {
      addAlert(`Du må velge et bud!`, "red");
      return;
    }
    deleteGoal(goalToDelete);
  };

  const insertGoal = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDesc) {
      addAlert(`Donasjonen mangler navn!`, "red");
      return;
    }
    if (!newGoal) {
      addAlert(`Donasjonen mangler mengde!`, "red");
      return;
    }
    if (await addGoal(newDesc, newGoal)) {
      setNewDesc(null);
      setNewGoal(null);
    }
  };

  return (
    <Layout full>
      {!state?.token ? (
        <SetPasswordBox action="Administrer stretch goals" />
      ) : (
        <>
          <div
            className="w-full sm:px-10 sm:py-6 my-6
            bg-white rounded-lg shadow-md lg:shadow-lg"
          >
            <h1 className="font-bold text-center text-3xl text-gray-900">
              Legg inn nytt stretchgoal
            </h1>
            <div className="mt-5 w-full">
              <form onSubmit={insertGoal}>
                <label
                  htmlFor="desc"
                  className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
                >
                  Strechtgoal
                </label>
                <input
                  id="desc"
                  type="text"
                  name="desc"
                  placeholder="Strechgoal (Typ Erling skinner seg)"
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  required
                  value={newDesc ?? ""}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <label
                  htmlFor="goal"
                  className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
                >
                  Goalet
                </label>
                <input
                  id="goal"
                  type="number"
                  name="goal"
                  placeholder="100kr"
                  className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                  required
                  value={newGoal ?? ""}
                  onChange={(e) => setNewGoal(Number(e.target.value))}
                />
                <button
                  type="submit"
                  className="w-full py-3 mt-10 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>

          <div
            className="w-full sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg"
          >
            <h1 className="font-bold text-center text-3xl text-gray-900">
              Administrer stretchgoals
            </h1>
            <div className="w-full">
              <div className="mt-5 w-full">
                <form onSubmit={submitDeleteGoal}>
                  <select
                    className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                    onChange={(e) => {
                      setGoalToDelete(e.target.value);
                    }}
                  >
                    {!error && data ? (
                      <>
                        <option>-- Velg et strechgoal--</option>
                        {data.stretchGoals?.map((goal) => {
                          return (
                            <option value={goal._id} key={goal._id}>
                              {goal.goal}kr &nbsp; - &nbsp; {goal.description}
                            </option>
                          );
                        })}
                      </>
                    ) : (
                      <option>Loading...</option>
                    )}
                  </select>
                  {editDesc && editGoal && (
                    <div>
                      <label
                        htmlFor="desc"
                        className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
                      >
                        Strechtgoal
                      </label>
                      <input
                        id="desc"
                        type="text"
                        name="desc"
                        placeholder="Strechgoal (Typ Erling skinner seg)"
                        className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                        required
                        value={editDesc ?? ""}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                      <label
                        htmlFor="goal"
                        className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
                      >
                        Goalet
                      </label>
                      <input
                        id="goal"
                        type="number"
                        name="goal"
                        placeholder="100kr"
                        className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                        required
                        value={editGoal ?? ""}
                        onChange={(e) => setEditGoal(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <div className="flex gap-x-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-red-700 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-red-500 hover:shadow-none"
                    >
                      Fjern stretchgoal
                    </button>

                    <button
                      type="button"
                      onClick={editStretchGoal}
                      className="w-full py-3 bg-green-700 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-green-500 hover:shadow-none"
                    >
                      Endre stretchgoal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Goals;
