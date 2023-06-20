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

  const [tabValue, setTabValue] = useState<'output' | 'input'>();

  return variables.show ? (
    <div className="h-full w-full border border-foreground flex flex-col items-center">
      <div className="h-[7%] overflow-x-scroll p-5 flex w-full justify-evenly items-center border-b border-foreground">
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
          className="w-[90px] flex items-center justify-center h-[30px] border-foreground bg-secondary  font-bold"
        >
          Run
        </Button>
        <Button
          variant="outline"
          className="w-[90px] flex items-center justify-center h-[30px] border-foreground bg-secondary  font-bold"
        >
          Apply
        </Button>
        <Button
          variant="outline"
          className="w-[90px] flex items-center justify-center h-[30px] border-foreground bg-secondary  font-bold"
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
        className=" flex p-1 justify-evenly items-center mb-5 w-full border-t-2 border-b border-foreground"
      >
        <TabsList className="w-full  bg-primary p-3 flex justify-evenly items-center">
          <TabsTrigger
            className={`w-1/5 ${
              tabValue === 'input'
                ? 'border-2 rounded-md border-foreground'
                : 'border-2 rounded-md border-secondary'
            }`}
            value="input"
          >
            Input
          </TabsTrigger>
          <TabsTrigger
            className={`w-1/5 ${
              tabValue === 'output'
                ? 'border-2 rounded-md border-foreground'
                : 'border-2 rounded-md border-secondary'
            }`}
            value="output"
          >
            Output
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-black border-t border-foreground flex flex-col items-start justify-start text-white  h-[300px] overflow-y-scroll">
        {Object.entries(adjacencyList).map(([k, v]) => (
          <div key={k}>
            <div className="bg-blue-500">{k}</div>:{' '}
            <div className="bg-green-500">{JSON.stringify(v)}</div>
          </div>
        ))}
      </div>
      {codeMutation.isSuccess && JSON.stringify(codeMutation.data, null, 4)}
      {codeMutation.isLoading && <Loader />}

      <div className="flex w-full">
        <div className="w-1/2 h-full">
          {/* {codeMutation.isLoading && 'loading'}
          {codeMutation.isSuccess &&
            (JSON.stringify(codeMutation.data) as string | number)} */}
        </div>
      </div>

      <Card></Card>
    </div>
  ) : null;
};

export default CodeExecution;
