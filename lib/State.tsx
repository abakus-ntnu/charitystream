import { createContext, useEffect } from "react";

const State = createContext({ state: { token: null }, setState: null });

export const StateProvider = ({ children, value }) => {
  useEffect(() => {
    value?.state?.token &&
      localStorage.setItem("state", JSON.stringify(value.state));
  }, [value]);

  useEffect(() => {
    !value?.state?.token &&
      localStorage &&
      value.setState(JSON.parse(localStorage.getItem("state")));
  }, [value]);

  return <State.Provider value={value}>{children}</State.Provider>;
};

export default State;
