"use client";
import { Setter } from "@/lib/types";
import { createContext, useState } from "react";

export const AlgoContext = createContext({
  algo: null as null | string,
  setAlgo: (() => {
    throw new Error("Cant use this here");
  }) as Setter<null | string>,
});

export const AlgoContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [algo, setAlgo] = useState<null | string>(null);

  return (
    <AlgoContext.Provider
      value={{
        algo,
        setAlgo,
      }}
    >
      {children}
    </AlgoContext.Provider>
  );
};
