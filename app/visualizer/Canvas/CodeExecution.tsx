'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppSelector } from '@/redux/store';
// import { Editor, useMonaco } from '@monaco-editor/react';
import Editor, { useMonaco } from '@monaco-editor/react';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { P } from 'ts-pattern';
import { z } from 'zod';
import { nightOwlTheme, outputTheme } from './theme';
import { Circle, Loader, Play } from 'lucide-react';
import Node from '@/components/Visualizers/Node';

const CodeExecution = () => {
  const variables = useAppSelector((store) => store.canvas.variableInspector);
  const [code, setCode] = useState(
    `
type NodeID = string // uuid representing a node
type AdjacencyList = Record<NodeID, NodeID[]>
type VisitedIDs = NodeID[]
type Visualization = VisitedIDs[]

function algorithm(adjList: AdjacencyList): Visualization{
    // your code here
}
  `
  );

  const codeMutation = useMutation({
    mutationFn: async (code: string) => {
      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) return;
      const res = await axios.post(url, {
        code,
      });
      const dataSchema = z.object({ data: z.object({ result: z.unknown() }) });
      const parsed = dataSchema.parse(res.data);

      return parsed.data.result;
    },
    onError: (err) => {
      console.log('the error is!!', err);
    },
  });

  console.log('codemutation data', codeMutation.data);
  console.log('the code', code);
  return variables.show ? (
    <div className="md:w-[350px]  lg:w-[450px] rounded-md flex flex-col h-[90%] border border-foreground transition">
      <div className="h-[5%] flex w-full justify-center items-center border-b border-foreground">
        <Button
          onClick={() => {
            codeMutation.mutate(code);
          }}
        >
          <Play />
        </Button>
      </div>
      <Editor
        beforeMount={(m) => {
          // vercel thing, basename type gets widened when building prod
          m.editor.defineTheme('night-owl', nightOwlTheme as any);
        }}
        theme="night-owl"
        value={code}
        onChange={(e) => {
          if (e) {
            setCode(e);
          }
        }}
        // className="bg-primary h-3/5"
        height="55%"
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

      <div className="bg-black border-t border-foreground flex flex-col items-start justify-start text-white  h-2/5">
        {codeMutation.isSuccess && JSON.stringify(codeMutation.data)}
        {codeMutation.isLoading && <Loader />}
      </div>

      {/* 
      <div className="flex w-full">
        <Button
          onClick={() => {
            codeMutation.mutate(code);
          }}
          className="w-1/2 border-secondary"
        >
          Execute Code
        </Button>
        <div className="w-1/2 h-full">
          {codeMutation.isLoading && 'loading'}
          {codeMutation.isSuccess &&
            (JSON.stringify(codeMutation.data) as string | number)}
        </div>
      </div> */}

      <Card></Card>
    </div>
  ) : null;
};

export default CodeExecution;
