'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import Editor, { useMonaco } from '@monaco-editor/react';
import * as Graph from '@/lib/graph';
// import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { P, match } from 'ts-pattern';
import { z } from 'zod';
import { nightOwlTheme, outputTheme } from './theme';
import { ChevronsUpDown, Circle, Loader, Play } from 'lucide-react';
import Node from '@/components/Visualizers/Node';
import {
  Percentage,
  SelectedGeometryInfo,
  SideBarContextState,
} from '@/lib/types';
import { AlgoComboBox } from '../Sort/AlgoComboBox';
import { DEFAULT_CODE, algorithmsInfo } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Algorithm } from '@prisma/client';
import Resizable from '../Resizeable';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetAlgorithmsQuery } from '../hooks/useGetAlgorithmsQuery';

type Props = {
  selectedAlgorithm: string | undefined;
  setUserAlgorithm: React.Dispatch<
    React.SetStateAction<Pick<Algorithm, 'code' | 'description' | 'title'>>
  >;
};

const CodeExecution = ({ selectedAlgorithm, setUserAlgorithm }: Props) => {
  const [editorHeight, setEditorHeight] = useState<number | Percentage>('60%');
  const [outputHeight, setCodeExecHeight] = useState<number | Percentage>(
    '40%'
  );
  const variables = useAppSelector((store) => store.canvas.variableInspector);
  const { attachableLines, circles, selectedGeometryInfo } = useAppSelector(
    (store) => store.canvas
  );

  const [tabValue, setTabValue] = useState<'output' | 'input'>('input');

  const selectedAttachableLines = attachableLines.filter((line) =>
    // not a set because of redux :(
    selectedGeometryInfo?.selectedIds.includes(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.includes(circle.id)
  );

  const adjacencyList: Record<string, string[]> = [
    ...Graph.getAdjacencyList({
      edges: selectedAttachableLines,
      vertices: selectedCircles,
    }).entries(),
  ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
    return { ...prev, [id]: neighbors };
  }, {});

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  const currentAlgorithm = getAlgorithmsQuery.data?.find(
    (d) => d.id === selectedAlgorithm
  );

  return variables.show ? (
    // <div className="w-full h-full border-2 border-secondary">

    <div className="w-full h-[93%]">
      <Resizable
        canvasSize={editorHeight}
        codeExecSize={outputHeight}
        setCanvasSize={setEditorHeight}
        setCodeExecSize={setCodeExecHeight}
        type="vertical"
        topDiv={
          <div className="w-full h-full bg-[#1E1E1E]">
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
                theme="vs-dark"
                value={currentAlgorithm?.code ?? DEFAULT_CODE}
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
              <TabsList className="w-full  bg-primary p-3 flex justify-evenly items-center">
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

            <div className=" bg-primary pl-5 pt-3 w-full border-t-2  border-secondary flex flex-col items-start justify-start text-white  h-full: overflow-y-scroll">
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
                .with('output', () => <div> da output :p</div>)
                .run()}
            </div>
          </div>
        }
      />
    </div>
  ) : null;
};

export default CodeExecution;
