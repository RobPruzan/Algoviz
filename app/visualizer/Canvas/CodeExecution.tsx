'use client';

import { useAppSelector } from '@/redux/store';
import Editor from '@monaco-editor/react';

import * as Graph from '@/lib/graph';
// import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, {
  Dispatch,
  ElementRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { match } from 'ts-pattern';
import { nightOwlTheme } from './theme';
import {
  Percentage,
  RealMessedUpAlgoType,
  SelectedValidatorLens,
} from '@/lib/types';
import {
  DEFAULT_VALIDATOR_CODE,
  DEFAULT_VISUALIZATION_CODE,
  getCode,
  getSelectedItems,
  run,
} from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Algorithm } from '@prisma/client';
import Resizable from '../Resizeable';

import { useTheme } from 'next-themes';

import { Switch } from '@/components/ui/switch';
import { Check, Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LanguageComboBox } from '../LanguageComboBox';
import { Languages, languageSnippets } from '@/lib/language-snippets';
import { useCodeMutation } from '@/hooks/useCodeMutation';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';
import Loading from '../loading';
import { CodeStorage } from '@/hooks/codeStorage';
import { defaultAlgo } from '../ContentWrapper';

type Props = {
  setUserAlgorithm: React.Dispatch<React.SetStateAction<RealMessedUpAlgoType>>;
  userAlgorithm: RealMessedUpAlgoType;
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  codeMutation: ReturnType<typeof useCodeMutation>['codeMutation'];
  autoSelectAll: boolean;
  openLanguageComboBox: boolean;
  setOpenLanguageComboBox: Dispatch<SetStateAction<boolean>>;
  language: Languages;
  tabValue: 'output' | 'input';
  setTabValue: Dispatch<SetStateAction<Props['tabValue']>>;
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
  const [editorHeight, setEditorHeight] = useState<number | Percentage>('60%');
  const [outputHeight, setCodeExecHeight] = useState<number | Percentage>(
    // to really fix this need to do it in the css with a calc minus for the h-10 and padding
    '37.5%'
  );
  const presetCode = useAppSelector((store) => store.canvas.present.presetCode);

  // const ioPanelRef = useRef<ElementRef<'div'>>(null);

  // const width = ioPanelRef.current?.offsetWidth;
  // const height = ioPanelRef.current?.offsetHeight;

  const selectedAlgorithm = useAppSelector(
    (store) => store.codeExec.selectedAlgorithm
  );

  const circles = useAppSelector((store) => store.canvas.present.circles);

  // const { selectedAttachableLines, selectedCircles } = getSelectedItems({
  //   attachableLines,
  //   circles,
  //   selectedGeometryInfo,
  // });

  const themeInfo = useTheme();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  const currentAlgorithm = getAlgorithmsQuery.data?.find(
    (d) => d.id === selectedAlgorithm
  );

  // const code = userAlgorithm.code ? languageSnippets[language] : '';

  // const execMode = useAppSelector((store) => store.codeExec.mode);
  // // if (codeMutation.data?.type === 'error') {
  // //   console.log(codeMutation.data.output.map((o) => o.split('\n')));
  // // }

  return (
    <div style={{ height: 'calc(100% - 60px)' }} className="w-full ">
      <Resizable
        canvasSize={editorHeight}
        codeExecSize={outputHeight}
        setCanvasSize={setEditorHeight}
        setCodeExecSize={setCodeExecHeight}
        type="vertical"
        topDiv={
          <div
            className={`w-full h-full ${
              themeInfo.theme === 'dark'
                ? 'bg-[#1E1E1E]'
                : themeInfo.theme === 'light'
                ? 'bg-[#FFFFFE]'
                : 'bg-[#1E1E1E]'
            }`}
          >
            <div
              style={{
                margin: '0px !important ',
              }}
              className="max-w-[95%]  w-full  h-full"
            >
              <Editor
                className="flex items-center justify-center"
                beforeMount={(m) => {
                  // vercel thing, basename type gets widened when building prod
                  m.editor.defineTheme('night-owl', nightOwlTheme as any);
                }}
                language={run(() => {
                  if (typeof window === 'undefined') {
                    return userAlgorithm.language;
                  }
                  if (userAlgorithm === defaultAlgo) {
                    return CodeStorage.getCode().language;
                  } else {
                    return userAlgorithm.language;
                  }
                })}
                theme={
                  themeInfo.theme === 'dark'
                    ? 'vs-dark'
                    : themeInfo.theme === 'light'
                    ? 'light'
                    : 'vs-dark'
                }
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
                options={{
                  minimap: { enabled: false },
                  folding: false,
                  scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden', // This hides the horizontal scrollbar
                  },
                }}
              />
            </div>
          </div>
        }
        bottomDiv={
          <div className="h-full w-full     flex flex-col justify-start overflow-x-scroll overflow-y-hidden items-center">
            <Tabs
              value={tabValue}
              onValueChange={(v) =>
                setTabValue((prev) => (prev === 'output' ? 'input' : 'output'))
              }
              defaultValue="input"
              className=" flex p-1 justify-evenly items-center  w-full  "
            >
              <TabsList className="w-full dark:bg-primary  p-3 flex justify-evenly items-center">
                <TabsTrigger
                  className={`w-1/5 ${
                    tabValue === 'input'
                      ? 'border-2 rounded-md  bg-secondary '
                      : 'border-2 rounded-md border-secondary'
                  }`}
                  value="input"
                >
                  Input
                </TabsTrigger>
                <TabsTrigger
                  className={`w-1/5 ${
                    tabValue === 'output'
                      ? 'border-2 rounded-md  bg-secondary'
                      : 'border-2 rounded-md border-secondary'
                  }`}
                  value="output"
                >
                  Output
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {/* should represent the input of the adjlist as interactivable divs with data with examples on how to access them */}
            <div className="  pl-5 pt-3 w-full border-t-2   border-secondary flex flex-col items-start justify-start text-white  h-full overflow-y-scroll">
              {match(tabValue)
                .with('input', () => (
                  <>
                    {Object.entries(adjacencyList).length === 0 && (
                      <>
                        <div className="w-full  h-full flex-col flex items-center font-bold text-xl justify-start text-gray-500">
                          <p>No graph selected in playground</p>
                          <div className="flex  justify-evenly w-1/3"></div>
                        </div>
                      </>
                    )}
                    {Object.entries({ ...adjacencyList })
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([k, v]) => (
                        <div className="flex text-2xl" key={k}>
                          <div className="">
                            {circles.find((c) => c.id === k)?.value}
                          </div>
                          :
                          <div className="">
                            {JSON.stringify(
                              v.map(
                                (v) => circles.find((c) => c.id === v)?.value
                              )
                            )}
                          </div>
                        </div>
                      ))}
                  </>
                ))
                .with('output', () =>
                  codeMutation.isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader className="animate-spin" />
                    </div>
                  ) : (
                    <div>
                      {codeMutation.data?.type === 'Validator' ||
                        (codeMutation.data?.type === 'Visualizer' && (
                          <div className="flex flex-col items-start justify-start text-sm">
                            {codeMutation.data.logs}
                          </div>
                        ))}
                      {codeMutation.data?.type === 'Validator' ||
                        (codeMutation.data?.type === 'Visualizer' &&
                          codeMutation.data?.output.map((log) => (
                            <div
                              key={JSON.stringify(log).replace(`"`, '')}
                              className="flex items-center justify-start "
                            >
                              <div className="text-md flex flex-col">
                                {log
                                  .map(
                                    (id) =>
                                      circles.find((c) => c.id === id)?.value
                                  )
                                  .filter(Boolean)

                                  .map((l) => (
                                    <div className="mt-2" key={l}>
                                      {l}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )))}

                      {codeMutation.data?.type === 'error' &&
                        codeMutation.data.output.map((log) => (
                          <>
                            <div
                              key={JSON.stringify(log)}
                              className="flex items-center justify-start "
                            >
                              <div className="text-sm text-red-500">
                                {JSON.stringify(log)
                                  .replace(`"`, '')
                                  .trim()
                                  .split('\\n')
                                  .map((l) => {
                                    return (
                                      <div key={l} className="mt-2">
                                        {l}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </>
                        ))}
                    </div>
                  )
                )
                .run()}
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CodeExecution;
