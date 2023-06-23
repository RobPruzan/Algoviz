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
import { P } from 'ts-pattern';
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
import { algorithmsInfo } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from 'next-auth/react';
import { Algorithm } from '@prisma/client';
import Resizable from '../Resizeable';
import { codeExecActions } from '@/redux/slices/codeExecSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const CodeExecution = () => {
  const [editorHeight, setEditorHeight] = useState<number | Percentage>('60%');
  const [outputHeight, setCodeExecHeight] = useState<number | Percentage>(
    '40%'
  );
  const variables = useAppSelector((store) => store.canvas.variableInspector);
  const { attachableLines, circles, selectedGeometryInfo } = useAppSelector(
    (store) => store.canvas
  );
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState<'output' | 'input'>('input');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>();
  const [code, setCode] = useState(
    `type NodeID = string // uuid representing a node
type AdjacencyList = Record<NodeID, NodeID[]>
type VisitedIDs = NodeID[]
type Visualization = VisitedIDs[]

function algorithm(adjList: AdjacencyList): Visualization{
    // your code here
};
`
  );
  const dispatch = useAppDispatch();
  const isApplyingAlgorithm = useAppSelector(
    (store) => store.codeExec.isApplyingAlgorithm
  );
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
  const getAlgorithmsQuery = useQuery({
    queryKey: ['getallAlgorithms'],
    queryFn: async () => {
      const algorithmSchema = z.object({
        id: z.string(),
        userId: z.string(),
        name: z.string(),
        code: z.string(),
        createdAt: z.string(),
      });
      const res = (
        await axios.get(`${process.env.NEXT_PUBLIC_API_ROUTE}/algo/getall`)
      ).data;
      return z.array(algorithmSchema).parse(res);
    },
  });
  const codeMutation = useMutation({
    mutationFn: async (code: string) => {
      console.log('running');
      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) Promise.reject();
      const res = await axios.post(url, {
        code,
        globalVar: adjacencyList,
      });
      const dataSchema = z.object({
        data: z.object({ result: z.array(z.array(z.string())) }),
      });
      const parsed = dataSchema.parse(res.data);

      return parsed.data.result;
    },
    onError: (err) => {
      console.log('the error is!!', err);
    },
    onSuccess: (data) => {
      console.log('data from endpoint', data);
      dispatch(codeExecActions.setVisited(data));
    },
  });

  const saveAlgorithmMutation = useMutation({
    mutationFn: async ({ code, name }: { code: string; name: string }) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/algo/create`, {
        code,
        name,
      });
    },
  });

  return variables.show ? (
    <div className="w-full h-full border-2 border-secondary">
      <div className="w-full max-h-[7%] min-h-[50px]">
        <div className="  prevent-select overflow-x-scroll p-3 flex w-full justify-evenly items-center border-b-2 border-secondary">
          {getAlgorithmsQuery.isLoading ? (
            <AlgoComboBox
              algorithms={[]}
              defaultPlaceholder="Loading"
              setValue={() => undefined}
              value={undefined}
            />
          ) : (
            <AlgoComboBox
              algorithms={getAlgorithmsQuery.data ?? []}
              defaultPlaceholder="Algorithm"
              value={selectedAlgorithm}
              setValue={(d) => {
                setSelectedAlgorithm(d);
                setCode(
                  (prev) =>
                    getAlgorithmsQuery.data?.find(
                      (algo) => algo.id === selectedAlgorithm
                    )?.code ?? prev
                );
              }}
            />
          )}

          <Button
            onClick={() => {
              codeMutation.mutate(code);
            }}
            variant="outline"
            className="w-[90px]  flex items-center justify-center h-[30px] border-secondary bg-primary  font-bold"
          >
            Run
          </Button>
          <Button
            onClick={(e) => {
              dispatch(codeExecActions.toggleIsApplyingAlgorithm());
              // dispatch(codeExecActions.setIsApplyingAlgorithm(true));
            }}
            variant="outline"
            className="w-[90px] flex items-center justify-center h-[30px] border-secondary bg-primary  font-bold"
          >
            {isApplyingAlgorithm ? 'Pause' : 'Apply'}
          </Button>
          {/* <Button
            onClick={() => {
              saveAlgorithmMutation.mutate({
                code,
                name: crypto.randomUUID(),
              });
              getAlgorithmsQuery.refetch();
            }}
            variant="outline"
            className="w-[90px] flex items-center justify-center h-[30px] border-secondary bg-primary  font-bold"
          >
            Save
          </Button> */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-[90px] flex items-center justify-center h-[30px] border-secondary bg-primary  font-bold"
                variant="outline"
              >
                Save
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              {/* <form
                onSubmit={(e) => {
                  console.log('submitting');
                  e.preventDefault();
                }}
                className="grid gap-4 py-4 bg-"
              > */}
              <DialogHeader>
                <DialogTitle>Save Algorithm</DialogTitle>
                <DialogDescription>
                  {
                    'Enter the information about your algorithm. Click confirm save when done.'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Title
                </Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                {/* <Input id="description" className="col-span-3" /> */}
                <Textarea className="col-span-3" />
              </div>
              {/* </form> */}
              <DialogFooter>
                {/* <DialogPrimitiveClose  aria-label="Close"> */}
                <Button
                  onClick={() => {
                    setOpen(false);
                  }}
                  variant="outline"
                  type="submit"
                >
                  Confirm Save
                </Button>
                {/* </DialogPrimitiveClose> */}
                {/* </DialogPrimitive.Close> */}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
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
                  value={code}
                  onChange={(e) => {
                    if (e) {
                      setCode(e);
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
                  setTabValue((prev) =>
                    prev === 'output' ? 'input' : 'output'
                  )
                }
                defaultValue="input"
                className=" flex p-1 justify-evenly items-center  w-full  "
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

              <div className=" bg-primary pl-5 pt-3 w-full border-t-2 border-secondary flex flex-col items-start justify-start text-white  h-full: overflow-y-scroll">
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
              </div>
            </div>
          }
        />
      </div>
    </div>
  ) : null;
};

export default CodeExecution;
