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
const DEFAULT_CODE = `type NodeID = string // uuid representing a node
type AdjacencyList = Record<NodeID, NodeID[]>
type VisitedIDs = NodeID[]
type Visualization = VisitedIDs[]

function algorithm(adjList: AdjacencyList): Visualization{
    // your code here
};
`;
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

  const [userAlgorithm, setUserAlgorithm] = useState<
    Pick<Algorithm, 'code' | 'description' | 'title'>
  >({
    code: DEFAULT_CODE,
    description: '',
    title: '',
  });
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
        title: z.string(),
        code: z.string(),
        description: z.string(),
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
    onError: (err) => {},
    onSuccess: (data) => {
      dispatch(codeExecActions.setVisited(data));
    },
  });

  const saveAlgorithmMutation = useMutation({
    mutationFn: async ({
      code,
      description,
      title,
    }: {
      code: string;
      description: string;
      title: string;
    }) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/algo/create`, {
        code,
        title,
        description,
      });
    },
  });

  const currentAlgorithm = getAlgorithmsQuery.data?.find(
    (d) => d.id === selectedAlgorithm
  );

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
                // setCode(
                //   (prev) =>
                //     getAlgorithmsQuery.data?.find(
                //       (algo) => algo.id === selectedAlgorithm
                //     )?.code ?? prev
                // );
                // setUser;
              }}
            />
          )}

          <Button
            onClick={() => {
              if (currentAlgorithm?.code) {
                codeMutation.mutate(currentAlgorithm.code);
              }
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
                <Input
                  value={userAlgorithm.title}
                  onChange={(e) =>
                    setUserAlgorithm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  id="name"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  value={userAlgorithm.description}
                  onChange={(e) =>
                    setUserAlgorithm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              {/* </form> */}
              <DialogFooter>
                {/* <DialogPrimitiveClose  aria-label="Close"> */}
                <Button
                  onClick={async () => {
                    await saveAlgorithmMutation.mutateAsync(userAlgorithm);
                    setOpen(false);
                    getAlgorithmsQuery.refetch();
                  }}
                  variant="outline"
                  type="submit"
                >
                  {/* Confirm Save
                   */}
                  {saveAlgorithmMutation.isLoading ? 'Loading' : 'Confirm Save'}
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
