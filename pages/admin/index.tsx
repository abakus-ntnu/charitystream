import { FormEvent, useContext, useState } from "react";
import Layout from "../../components/admin/Layout";
import State from "../../lib/State";
import { useRouter } from "next/router";
import Alerts from "../../lib/Alerts";
import { fetchRequest } from "../../lib/helpers";

export default function Admin() {
  const router = useRouter();

  const { setState } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const [token, setToken] = useState<null | string>();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetchRequest("/api/verifyCredentials", {
      method: "POST",
      password: token,
      addAlert,
    });

    if (res.status !== 200) return;

    setState({ token: token });
    router.push(`/admin/vipps`);
  };

  return (
    <Layout>
      <div
        className="w-full sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg"
      >
        <h2 className="text-center font-semibold text-3xl lg:text-4xl text-gray-800">
          Login
        </h2>

        <div>
          <form onSubmit={submit}>
            <label
              htmlFor="passord"
              className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
            >
              Dagens passord
            </label>
            <input
              id="password"
              type="text"
              name="password"
              placeholder="passord"
              className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-500 focus:outline-none focus:border-gray-200"
              required
              onChange={(e) => setToken(e.target.value)}
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
    </Layout>
  );
}
