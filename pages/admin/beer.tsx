import {useContext, useState, FormEvent} from "react";
import State from "../../lib/State";
import Alerts from "../../lib/Alerts";
import Layout from "../../components/admin/Layout";
import SetPasswordBox from "../../components/admin/SetPasswordBox";

const Beer = () => {
  const [count, setCount] = useState<null | number>();

  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const updateBeer = async (count: number) => {
    const res = await fetch("/api/beer", {
      method: "POST",
      headers: {
        password: state.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
          { count }
      ),
    });
    if (res.ok) {
      addAlert(`Antall øl oppdatert til ${count}!`, "green");
    }
    if (res.status !== 200) {
      try {
        const json = await res.json();
        addAlert(
            `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
            "red"
        );
      } catch (e) {
        addAlert(
            `${res.statusText}`,
            "red"
        );
      }
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!count) {
      addAlert(
          `Antall øl mangler!`,
          "red"
      );
      return
    }
    updateBeer(count);
  };

  return (
      <Layout full>
        {!state?.token ? (
            <SetPasswordBox action="legge til donasjoner" />
        ) : (
            <div className="w-full sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg">
              <h1 className="font-bold text-center text-3xl text-gray-900">
                Oppdater antall øl:
              </h1>
              <div className="w-full">
                <div className="mt-5 w-full">
                  <form onSubmit={submit}>
                    <input
                        id="count"
                        type="number"
                        name="count"
                        placeholder="69"
                        className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                        required
                        onChange={(e) => setCount(Number(e.target.value))}
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
            </div>
        )}
      </Layout>
  );
};

export default Beer;
