"use client";

import React, { createContext } from "react";

export type Alert = {
  text: string;
  color: string;
};

export type AlertsContextType = {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  addAlert: (text: string, color: string) => void;
};

const defaultContext: AlertsContextType = {
  alerts: [],
  setAlerts: () => {},
  addAlert: () => {},
};

const Alerts = createContext<AlertsContextType>(defaultContext);

export const AlertsProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: Pick<AlertsContextType, "alerts" | "setAlerts">;
}) => {
  const addAlert = (text: string, color: string) => {
    value.setAlerts((prev) => [...prev, { color, text }]);
    setTimeout(() => {
      value.setAlerts((prev) => prev.filter((alert) => alert.text !== text));
    }, 3000);
  };
  const contextValue: AlertsContextType = {
    ...value,
    addAlert,
  } as AlertsContextType;
  return <Alerts.Provider value={contextValue}>{children}</Alerts.Provider>;
};

export default Alerts;
