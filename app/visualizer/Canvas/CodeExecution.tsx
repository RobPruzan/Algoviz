"use client";

import { useAppDispatch, useAppSelector } from "@/redux/store";
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
  AutoParseResult,
  DEFAULT_VALIDATOR_CODE,
  DEFAULT_VISUALIZATION_CODE,
  autoParseVariable,
  cn,
  getCode,
  getSelectedItems,
  parseNodeRepr,
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
import { CodeExecActions } from "@/redux/slices/codeExecSlice";

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
  const [variablesSideBarWidth, setVariableSideBarWidth] = useState<
    number | Percentage
  >("30%");
  const [stackViewWidth, setStackViewWidth] = useState<number | Percentage>(
    "70%"
  );

  const scrollToRef = useRef<HTMLDivElement>(null);

  const [editorHeight, setEditorHeight] = useState<number | Percentage>("60%");
  const [outputHeight, setCodeExecHeight] = useState<number | Percentage>(
    // to really fix this need to do it in the css with a calc minus for the h-10 and padding
    "37.5%"
  );
  const presetCode = useAppSelector((store) => store.canvas.present.presetCode);
  const frameRef = useRef<HTMLDivElement>(null);

  // const selectedAlgorithm = useAppSelector(
  //   (store) => store.codeExec.selectedAlgorithm
  // );

  const [selectedLocal, setSelectedLocal] = useState<string | null>(null);
  const circles = useAppSelector((store) => store.canvas.present.circles);

  const themeInfo = useTheme();
  const dispatch = useAppDispatch();
  const visualizationLength = useAppSelector(
    (store) => (store.codeExec.algoOutput?.flattenedOutput.length ?? 0) - 1
  );
  const getAlgorithmsQuery = useGetAlgorithmsQuery();
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

  useEffect(() => {
    if (scrollToRef.current) {
      const lastChild = scrollToRef.current.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [visualizationPointer]);

  const allLocals = () => {
    const locals = new Set<string>();
    codeMutation.data?.flattenedVis.type === AlgoType.Visualizer &&
      toStackSnapshotAtVisUpdate(codeMutation.data.flattenedVis.fullOutput).map(
        (change) =>
          Object.keys(change.frames[0].args.locals).forEach((i) =>
            locals.add(i)
          )
      );

    return [...locals.values()];
  };

  const getLocalSnapshot = () => {
    if (
      selectedLocal &&
      codeMutation.data?.flattenedVis.type === AlgoType.Visualizer
    ) {
      const snap = toStackSnapshotAtVisUpdate(
        codeMutation.data.flattenedVis.fullOutput
      );

      return autoParseVariable(
        snap.at(visualizationPointer)?.frames.at(0)?.args.locals[
          selectedLocal
        ] ?? ""
      );
    }
    return { type: "error", value: null, message: "Could not parse" };
  };

  const localSnapshot = getLocalSnapshot();

  return (
    <div style={{ height: "calc(100% - 60px)" }} className="w-full ">
      <Resizable
        divOneSize={editorHeight}
        divTwoSize={outputHeight}
        setDiveOneSize={setEditorHeight}
        setDivTwoSize={setCodeExecHeight}
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
                            // just remove the slice its useless
                            return [
                              `Node(ID='${k.slice(0, 30)}${
                                k.length > 30 ? "..." : ""
                              }', value: ${
                                circles.find((c) => c.id === k)?.value
                              })`,

                              v.map(
                                (i) =>
                                  `Node(ID='${i.slice(0, 30)}${
                                    i.length > 30 ? "..." : ""
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
                    <>
                      {/* {run(() => {
                        console.table({
                          variablesSideBarWidth,
                          stackViewWidth,
                        });
                      })} */}
                      <Resizable
                        resizeBarClassName="border-x-2 border-y-0"
                        divOneSize={variablesSideBarWidth}
                        divTwoSize={stackViewWidth}
                        setDiveOneSize={setVariableSideBarWidth}
                        setDivTwoSize={setStackViewWidth}
                        type="horizontal"
                        leftDiv={
                          <div className="w-full h-full overflow-y-scroll flex flex-col items-center gap-4">
                            <p className="text-lg font-bold w-full text-center p-3">
                              Variables
                            </p>
                            {allLocals().map((local) => (
                              <Button
                                key={local}
                                onClick={() => {
                                  setSelectedLocal(local);
                                }}
                                className={cn(
                                  "rounded-3xl w-[6rem] select-none ",
                                  [selectedLocal === local ? "bg-accent" : ""]
                                )}
                                variant={"outline"}
                              >
                                {local}
                              </Button>
                            ))}
                          </div>
                        }
                        rightDiv={
                          // <div className="w-full h-full bg-green-500"></div>
                          <div className="w-full h-full flex flex-col gapy-4  overflow-y-scroll">
                            <div>
                              <StackHistorySlider
                                value={[visualizationPointer]}
                                min={0}
                                max={visualizationLength}
                                onValueChange={(v) =>
                                  dispatch(
                                    CodeExecActions.setVisualizationPointer(
                                      v[0]
                                    )
                                  )
                                }
                              />
                            </div>
                            <div
                              ref={scrollToRef}
                              className="p-4 text-sm text-center"
                            >
                              <p className="text-xl font-bold mb-4">
                                {selectedLocal}
                              </p>
                              {match(localSnapshot)
                                .with({ type: "array-of-nodes" }, ({ value }) =>
                                  value?.length === 0
                                    ? "Empty!"
                                    : value?.map((v, index) => (
                                        <div
                                          key={index}
                                          className={cn([
                                            "border rounded-md p-4 flex text-xs",
                                            run(() => {
                                              if (
                                                codeMutation.data?.flattenedVis
                                                  .type ===
                                                  AlgoType.Visualizer &&
                                                selectedLocal
                                              ) {
                                                const res = autoParseVariable(
                                                  toStackSnapshotAtVisUpdate(
                                                    codeMutation.data
                                                      .flattenedVis.fullOutput
                                                  ).at(visualizationPointer - 1)
                                                    ?.frames[0].args.locals[
                                                    selectedLocal
                                                  ]
                                                );

                                                if (
                                                  res.type === "array-of-nodes"
                                                ) {
                                                  if (
                                                    !res.value.some((r) => {
                                                      return (
                                                        r.ID === v.ID &&
                                                        r.value === v.value
                                                      );
                                                    })
                                                  ) {
                                                    return "bg-green-500";
                                                  }
                                                }
                                              }

                                              return "";
                                            }),
                                          ])}
                                        >
                                          <div className="w-1/2 h-full ">
                                            <div className="h-1/4 w-full font-bold flex justify-center items-center">
                                              ID
                                            </div>
                                            <div className="h-3/4 w-full flex justify-center items-center">
                                              {(v.ID ?? "").slice(0, 20)}
                                            </div>
                                          </div>
                                          <div className="w-1/2 h-full">
                                            <div className="h-1/4 w-full font-bold flex justify-center items-center">
                                              Value
                                            </div>
                                            <div className="h-3/4 w-full flex justify-center items-center">
                                              {v.value}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                )
                                .with({ type: "table" }, ({ value }) =>
                                  value === null ? (
                                    <>Nothing to see (yet!) </>
                                  ) : (
                                    <div className="flex-col w-full h-full text-sm">
                                      {Object.entries(value ?? {}).map(
                                        ([k, v], index) => (
                                          <div
                                            key={index}
                                            className="flex w-full "
                                          >
                                            <div className="h-36 overflow-y-scroll w-full flex flex-col items-center justify-center border ">
                                              <div className="h-1/5 w-full flex">
                                                <div className="w-1/2 h-full text-center underline font-bold">
                                                  ID
                                                </div>
                                                <div className="w-1/2 h-full text-center underline font-bold">
                                                  Value
                                                </div>
                                              </div>
                                              <div className="h-4/5 w-full flex">
                                                <div className="w-1/2 h-full text-center ">
                                                  {parseNodeRepr(k).ID.slice(
                                                    0,
                                                    15
                                                  )}
                                                </div>
                                                <div className="w-1/2 h-full text-center ">
                                                  {parseNodeRepr(k).value}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="h-36 overflow-y-scroll w-full flex flex-col border">
                                              <div className="w-full h-1/5  underline font-bold text-center">
                                                Values
                                              </div>
                                              <div className="w-full h-4/5 flex flex-wrap">
                                                {v.map((entry, index) => (
                                                  <div
                                                    key={index}
                                                    className="h-fit w-fit p-3 border rounded-lg shadow-md"
                                                  >
                                                    {entry.value}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )
                                )
                                .with({ type: "string" }, ({ value }) => (
                                  <div className="w-full h-full flex-col text-sm p-2">
                                    {value}
                                  </div>
                                ))
                                .with({ type: "singleton" }, ({ value }) => (
                                  <div
                                    className={cn([
                                      "border rounded-md p-4 flex text-xs",
                                    ])}
                                  >
                                    <div className="w-1/2 h-full ">
                                      <div className="h-1/4 w-full font-bold flex justify-center items-center">
                                        ID
                                      </div>
                                      <div className="h-3/4 w-full flex justify-center items-center">
                                        {(value?.ID ?? "").slice(0, 20)}
                                      </div>
                                    </div>
                                    <div className="w-1/2 h-full">
                                      <div className="h-1/4 w-full font-bold flex justify-center items-center">
                                        Value
                                      </div>
                                      <div className="h-3/4 w-full flex justify-center items-center">
                                        {value?.value}
                                      </div>
                                    </div>
                                  </div>
                                ))
                                .otherwise(() => (
                                  <>Nothing to show (for now)!</>
                                ))}
                            </div>
                          </div>
                        }
                      />
                    </>
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
