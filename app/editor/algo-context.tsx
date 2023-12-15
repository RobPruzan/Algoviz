"use client";
import { DateToString, Setter } from "@/lib/types";
import { createContext, useContext, useState } from "react";
import { match } from "ts-pattern";
import { QueryPreset, useGetJoinedAlgos } from "./use-get-joined-algos";
import { Algorithm, Preset } from "@prisma/client";

export const AlgoContext = createContext({
  algo: null as null | string,
  setAlgo: (() => {
    throw new Error("Cant use this here");
  }) as Setter<null | string>,
});

export const CurrentCodeContext = createContext({
  code: "",
  setCode: (() => {
    throw new Error("Cant use this here");
  }) as Setter<string>,
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

export const CurrentCodeContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentCode, setCurrentCode] = useState<string>("");

  return (
    <CurrentCodeContext.Provider
      value={{
        code: currentCode,
        setCode: setCurrentCode,
      }}
    >
      {children}
    </CurrentCodeContext.Provider>
  );
};

export const useGetCurrentAlgo = ():
  | ({ type: "preset" } & QueryPreset)
  | ({ type: "algo" } & DateToString<Algorithm>)
  | { type: "none" } => {
  const { joinedAlgos } = useGetJoinedAlgos();
  const { algo } = useContext(AlgoContext);
  return (
    joinedAlgos.find((joinedAlgo) =>
      match(joinedAlgo)
        .with({ type: "preset" }, ({ name }) => {
          return name === algo;
        })
        .with({ type: "algo" }, ({ title }) => {
          return title === algo;
        })
        .run()
    ) ?? { type: "none" }
  );
};
