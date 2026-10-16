"use client";

import { FormEvent, useContext, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Field from "@/components/Field";

import Alerts from "@/lib/Alerts";
import { fetchRequest } from "@/lib/helpers";
import State from "@/lib/State";

export default function Admin() {
  const router = useRouter();

  const { setState } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const [token, setToken] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetchRequest("/api/admin/verifyCredentials", {
      method: "POST",
      password: token ?? undefined,
      addAlert,
    });

    if (res.status !== 200) return;

    setState({ token: token });
    router.push(`/admin/vipps`);
  };

  return (
    <div className="w-full max-w-[22rem] mx-auto mt-[12vh] flex flex-col gap-3">
      <h1 className="page-title text-[2rem] mb-3">Logg inn</h1>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <Field label="Dagens passord" htmlFor="password">
          <input
            id="password"
            type="text"
            name="password"
            placeholder="passord"
            className="input"
            required
            onChange={(e) => setToken(e.target.value)}
          />
        </Field>
        <Button type="submit">Logg inn</Button>
      </form>
    </div>
  );
}
