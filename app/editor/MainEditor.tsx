"use client";

import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, { useContext, useRef, useSyncExternalStore } from "react";
import { nightOwlTheme } from "../visualizer/Canvas/theme";
import Resizable from "../visualizer/Resizeable";
import {
  AlgoContext,
  CurrentCodeContext,
  useGetCurrentAlgo,
} from "./algo-context";
import { useGetJoinedAlgos } from "./use-get-joined-algos";
import { match } from "ts-pattern";
import { Percentage } from "@/lib/types";

export const MainEditor = ({
  parentHeight,
}: {
  parentHeight: number | Percentage;
}) => {
  const themeInfo = useTheme();

  const parent = useRef<HTMLDivElement | null>(null);
  // const currentAlgo = useGetCurrentAlgo();
  const { code, setCode } = useContext(CurrentCodeContext);

  const tempParentHeight = useSyncExternalStore(
    (subscribe) => () => {
      window.addEventListener("resize", subscribe);
      return () => window.removeEventListener("resize", subscribe);
    },
    () => parent.current?.offsetHeight ?? 0,
    () => parent.current?.offsetHeight ?? 0
  );

  return (
    <div ref={parent} className="w-full h-full">
      <Editor
        className="flex items-center justify-center"
        beforeMount={(m) => {
          // vercel thing, basename type gets widened when building prod
          m.editor.defineTheme("night-owl", nightOwlTheme as any);
        }}
        height={
          (typeof parentHeight === "string" ? tempParentHeight : parentHeight) -
          56
        }
        theme={
          themeInfo.theme === "dark"
            ? "vs-dark"
            : themeInfo.theme === "light"
            ? "light"
            : "vs-dark"
        }
        language="python"
        onChange={(v) => setCode(v ?? "")}
        // because monaco sucks
        value={code}
        options={{
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
          },
        }}
      />
    </div>
  );
};
