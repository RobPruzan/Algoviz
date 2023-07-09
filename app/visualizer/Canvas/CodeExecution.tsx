'use client';
import { useAppSelector } from '@/redux/store';
import Editor from '@monaco-editor/react';

import * as Graph from '@/lib/graph';
// import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { nightOwlTheme } from './theme';
import { Percentage, SelectedValidatorLens } from '@/lib/types';
import {
  DEFAULT_VALIDATOR_CODE,
  DEFAULT_VISUALIZATION_CODE,
} from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Algorithm } from '@prisma/client';
import Resizable from '../Resizeable';

import { useGetAlgorithmsQuery } from '../hooks/useGetAlgorithmsQuery';
import { useTheme } from 'next-themes';
import { useCodeMutation } from '../hooks/useCodeMutation';
type Props = {
  setUserAlgorithm: React.Dispatch<
    React.SetStateAction<Pick<Algorithm, 'code' | 'description' | 'title'>>
  >;
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  codeMutation: ReturnType<typeof useCodeMutation>;
};

const CodeExecution = ({ setUserAlgorithm, codeMutation }: Props) => {
  const [editorHeight, setEditorHeight] = useState<number | Percentage>('60%');
  const [outputHeight, setCodeExecHeight] = useState<number | Percentage>(
    '40%'
  );

  const selectedAlgorithm = useAppSelector(
    (store) => store.codeExec.selectedAlgorithm
  );

  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas);

  const [tabValue, setTabValue] = useState<'output' | 'input'>('input');

  const selectedAttachableLines = attachableLines.filter((line) =>
    // not a set because of redux :(
    selectedGeometryInfo?.selectedIds.includes(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.includes(circle.id)
  );
  console.log('selectedCircles', selectedCircles);

  const themeInfo = useTheme();

  const adjacencyList: Record<string, string[]> = [
    ...Graph.getAdjacencyList({
      edges: selectedAttachableLines,
      vertices: selectedCircles,
    }).entries(),
  ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
    return { ...prev, [id]: neighbors };
  }, {});

  console.log('adj list', adjacencyList);

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  const currentAlgorithm = getAlgorithmsQuery.data?.find(
    (d) => d.id === selectedAlgorithm
  );
  // console.log('all algos', getAlgorithmsQuery.data);

  const execMode = useAppSelector((store) => store.codeExec.mode);
  const isValidatorLens = currentAlgorithm?.type === 'validator';
  const defaultCode = match(execMode)
    .with('validator', () => DEFAULT_VALIDATOR_CODE)
    .with('visualizer', () => DEFAULT_VISUALIZATION_CODE)
    .exhaustive();

  return (
    <div className="w-full h-[93%]">
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
                // theme="night-owl"
                theme={
                  themeInfo.theme === 'dark'
                    ? 'vs-dark'
                    : themeInfo.theme === 'light'
                    ? 'light'
                    : 'vs-dark'
                }
                value={currentAlgorithm?.code ?? defaultCode}
                // this doesn't make sense without edit functionality will do that next
                onChange={(value) => {
                  if (value) {
                    // setCode(e);
                    setUserAlgorithm((prev) => ({ ...prev, code: value }));
                  }
                }}
                defaultLanguage="typescript"
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
          <div className="h-full w-full  prevent-select flex flex-col justify-start overflow-x-scroll overflow-y-hidden items-center">
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

            <div className="  pl-5 pt-3 w-full border-t-2  border-secondary flex flex-col items-start justify-start text-white  h-full: overflow-y-scroll">
              {match(tabValue)
                .with('input', () => (
                  <>
                    {Object.entries(adjacencyList).length === 0 && (
                      <div className="w-full h-full flex items-start font-bold text-xl justify-center text-gray-500">
                        No graph selected in playground
                      </div>
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
                    {codeMutation.data?.logs.map((log) => (
                      <div
                        key={JSON.stringify(log)}
                        className="flex items-center justify-start "
                      >
                        <div className="text-sm">{JSON.stringify(log)}</div>
                      </div>
                    ))}

                    <div>
                      {codeMutation.data?.type === 'Validator' ||
                        (codeMutation.data?.type === 'Visualizer' &&
                          JSON.stringify(codeMutation.data.exitValue))}
                    </div>
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
