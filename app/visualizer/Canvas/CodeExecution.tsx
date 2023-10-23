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
import { Check, Loader } from "lucide-react";
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
                console.log({ v });
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
                {/* <TabsTrigger
                  className={`w-1/5 ${
                    tabValue === "stack"
                      ? "border-2 rounded-md  bg-secondary"
                      : "border-2 rounded-md border-secondary"
                  }`}
                  value="stack"
                >
                  Variable Stack
                </TabsTrigger> */}
                {/* Lines will be for stepping through the program */}
                {/* <TabsTrigger
                  className={`w-1/5 ${
                    tabValue === "stack"
                      ? "border-2 rounded-md  bg-secondary"
                      : "border-2 rounded-md border-secondary"
                  }`}
                  value="stack"
                >
                  Lines
                </TabsTrigger> */}
              </TabsList>
            </Tabs>
            {/* should represent the input of the adjlist as interactivable divs with data with examples on how to access them */}
            <div className="  pt-3 w-full border-t-2   border-secondary flex flex-col items-start justify-start text-white  h-full overflow-y-scroll">
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
                        Object.entries(adjacencyList).map(([k, v]) => {
                          return [
                            circles.find((c) => c.id === k)?.value,
                            v.map(
                              (v) => circles.find((c) => c.id === v)?.value
                            ),
                          ];
                        })
                      )
                    ).replaceAll("],", "]\n ")}
                    options={{
                      minimap: { enabled: false },
                      folding: false,
                      lineNumbers: "off",
                      fontSize: 14,
                      readOnly: true,
                      scrollbar: {
                        vertical: "hidden",
                        horizontal: "hidden", // This hides the horizontal scrollbar
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
                    <div>
                      {codeMutation.data?.flattenedVis.type === "Validator" ||
                        (codeMutation.data?.flattenedVis.type ===
                          "Visualizer" && (
                          <div className="flex flex-col items-start justify-start text-sm">
                            {codeMutation.data?.flattenedVis.logs}
                          </div>
                        ))}
                      {/* {codeMutation.data?.flattenedVis.type === "Validator" ||
                        (codeMutation.data?.flattenedVis.type ===
                          "Visualizer" &&
                          codeMutation.data?.flattenedVis.flattenedOutput.map(
                            (log, indexxx) => (
                              <div
                                key={indexxx}
                                className="flex items-center justify-start "
                              >
                                <div className="text-md flex flex-col">
                                  {log
                                    .map(
                                      (id) =>
                                        circles.find((c) => c.id === id)?.value
                                    )
                                    .filter(Boolean)

                                    .map((l, index) => (
                                      <div className="mt-2" key={indexxx}>
                                        {l}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )
                          ))} */}

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
                    </div>
                  )
                )
                .with("stack", () => {
                  return (
                    <>
                      <div className="w-full h-10 border-b ">hi</div>
                      {run(() => {
                        if (codeMutation.isLoading) {
                          return <Loader className="animate-spin" />;
                        }
                        if (codeMutation.data?.flattenedVis.type === "error") {
                          setTabValue(() => {
                            toast({
                              title:
                                "Code has errors, can't view your stacks just yet",
                              variant: "destructive",
                            });
                            return "output";
                          });
                        }
                        return codeMutation.data?.flattenedVis.type ===
                          AlgoType.Visualizer ? (
                          <>
                            {console.log(
                              "what dis dis",
                              toStackSnapshotAtVisUpdate(
                                codeMutation.data.flattenedVis.fullOutput
                              ),
                              codeMutation.data.flattenedVis.flattenedOutput
                            )}
                            {toStackSnapshotAtVisUpdate(
                              codeMutation.data.flattenedVis.fullOutput
                            ).map((output, index) => {
                              // need [0] because of lame serialization, its only every gonna be [data] form
                              const currentFrame = output.frames[0];
                              // console.log(output.tag);
                              // if (output.tag === "Return") {
                              //   <div
                              //     ref={frameRef}
                              //     key={
                              //       currentFrame.name +
                              //       currentFrame.line +
                              //       JSON.stringify(currentFrame.args)
                              //     }
                              //     className={`
                              //     flex flex-col bg-red-700 rounded-md p-3 w-full items-center justify-center border-2 text-sm`}
                              //   >
                              //     <div>Line: {output.line}</div>
                              //     {/* {output.tag} */}
                              //     <div>
                              //       {getLinesChanged().some(
                              //         (line) => line === index
                              //       ) && <>Updated Vis</>}
                              //     </div>

                              //     {/* {JSON.stringify(output.frames[0].args.locals)} */}
                              //   </div>;
                              // }
                              // if (output.tag === "Line") {
                              //   return (
                              //     <div
                              //       ref={frameRef}
                              //       key={`outter-${index} ${currentFrame.line}`}
                              //       className={`

                              //       ${
                              //         getLinesChanged().some(
                              //           (line) => line === index
                              //         )
                              //           ? "bg-green-700"
                              //           : ""
                              //       }
                              //       flex   mt-2 flex-col rounded-md p-2 w-full items-center justify-center border-2 text-xs`}
                              //     >
                              //       <div className="text-md font-bold">
                              //         Line: {output.line}
                              //       </div>
                              //       {/* {output.tag} */}
                              //       <div>
                              //         {getLinesChanged().some(
                              //           (line) => line === index
                              //         ) && <>Updated Vis</>}
                              //       </div>
                              //       <div className="flex mt-2 flex-col  items-center justify-center text-xs gap-2 overflow-x-scroll">
                              //         <p className="text-md font-bold">Locals:</p>
                              //         {Object.entries(currentFrame.args.locals).map(
                              //           ([k, v], index) => (
                              //             <div
                              //               className="w-full flex border rounded-md p-3"
                              //               key={`${k} ${index}`}
                              //             >
                              //               <div className="font-bold text-md flex w-1/2 ">
                              //                 {k}
                              //               </div>
                              //               <div className="flex w-1/2 h-12 overflow-y-scroll">
                              //                 {JSON.stringify(v)}
                              //               </div>
                              //             </div>
                              //           )
                              //         )}
                              //       </div>

                              //       {/* {JSON.stringify(output.frames[0].args.locals)} */}
                              //     </div>
                              //   );
                              // }
                              // const currentFrame = output.frames[0];
                              // if (output.tag === 'Line') {
                              // return
                              // }

                              return (
                                <div
                                  ref={frameRef}
                                  key={`inner-${index} ${currentFrame.line}`}
                                  className="flex  rounded-md flex-col items-center justify-center border-2 w-full bg-secondary"
                                >
                                  <div className="flex items-center justify-center font-bold text-xl ">
                                    Function Name: {currentFrame.name}
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-xs p-3 gap-2 ">
                                    <p className="text-lg font-bold">Locals:</p>
                                    {
                                      // weird
                                      // Object.entries(currentFrame.args.locals).map(
                                      //   ([k, v]) => (
                                      //     <div key={k}>
                                      //       {k}={v}
                                      //     </div>
                                      //   )
                                      // )
                                    }
                                    {Object.entries(
                                      currentFrame.args.locals
                                    ).map(([k, v], index) => (
                                      <div
                                        className="w-full flex border rounded-md p-3"
                                        key={`${k} ${index}`}
                                      >
                                        <div className="font-bold text-md flex w-1/2 ">
                                          {k}
                                        </div>
                                        <div className="flex w-1/2  h-16 overflow-y-scroll">
                                          {JSON.stringify(v)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="w-full flex items-center justify-center">
                                    Line Number:
                                    {index}
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        ) : undefined;

                        // return codeMutation.data?.flattenedVis.type === AlgoType.Visualizer ? (

                        //   ) : <></>
                      })}
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
