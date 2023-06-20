'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppSelector } from '@/redux/store';
import Editor, { useMonaco } from '@monaco-editor/react';
import * as Graph from '@/lib/graph';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { P } from 'ts-pattern';
import { z } from 'zod';
import { nightOwlTheme, outputTheme } from './theme';
import { ChevronsUpDown, Circle, Loader, Play } from 'lucide-react';
import Node from '@/components/Visualizers/Node';
import { SelectedGeometryInfo, SideBarContextState } from '@/lib/types';
import { AlgoComboBox } from '../Sort/AlgoComboBox';
import { algorithmsInfo } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  selectedGeometryInfo: SelectedGeometryInfo | null;
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
};
const CodeExecution = ({
  selectedGeometryInfo,
  setSelectedGeometryInfo,
}: Props) => {
  const variables = useAppSelector((store) => store.canvas.variableInspector);
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);

  const [code, setCode] = useState(
    `
type NodeID = string // uuid representing a node
type AdjacencyList = Record<NodeID, NodeID[]>
type VisitedIDs = NodeID[]
type Visualization = VisitedIDs[]

function algorithm(adjList: AdjacencyList): Visualization{
    // your code here
};
  `
  );
  const selectedAttachableLines = attachableLines.filter((line) =>
    selectedGeometryInfo?.selectedIds.has(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.has(circle.id)
  );

  const adjacencyList: Record<string, string[]> = [
    ...Graph.getAdjacencyList({
      edges: selectedAttachableLines,
      vertices: selectedCircles,
    }).entries(),
  ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
    return { ...prev, [id]: neighbors };
  }, {});

  const codeMutation = useMutation({
    mutationFn: async (code: string) => {
      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) return;
      const res = await axios.post(url, {
        code,
        globalVar: adjacencyList,
      });
      const dataSchema = z.object({ data: z.object({ result: z.unknown() }) });
      const parsed = dataSchema.parse(res.data);

      return parsed.data.result;
    },
    onError: (err) => {
      console.log('the error is!!', err);
    },
  });

  const [tabValue, setTabValue] = useState<'output' | 'input'>('input');

  return variables.show ? (
    <div className="h-full w-full border-2 border-2-secondary flex flex-col items-center">
      <div className="h-12 prevent-select overflow-x-scroll p-5 flex w-full justify-evenly items-center border-b-2 border-2-secondary">
        {/* <Button
          onClick={() => {
            codeMutation.mutate(code);
          }}
        >
          <Play />
        </Button> */}
        <AlgoComboBox
          defaultPlaceholder="algorithm"
          value={undefined}
          setValue={function (
            value: React.SetStateAction<SideBarContextState>
          ): void {
            throw new Error('Function not implemented.');
          }}
        />
        <Button
          onClick={() => {
            codeMutation.mutate(code);
          }}
          variant="outline"
          className="w-[90px]  flex items-center justify-center h-[30px] border-2-secondary bg-primary  font-bold"
        >
          Run
        </Button>
        <Button
          variant="outline"
          className="w-[90px] flex items-center justify-center h-[30px] border-2-secondary bg-primary  font-bold"
        >
          Apply
        </Button>
        <Button
          variant="outline"
          className="w-[90px] flex items-center justify-center h-[30px] border-2-secondary bg-primary  font-bold"
        >
          Save
        </Button>
      </div>
      <div className="max-w-[98%] w-full h-full">
        <Editor
          beforeMount={(m) => {
            // vercel thing, basename type gets widened when building prod
            m.editor.defineTheme('night-owl', nightOwlTheme as any);
          }}
          // theme="night-owl"
          theme="vs-dark"
          value={code}
          onChange={(e) => {
            if (e) {
              setCode(e);
            }
          }}
          defaultLanguage="typescript"
          options={{
            minimap: { enabled: false }, // This turns off the minimap
            folding: false, // This turns off the sidebar (folding region)
            scrollbar: {
              vertical: 'hidden', // This hides the vertical scrollbar
              horizontal: 'hidden', // This hides the horizontal scrollbar
            },
          }}
        />
      </div>
      <Tabs
        value={tabValue}
        onValueChange={(v) =>
          // valueIsDisplayType(v) && setValue((prev) => ({ ...prev, display: v }))
          setTabValue((prev) => (prev === 'output' ? 'input' : 'output'))
        }
        defaultValue="input"
        className=" flex p-1 sjustify-evenly items-center  w-full border-y-2 "
      >
        <TabsList className="w-full  bg-primary p-3 flex justify-evenly items-center">
          <TabsTrigger
            className={`w-1/5 ${
              tabValue === 'input'
                ? 'border-2 rounded-md border-secondary bg-secondary'
                : 'border-2 rounded-md border-secondary'
            }`}
            value="input"
          >
            Input
          </TabsTrigger>
          <TabsTrigger
            className={`w-1/5 ${
              tabValue === 'output'
                ? 'border-2 rounded-md border-secondary bg-secondary'
                : 'border-2 rounded-md border-secondary'
            }`}
            value="output"
          >
            Output
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className=" bg-primary pl-5 pt-3 w-full border-t-2 border-secondary flex flex-col items-start justify-start text-white  h-[600px] min-h-[20%]: overflow-y-scroll">
        {Object.entries(adjacencyList).length === 0 && (
          <div className="w-full h-full flex items-center font-bold text-xl justify-center text-gray-500">
            No graph selected in playground
          </div>
        )}
        {Object.entries(adjacencyList).map(([k, v]) => (
          <div className="flex text-2xl" key={k}>
            <div className="">{circles.find((c) => c.id === k)?.value}</div>:
            <div className="">
              {JSON.stringify(
                v.map((v) => circles.find((c) => c.id === v)?.value)
              )}
            </div>
          </div>
        ))}
      </div>
      {codeMutation.isSuccess && JSON.stringify(codeMutation.data, null, 4)}
      {codeMutation.isLoading && <Loader />}

      <Card></Card>
    </div>
  ) : null;
};

export default CodeExecution;
