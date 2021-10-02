import {useContext, useState, FormEvent} from "react";
import State from "../../lib/State";
import Alerts from "../../lib/Alerts";
import Layout from "../../components/admin/Layout";
import SetPasswordBox from "../../components/admin/SetPasswordBox";

const Vipps = () => {
  const [name, setName] = useState<null | string>();
  const [amount, setAmount] = useState<null | number>();

  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const addVipps = async (name: string, amount: number) => {
    const res = await fetch("/api/vipps", {
      method: "POST",
      headers: {
        password: state.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
          { name, amount: Number(amount) }
      ),
    });
    if (res.ok) {
      addAlert(`Donasjonen på ${amount}kr fra ${name} ble lagt til!`, "green");
    }
    if (res.status !== 200) {
      const json = await res.json();
      addAlert(
          `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
          "red"
      );
    }
  };


  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      addAlert(
          `Donasjonen mangler navn!`,
          "red"
      );
      return
    }
    if (!amount) {
      addAlert(
          `Donasjonen mangler mengde!`,
          "red"
      );
      return
    }
    //await addVipps(name, amount);
    setAmount(undefined);
    setName(undefined);
  };

  return (
      <Layout full>
        {!state?.token ? (
            <SetPasswordBox action="legge til donasjoner" />
        ) : (
            <div className="w-full sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg">
              <h1 className="font-bold text-center text-3xl text-gray-900">
                Legg til donasjon:
              </h1>
              <div className="w-full">
                <div className="mt-5 w-full">
                  <form onSubmit={submit}>
                    <label
                        htmlFor="name"
                        className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
                    >
                      Navn
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="navn"
                        className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                        required
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label
                        htmlFor="amount"
                        className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
                    >
                      Mengde
                    </label>
                    <input
                        id="amount"
                        type="number"
                        name="amount"
                        placeholder="100kr"
                        className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                        required
                        onChange={(e) => setAmount(Number(e.target.value))}
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

export default Vipps;
