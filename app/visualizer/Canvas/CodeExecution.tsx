"use client";

import { useAppSelector } from "@/redux/store";
import Editor from "@monaco-editor/react";

import * as Graph from "@/lib/graph";
// import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, {
  Dispatch,
  ElementRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { match } from "ts-pattern";
import { nightOwlTheme } from "./theme";
import {
  AlgoType,
  Percentage,
  RealMessedUpAlgoType,
  SelectedValidatorLens,
} from "@/lib/types";
import {
  DEFAULT_VALIDATOR_CODE,
  DEFAULT_VISUALIZATION_CODE,
  getCode,
  getSelectedItems,
  run,
  toStackSnapshotAtVisUpdate,
} from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Algorithm } from "@prisma/client";
import Resizable from "../Resizeable";

import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { Check, Link, Loader, PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LanguageComboBox } from "../LanguageComboBox";
import { Languages, languageSnippets } from "@/lib/language-snippets";
import { useCodeMutation } from "@/hooks/useCodeMutation";
import { useGetAlgorithmsQuery } from "@/hooks/useGetAlgorithmsQuery";
import Loading from "../loading";
import { CodeStorage } from "@/hooks/codeStorage";
import { defaultAlgo } from "../ContentWrapper";
import { toast, useToast } from "@/components/ui/use-toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { StackHistorySlider } from "./StackHistorySlider";

type Props = {
  setUserAlgorithm: React.Dispatch<React.SetStateAction<RealMessedUpAlgoType>>;
  userAlgorithm: RealMessedUpAlgoType;
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  codeMutation: ReturnType<typeof useCodeMutation>["codeMutation"];
  autoSelectAll: boolean;
  openLanguageComboBox: boolean;
  setOpenLanguageComboBox: Dispatch<SetStateAction<boolean>>;
  language: Languages;
  tabValue: "output" | "input" | "stack";
  setTabValue: Dispatch<SetStateAction<Props["tabValue"]>>;
  adjacencyList: Record<string, string[]>;
};

const CodeExecution = ({
  setUserAlgorithm,
  userAlgorithm,
  codeMutation,
  autoSelectAll,
  language,
  openLanguageComboBox,
  selectedValidatorLens,
  tabValue,
  setTabValue,
  adjacencyList,
}: Props) => {
  const [editorHeight, setEditorHeight] = useState<number | Percentage>("60%");
  const [outputHeight, setCodeExecHeight] = useState<number | Percentage>(
    // to really fix this need to do it in the css with a calc minus for the h-10 and padding
    "37.5%"
  );
  const presetCode = useAppSelector((store) => store.canvas.present.presetCode);
  const frameRef = useRef<HTMLDivElement>(null);
  const selectedAlgorithm = useAppSelector(
    (store) => store.codeExec.selectedAlgorithm
  );

  const circles = useAppSelector((store) => store.canvas.present.circles);

  const themeInfo = useTheme();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  // const currentAlgorithm = getAlgorithmsQuery.data?.find(
  //   (d) => d.id === selectedAlgorithm
  // );
  const { toast } = useToast();
  const visualizationPointer = useAppSelector(
    (store) => store.codeExec.visualizationPointer
  );
  useEffect(() => {
    if (frameRef.current) {
      const lastChild = frameRef.current.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({
          behavior: "auto",
          block: "end",
          inline: "nearest",
        });
      }
    }
  }, [visualizationPointer]);

  const editorContainerRef = useRef<any>(null);
  const monacoRef = useRef<any>(null); // Reference to store the monaco subset
  const [editorInstance, setEditorInstance] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Attempt to find the editor instance
      const editor = editorContainerRef.current?.__editorInstance;
      if (editor) {
        setEditorInstance(editor);
        clearInterval(interval);
      }
    }, 100); // poll every 100ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const getLinesChanged = () => {
    const lines: Array<number> = [];
    let prev = "";
    if (codeMutation.data?.flattenedVis.type !== AlgoType.Visualizer) {
      return [];
    }

    codeMutation.data?.flattenedVis.fullOutput
      .slice(0, visualizationPointer)
      .forEach((frame, idx) => {
        // frame.visualization.map(v => v.)
        const currVis = JSON.stringify(frame.visualization);
        if (prev !== currVis) {
          lines.push(idx);
        }
        prev = currVis;
      });

    return lines;
  };

  console.log;

  return (
    <div style={{ height: "calc(100% - 60px)" }} className="w-full ">
      <Resizable
        canvasSize={editorHeight}
        codeExecSize={outputHeight}
        setCanvasSize={setEditorHeight}
        setCodeExecSize={setCodeExecHeight}
        type="vertical"
        topDiv={
          <div
            className={`w-full h-full ${
              themeInfo.theme === "dark"
                ? "bg-[#1E1E1E]"
                : themeInfo.theme === "light"
                ? "bg-[#FFFFFE]"
                : "bg-[#1E1E1E]"
            }`}
          >
            <div
              style={{
                margin: "0px !important ",
              }}
              className="max-w-[95%]  w-full  h-full"
            >
              <Editor
                language={run(() => {
                  if (typeof window === "undefined") {
                    return userAlgorithm.language;
                  }
                  if (userAlgorithm === defaultAlgo) {
                    return CodeStorage.getCode().language;
                  } else {
                    return userAlgorithm.language;
                  }
                })}
                className="flex items-center justify-center"
                beforeMount={(m) => {
                  // vercel thing, basename type gets widened when building prod
                  m.editor.defineTheme("night-owl", nightOwlTheme as any);
                }}
                theme={
                  themeInfo.theme === "dark"
                    ? "vs-dark"
                    : themeInfo.theme === "light"
                    ? "light"
                    : "vs-dark"
                }
                options={{
                  minimap: { enabled: false },
                  folding: false,
                  scrollbar: {
                    vertical: "hidden",
                    horizontal: "hidden", // This hides the horizontal scrollbar
                  },
                }}
                value={getCode(userAlgorithm, presetCode)}
                // this doesn't make sense without edit functionality will do that next
                onChange={(value) => {
                  if (value) {
                    // setCode(e);

                    CodeStorage.setCode({
                      code: value,
                      language,
                    });
                    setUserAlgorithm((prev) => ({ ...prev, code: value }));
                  }
                }}
                // defaultLanguage="typescript"
              />
            </div>
          </div>
        }
        bottomDiv={
          <div className="h-full w-full     flex flex-col justify-start overflow-x-scroll overflow-y-hidden items-center">
            <Tabs
              value={tabValue}
              onValueChange={(v) => {
                setTabValue(() => v as "input" | "output" | "stack");
              }}
              defaultValue="input"
              className=" flex p-1 justify-evenly items-center  w-full  "
            >
              <TabsList className="w-full dark:bg-primary  p-3 flex justify-evenly items-center">
                <TabsTrigger
                  className={`w-1/5 ${
                    tabValue === "input"
                      ? "border-2 rounded-md  bg-secondary "
                      : "border-2 rounded-md border-secondary"
                  }`}
                  value="input"
                >
                  Input
                </TabsTrigger>
                <TabsTrigger
                  className={`w-1/5 ${
                    tabValue === "output"
                      ? "border-2 rounded-md  bg-secondary"
                      : "border-2 rounded-md border-secondary"
                  }`}
                  value="output"
                >
                  Output
                </TabsTrigger>
                {/* stack should be ascending in the future */}
                <TabsTrigger
                  className={`w-1/5 ${
                    tabValue === "stack"
                      ? "border-2 rounded-md  bg-secondary"
                      : "border-2 rounded-md border-secondary"
                  }`}
                  value="stack"
                >
                  Stacks
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {/* should represent the input of the adjlist as interactivable divs with data with examples on how to access them */}
            <div
              className={`
              w-full border-t-2   border-secondary flex flex-col items-start justify-start text-white  h-full overflow-y-scroll
            ${tabValue === "output" ? "bg-black" : ""}
            `}
            >
              {match(tabValue)
                .with("input", () => (
                  <Editor
                    className="flex items-center justify-center"
                    beforeMount={(m) => {
                      // vercel thing, basename type gets widened when building prod
                      m.editor.defineTheme("night-owl", nightOwlTheme as any);
                    }}
                    theme={
                      themeInfo.theme === "dark"
                        ? "vs-dark"
                        : themeInfo.theme === "light"
                        ? "light"
                        : "vs-dark"
                    }
                    language="python"
                    value={JSON.stringify(
                      Object.fromEntries(
                        Object.entries(adjacencyList)
                          .sort((a, b) => {
                            const [aK, aV] = a;
                            const [bK, bV] = b;
                            const aNodeValue = circles.find(
                              (c) => c.id === aK
                            )?.value;
                            const bNodeValue = circles.find(
                              (c) => c.id === bK
                            )?.value;
                            if (aNodeValue && bNodeValue) {
                              return aNodeValue - bNodeValue;
                            }
                            return 0;
                          })
                          .map(([k, v]) => {
                            return [
                              `Node(ID='${k.slice(0, 10)}${
                                k.length > 10 ? "..." : ""
                              }', value: ${
                                circles.find((c) => c.id === k)?.value
                              })`,

                              v.map(
                                (i) =>
                                  `Node(ID='${i.slice(0, 10)}${
                                    i.length > 10 ? "..." : ""
                                  }', value=${
                                    circles.find((c) => c.id === i)?.value
                                  })`
                              ),
                            ];
                          })
                      )
                    )
                      .replaceAll("],", "]\n ")
                      .replace(/"Node\(([^"]+)\)"/g, "Node($1)")}
                    options={{
                      minimap: { enabled: false },
                      folding: false,
                      lineNumbers: "off",
                      readOnly: true,
                      scrollbar: {
                        vertical: "hidden",
                        horizontal: "hidden",
                      },
                    }}
                  />
                ))
                .with("output", () =>
                  codeMutation.isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader className="animate-spin" />
                    </div>
                  ) : (
                    <aside className="bg-black pl-2 text-white  rounded-lg max-w-lg text-sm font-mono w-full h-full">
                      {codeMutation.data?.flattenedVis.type === "Validator" ||
                        (codeMutation.data?.flattenedVis.type ===
                          "Visualizer" && (
                          <div className="flex flex-col items-start justify-start text-sm text-white">
                            {codeMutation.data?.flattenedVis.logs.slice(0, -1)}
                          </div>
                        ))}

                      {codeMutation.data?.flattenedVis.type === "error" &&
                        codeMutation.data?.flattenedVis.logs.map(
                          (log, index) => (
                            <>
                              <div
                                key={index}
                                className="flex px-3 items-center justify-start "
                              >
                                <div className="text-sm text-red-500">
                                  {JSON.stringify(log)
                                    .replace(`"`, "")
                                    .trim()
                                    .slice(0, -1)
                                    .split("\\n")

                                    .map((l, idx) => {
                                      return (
                                        <div key={idx} className="mt-2">
                                          {l}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </>
                          )
                        )}
                    </aside>
                  )
                )
                .with("stack", () => {
                  return (
                    <div className="w-full h-full flex ">
                      <div className="w-1/4 min-w-fit border-r flex flex-col overflow-y-scroll rounded-none">
                        <p className="text-lg font-bold w-full text-center p-3">
                          Variables
                        </p>
                        <Button
                          className="w-full rounded-none border-0 border-b border-t min-w-[8rem]"
                          variant={"outline"}
                        >
                          test
                        </Button>
                        <Button
                          className="w-full rounded-none border-0 border-b"
                          variant={"outline"}
                        >
                          test
                        </Button>
                        <Button
                          className="w-full rounded-none border-0 border-b"
                          variant={"outline"}
                        >
                          test
                        </Button>
                        <Button
                          className="w-full rounded-none border-0 border-b"
                          variant={"outline"}
                        >
                          test
                        </Button>
                        <Button
                          className="w-full rounded-none border-0 border-b"
                          variant={"outline"}
                        >
                          test
                        </Button>
                        <Button
                          className="w-full rounded-none border-0 border-b"
                          variant={"outline"}
                        >
                          test
                        </Button>
                        <Button
                          className="w-full rounded-none border-0 border-b"
                          variant={"outline"}
                        >
                          test
                        </Button>
                      </div>
                      <div className="w-3/4">
                        <div className="flex items-end w-full">
                          <Button variant={"ghost"} size={"icon"}>
                            <Link />
                          </Button>

                          <StackHistorySlider />
                        </div>
                        <div className="border">
                          <Button size={"icon"}>
                            <PlusCircle />
                          </Button>
                        </div>
                        <div className="flex flex-col w-full p-3">
                          <div className="flex items-center justify-center border p-4">
                            fdsf
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })

                .run()}
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CodeExecution;

export const StackFrame = () => {};
