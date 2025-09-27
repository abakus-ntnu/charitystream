"use client";

import React, { useEffect, useMemo, useState } from "react";

import { AlertsProvider } from "@/lib/Alerts";
import { StateProvider } from "@/lib/State";

type Alert = { text: string; color: string };

export default function Providers({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [state, setState] = useState<{ token: string | null }>({ token: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("state");
      if (raw) {
        const parsed = JSON.parse(raw) as { token?: string | null };
        if (parsed && typeof parsed.token !== "undefined") {
          setState({ token: parsed.token ?? null });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (state?.token) {
        localStorage.setItem("state", JSON.stringify(state));
      } else {
        localStorage.removeItem("state");
      }
    } catch (e) {
      // ignore
    }
  }, [state?.token]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("Providers state token:", state?.token);
    }
  }, [state?.token]);

  const alertsValue = useMemo(() => ({ alerts, setAlerts }), [alerts]);
  const stateValue = useMemo(() => ({ state, setState }), [state]);

  return (
    <AlertsProvider value={alertsValue}>
      <StateProvider value={stateValue}>{children}</StateProvider>
    </AlertsProvider>
  );
}
