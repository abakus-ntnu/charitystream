import { useState } from "react";

import { AlertsProvider } from "@/lib/Alerts";
import { StateProvider } from "@/lib/State";

import "@/styles/globals.css";
import "@/styles/tailwind.css";

export default function MyApp({ Component, pageProps }) {
  const [state, setState] = useState({ token: null });
  const [alerts, setAlerts] = useState([]);

  return (
    <StateProvider value={{ state, setState }}>
      <AlertsProvider value={{ alerts, setAlerts }}>
        <Component {...pageProps} />
      </AlertsProvider>
    </StateProvider>
  );
}
