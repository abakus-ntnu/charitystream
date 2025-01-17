import { FormEvent, useContext, useState } from "react";
import { Readable } from "stream";
import * as XLSX from "xlsx";

import Layout from "@/components/admin/Layout";
import SetPasswordBox from "@/components/admin/SetPasswordBox";

import Alerts from "@/lib/Alerts";
import { fetchRequest } from "@/lib/helpers";
import State from "@/lib/State";

XLSX.stream.set_readable(Readable);

const Vipps = () => {
  const [name, setName] = useState<null | string>();
  const [amount, setAmount] = useState<null | number>();

  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  if (!state?.token)
    return (
      <Layout full>
        <SetPasswordBox action="legge til donasjoner" />
      </Layout>
    );

  const addOneVipps = async (
    name: string,
    amount: number
  ): Promise<boolean> => {
    const res = await fetchRequest("/api/admin/vipps", {
      method: "POST",
      password: state.token,
      body: { name, amount: Number(amount) },
    });
    if (res.ok) {
      addAlert(`Donasjonen på ${amount}kr fra ${name} ble lagt til!`, "green");
    }
    return res.ok;
  };

  const addOne = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      addAlert(`Donasjonen mangler navn!`, "red");
      return;
    }
    if (!amount) {
      addAlert(`Donasjonen mangler mengde!`, "red");
      return;
    }

    if (await addOneVipps(name, amount)) {
      setName(null);
      setAmount(null);
    }
  };

  const addAllVipps = async (file: HTMLInputElement) => {
    const vippsFile = file.files[0];

    if (vippsFile.name.toLowerCase().endsWith(".csv")) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target.result;
        const res = await fetchRequest("/api/admin/vipps/addAll", {
          method: "POST",
          password: state.token,
          body: content,
          addAlert,
        });
        if (res.ok) {
          addAlert("Success", "green");
        }
      };
      reader.readAsText(file.files[0]);
    } else if (vippsFile.name.toLowerCase().endsWith(".xlsx")) {
      var reader = new FileReader();
      reader.onload = async (e) => {
        const wb = XLSX.read(e.target.result);
        const ws = wb.Sheets[wb.SheetNames[0]];

        ws["!merges"] = [];

        // Data has incorrect !ref-format, so we need to fix it manually
        // https://docs.sheetjs.com/docs/miscellany/errors#worksheet-only-includes-one-row-of-data
        function update_sheet_range(ws) {
          var range = { s: { r: Infinity, c: Infinity }, e: { r: 0, c: 0 } };
          Object.keys(ws)
            .filter(function (x) {
              return x.charAt(0) != "!";
            })
            .map(XLSX.utils.decode_cell)
            .forEach(function (x) {
              range.s.c = Math.min(range.s.c, x.c);
              range.s.r = Math.min(range.s.r, x.r);
              range.e.c = Math.max(range.e.c, x.c);
              range.e.r = Math.max(range.e.r, x.r);
            });
          ws["!ref"] = XLSX.utils.encode_range(range);
        }

        update_sheet_range(ws);

        let string = XLSX.utils.sheet_to_csv(ws);

        string = string.slice(
          string.indexOf("\n", string.indexOf("Salgsdato,"))
        );

        const res = await fetchRequest("/api/admin/vipps/addAll", {
          method: "POST",
          password: state.token,
          body: string,
        });
        if (res.ok) {
          addAlert("Success", "green");
        }
      };

      reader.readAsArrayBuffer(vippsFile);
    } else {
      addAlert("Couln't parse file", "red");
    }
  };

  const addAll = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = e.currentTarget.file;

    addAllVipps(file);
  };

  return (
    <Layout full>
      <div className="w-full p-2 sm:px-10 sm:py-6">
        <h1 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900">
          Legg til én donasjon:
        </h1>
        <div className="w-full">
          <div className="mt-5 w-full">
            <form onSubmit={addOne}>
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
                value={name ?? ""}
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
                value={amount ?? ""}
                onChange={(e) => setAmount(Number(e.target.value))}
              />

              <button
                type="submit"
                className="w-full py-3 bg-gray-800 rounded-sm
                  font-medium text-white uppercase
                  focus:outline-none hover:bg-gray-700 hover:shadow-none"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="w-full p-2 sm:px-10 sm:py-6 mt-10">
        <h1 className="font-bold sm:text-center text-2xl sm:text-3xl text-gray-900">
          Oppdater alle donasjoner:
        </h1>
        <div className="w-full">
          <div className="mt-5 w-full">
            <form onSubmit={addAll}>
              <label
                htmlFor="amount"
                className="block mt-2 text-xs font-semibold text-gray-600 uppercase"
              >
                Velg fil
              </label>
              <input
                type="file"
                id="file"
                name="file"
                className="block w-full text-sm text-gray-600 border border-gray-300 cursor-pointer bg-gray-50  focus:outline-none"
                accept=".csv, .xlsx"
                required
              />
              <button
                type="submit"
                className="w-full py-3 mt-4 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Vipps;
