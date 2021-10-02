import { createContext } from "react";

type Alert = {
  text: string;
  color: string;
};

const Alerts = createContext({ alerts: [], setAlerts: null, addAlert: null });

export const AlertsProvider = ({ children, value }) => {
  const addAlert = (text: string, color: string) => {
    value.setAlerts([...value.alerts, { color, text }]);
    setTimeout(() => {
      value.setAlerts(value.alerts.filter((a: Alert) => a.text == text));
    }, 3000);
  };
  const contextValue = { ...value, addAlert };
  return <Alerts.Provider value={contextValue}>{children}</Alerts.Provider>;
};

export default Alerts;
