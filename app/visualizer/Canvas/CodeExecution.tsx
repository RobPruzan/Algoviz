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
import { Percentage, SelectedValidatorLens } from '@/lib/types';
import {
  DEFAULT_VALIDATOR_CODE,
  DEFAULT_VISUALIZATION_CODE,
  getSelectedItems,
} from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Algorithm } from '@prisma/client';
import Resizable from '../Resizeable';

import { useTheme } from 'next-themes';

import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LanguageComboBox } from '../LanguageComboBox';
import { Languages, languageSnippets } from '@/lib/language-snippets';
import { useCodeMutation } from '@/hooks/useCodeMutation';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';

type Props = {
  setUserAlgorithm: React.Dispatch<
    React.SetStateAction<
      Pick<Algorithm, 'title' | 'code' | 'description' | 'type' | 'language'>
    >
  >;
  userAlgorithm: Pick<
    Algorithm,
    'title' | 'code' | 'description' | 'type' | 'language'
  >;
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  codeMutation: ReturnType<typeof useCodeMutation>;
  autoSelectAll: boolean;
  openLanguageComboBox: boolean;
  setOpenLanguageComboBox: Dispatch<SetStateAction<boolean>>;
  language: Languages;
  setLanguage: Dispatch<SetStateAction<Languages>>;
};

const CodeExecution = ({
  setUserAlgorithm,
  userAlgorithm,
  codeMutation,
  autoSelectAll,
  language,
  openLanguageComboBox,
  selectedValidatorLens,
  setLanguage,
}: Props) => {
  const [editorHeight, setEditorHeight] = useState<number | Percentage>('60%');
  const [outputHeight, setCodeExecHeight] = useState<number | Percentage>(
    '40%'
  );

  const ioPanelRef = useRef<ElementRef<'div'>>(null);

  const width = ioPanelRef.current?.offsetWidth;
  const height = ioPanelRef.current?.offsetHeight;

  const selectedAlgorithm = useAppSelector(
    (store) => store.codeExec.selectedAlgorithm
  );

  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas.present);

  const [tabValue, setTabValue] = useState<'output' | 'input'>('input');

  const { selectedAttachableLines, selectedCircles } = getSelectedItems({
    attachableLines,
    circles,
    selectedGeometryInfo,
  });

  const themeInfo = useTheme();

  const adjacencyList: Record<string, string[]> = [
    ...Graph.getAdjacencyList({
      edges: autoSelectAll ? attachableLines : selectedAttachableLines,
      vertices: autoSelectAll ? circles : selectedCircles,
    }).entries(),
  ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
    return { ...prev, [id]: neighbors };
  }, {});

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  const currentAlgorithm = getAlgorithmsQuery.data?.find(
    (d) => d.id === selectedAlgorithm
  );

  // const code =
  //   userAlgorithm.code !== DEFAULT_VISUALIZATION_CODE &&
  //   userAlgorithm.code !== currentAlgorithm?.code
  //     ? userAlgorithm.code
  //     : currentAlgorithm?.code ?? DEFAULT_VISUALIZATION_CODE;
  const code = userAlgorithm.code ? languageSnippets[language] : '';

  const execMode = useAppSelector((store) => store.codeExec.mode);
  // const isValidatorLens = currentAlgorithm?.type === 'validator';
  // const defaultCode = match(execMode)
  //   .with('validator', () => DEFAULT_VALIDATOR_CODE)
  //   .with('visualizer', () => DEFAULT_VISUALIZATION_CODE)
  //   .exhaustive();

  // const idx = 2;

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
                language={language}
                theme={
                  themeInfo.theme === 'dark'
                    ? 'vs-dark'
                    : themeInfo.theme === 'light'
                    ? 'light'
                    : 'vs-dark'
                }
                value={userAlgorithm.code}
                // this doesn't make sense without edit functionality will do that next
                onChange={(value) => {
                  if (value) {
                    // setCode(e);
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
          <div className="h-full w-full    prevent-select flex flex-col justify-start overflow-x-scroll overflow-y-hidden items-center">
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
                    {Object.entries(adjacencyList).map(([k, v]) => (
                      <div className="flex text-2xl" key={k}>
                        <div className="">
                          {circles.find((c) => c.id === k)?.value}
                        </div>
                        :
                        <div className="">
                          {JSON.stringify(
                            v.map((v) => circles.find((c) => c.id === v)?.value)
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ))
                .with('output', () => (
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
                            key={JSON.stringify(log)}
                            className="flex items-center justify-start "
                          >
                            <div className="text-sm">{JSON.stringify(log)}</div>
                          </div>
                        )))}

                    {/* <div>
                      {codeMutation.data?.type === 'Validator' ||
                        (codeMutation.data?.type === 'Visualizer' &&
                          JSON.stringify(codeMutation.data.exitValue))}
                    </div> */}
                  </div>
                ))
                .run()}
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CodeExecution;
