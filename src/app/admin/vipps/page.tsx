"use client";

import { FormEvent, useContext, useState } from "react";
import { redirect } from "next/navigation";
import { Readable } from "stream";
import * as XLSX from "xlsx";

import Section from "@/components/admin/Section";
import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts, { AlertsContextType } from "@/lib/Alerts";
import { fetchRequest } from "@/lib/helpers";
import State, { StateContextType } from "@/lib/State";

XLSX.stream.set_readable(Readable);

const Page = () => {
  const [name, setName] = useState<null | string>();
  const [amount, setAmount] = useState<null | number>();

  const { state } = useContext(State) as StateContextType;
  const { addAlert } = useContext(Alerts) as AlertsContextType;

  if (!state?.token) {
    redirect(`/admin`);
  }

  const addOneVipps = async (
    name: string,
    amount: number
  ): Promise<boolean> => {
    const res = await fetchRequest("/api/admin/vipps", {
      method: "POST",
      password: state.token ?? undefined,
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
      addAlert && addAlert(`Donasjonen mangler navn!`, "red");
      return;
    }
    if (!amount) {
      addAlert && addAlert(`Donasjonen mangler mengde!`, "red");
      return;
    }

    if (await addOneVipps(name, amount)) {
      setName(null);
      setAmount(null);
    }
  };

  const addAllVipps = async (file: HTMLInputElement) => {
    const fileList = file.files;
    if (!fileList || fileList.length === 0) {
      addAlert && addAlert("Ingen fil valgt", "red");
      return;
    }
    const vippsFile = fileList[0];

    if (vippsFile.name.toLowerCase().endsWith(".csv")) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e?.target && (e.target as any).result;
        if (!content) {
          addAlert && addAlert("Kunne ikke lese fil", "red");
          return;
        }
        const res = await fetchRequest("/api/admin/vipps/addAll", {
          method: "POST",
          password: state.token ?? undefined,
          body: content,
          addAlert,
        });
        if (res.ok) {
          addAlert && addAlert("Success", "green");
        }
      };
      reader.readAsText(vippsFile);
    } else if (vippsFile.name.toLowerCase().endsWith(".xlsx")) {
      var reader = new FileReader();
      reader.onload = async (e) => {
        const resBuf = e?.target && (e.target as any).result;
        if (!resBuf) {
          addAlert && addAlert("Kunne ikke lese fil", "red");
          return;
        }
        const wb = XLSX.read(resBuf);
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
          password: state.token ?? undefined,
          body: string,
        });
        if (res.ok) {
          addAlert && addAlert("Success", "green");
        }
      };

      reader.readAsArrayBuffer(vippsFile);
    } else {
      addAlert && addAlert("Couln't parse file", "red");
    }
  };

  const addAll = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = (e.currentTarget as any).file as HTMLInputElement;
    addAllVipps(file);
  };

  return (
    <>
      <Section title="Legg til én donasjon">
        <form className="flex flex-col gap-4" onSubmit={addOne}>
          <Field label="Navn" htmlFor="name">
            <input
              id="name"
              type="text"
              name="name"
              placeholder="navn"
              className="input"
              required
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Mengde" htmlFor="amount">
            <input
              id="amount"
              type="number"
              name="amount"
              placeholder="100kr"
              className="input tabular-nums"
              required
              value={amount ?? ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </Field>
          <Button type="submit">Legg til donasjon</Button>
        </form>
      </Section>

      <Section title="Oppdater alle donasjoner">
        <form className="flex flex-col gap-4" onSubmit={addAll}>
          <Field label="Velg fil (.csv eller .xlsx)" htmlFor="file">
            <input
              type="file"
              id="file"
              name="file"
              className="input cursor-pointer py-2"
              accept=".csv, .xlsx"
              required
            />
          </Field>
          <Button type="submit">Last opp</Button>
        </form>
      </Section>
    </>
  );
};

export default Page;
