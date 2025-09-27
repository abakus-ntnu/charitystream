"use client";

import React, { createContext } from "react";

export type StateValue = { token: string | null };

export type StateContextType = {
  state: StateValue;
  setState: React.Dispatch<React.SetStateAction<StateValue>>;
};

const defaultContext: StateContextType = {
  state: { token: null },
  setState: () => {},
};

const State = createContext<StateContextType>(defaultContext);

export const StateProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: StateContextType;
}) => {
  return <State.Provider value={value}>{children}</State.Provider>;
};

export default State;
