import { CodeExecActions } from "@/redux/slices/codeExecSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import * as Graph from "@/lib/graph";
import { AlgoType, ArrayItem, CircleReceiver, Edge } from "@/lib/types";
import { P, match } from "ts-pattern";
import { getSelectedItems, getValidatorLensSelectedIds } from "@/lib/utils";
import { useGetAlgorithmsQuery } from "./useGetAlgorithmsQuery";
import { CanvasActions, ValidatorLensInfo } from "@/redux/slices/canvasSlice";
import { useMeta } from "@/hooks/useMeta";
import { Languages, runJavascriptWithWorker } from "@/lib/language-snippets";
import _logger from "next-auth/utils/logger";
import { useState } from "react";
import { useGetSelectedItems } from "./useGetSelectedItems";
import { useToast } from "@/components/ui/use-toast";
import { start } from "repl";
type AlteredOutputUnion =
  | {
      output: Array<Array<string>>;
      logs: string;
      type: AlgoType.Visualizer;
    }
  | {
      output: boolean;
      logs: string;
      type: AlgoType.Validator;
    }
  | {
      logs: Array<string>;

      type: "error";
    };

const VisualizationElement = z.object({
  ID: z.string(),
  value: z.number(),
});

type Vis = z.infer<typeof VisualizationElement>;
type Validator = z.infer<typeof validatorSchema>;

const FrameArgs = z.object({
  args: z.array(z.string()),
  keywords: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .or(z.null()),
  locals: z.record(z.any()),
  varargs: z.array(z.union([z.string(), z.number(), z.boolean()])).or(z.null()),
});

const Frame = z.object({
  args: FrameArgs,
  line: z.number(),
  name: z.string(),
});

const VisualizerOutput = z.object({
  frames: z.array(Frame),
  line: z.number(),
  tag: z.string(),
  output: z
    .array(z.union([VisualizationElement, z.array(VisualizationElement)]))
    .optional(),
  visualization: z
    .array(z.union([VisualizationElement, z.array(VisualizationElement)]))
    .optional(),
});

const validatorSchema = z.object({
  type: z.literal("Validator"),
  output: z.boolean(),
  logs: z.string().optional(),
});

const visualizerSchema = z.object({
  type: z.literal("Visualizer"),
  output: z.array(VisualizerOutput),
  logs: z.string().optional(),
});

const errorSchema = z.object({
  type: z.literal("error"),
  logs: z.array(z.string()).optional(),
});

const dataSchema = z.union([visualizerSchema, validatorSchema, errorSchema]);

type ParsedOutput = z.infer<typeof dataSchema>;

// const dataSchema = z.union([visualizerSchema, validatorSchema, errorSchema]);
const unFlattened = (parsedOutput: z.infer<typeof dataSchema>) => {
  return (
    parsedOutput.type === AlgoType.Visualizer
      ? {
          ...parsedOutput,
          output: (
            parsedOutput.output.map((opt) => opt.visualization) as
              | Array<any>
              | null
              | undefined
          )?.map((o) => (o instanceof Array ? o.map((o) => o.ID) : [o.ID])),
        }
      : parsedOutput
  ) as AlteredOutputUnion;
};

export const useCodeMutation = (onError?: (error: unknown) => any) => {
  const dispatch = useAppDispatch();
  const { attachableLines, circles, validatorLensContainer } = useAppSelector(
    (store) => store.canvas.present
  );
  const { selectedAttachableLines, selectedCircles } = useGetSelectedItems();

  const selectedAttachableLinesThroughLens = (selectAll: boolean) => {
    return selectAll
      ? attachableLines
      : attachableLines.filter((line) =>
          validatorLensContainer.some((lens) =>
            lens.selectedIds.includes(line.id)
          )
        );
  };
  const selectedCirclesThroughLens = (selectAll: boolean) =>
    selectAll
      ? circles
      : circles.filter((circle) =>
          validatorLensContainer.some((lens) =>
            lens.selectedIds.includes(circle.id)
          )
        );
  const { toast } = useToast();
  // const selectedIds = getValidatorLensSelectedIds({
  //   attachableLines,
  //   circles,
  //   validatorLensContainer,
  // }).join(',');
  const getAdjacenyList = (
    edges: Array<Edge>,
    vertices: Array<CircleReceiver>,
    lens?: ValidatorLensInfo
    // type: AlgoType
  ): Record<string, string[]> =>
    // #TODO, need to run the mutation by passing in the selected ids for the individual validator, and then push the result again for that specific validator
    [
      ...Graph.getAdjacencyList({
        edges: lens
          ? edges.filter((edge) => lens.selectedIds.includes(edge.id))
          : edges,
        vertices: lens
          ? vertices.filter((vertex) => lens.selectedIds.includes(vertex.id))
          : vertices,
      }).entries(),
    ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
      return { ...prev, [id]: neighbors };
    }, {});
  const codeMutation = useMutation({
    onError: (error, d) => {
      // console.log('dat err', error);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Likely a network error",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Likely a network error",
          description: JSON.stringify(error),
        });
      }

      dispatch(CodeExecActions.setVisitedVisualization([]));
      dispatch(CodeExecActions.setIsApplyingAlgorithm(false));
      dispatch(CodeExecActions.resetVisitedPointer());
      onError?.(error);
    },
    mutationFn: async ({
      algo,
      type,
      endNode,
      startNode,
      language,
      selectAll,
      lens,
    }: {
      algo: Pick<
        ArrayItem<ReturnType<typeof useGetAlgorithmsQuery>["data"]>,
        "code"
      >;

      type: AlgoType;
      language: Languages;
      selectAll: boolean;
      lens?: ValidatorLensInfo;
      startNode: string | null;
      endNode: string | null;
    }): Promise<AlteredOutputUnion> => {
      // if (language === 'javascript') {
      //   try {
      //     const newAdjList = Object.fromEntries(
      //       Object.entries(getAdjacenyList(attachableLines, circles, lens)).map(
      //         ([k, v]) => [
      //           k,
      //           v.map((id) => ({
      //             ID: circles.find((c) => c.id === id)?.id!,
      //             value: circles.find((c) => c.id === id)?.value!,
      //           })),
      //         ]
      //       )
      //     );

      //     const result = await runJavascriptWithWorker(algo.code, newAdjList);

      //     switch (type) {
      //       case AlgoType.Validator: {
      //         const parsed = validatorSchema.parse({
      //           ...result,
      //           type,
      //         });
      //         return unFlattened(parsed);
      //       }
      //       case AlgoType.Visualizer: {
      //         const parsed = visualizerSchema.parse({
      //           output: result.output,
      //           logs: result.logs.join('\n'),
      //           type,
      //         });

      //         return unFlattened(parsed);
      //       }
      //     }
      //   } catch (error) {
      //     if (error instanceof ErrorEvent) {
      //       console.log('error', error);
      //       return {
      //         type: 'error',
      //         output: [error.message],
      //       };
      //     } else {
      //       return {
      //         type: 'error',
      //         output: [JSON.stringify(error)],
      //       };
      //     }
      //   }
      // } else {
      const url = process.env.NEXT_PUBLIC_CODE_RUNNER;
      if (!url) Promise.reject();
      const adjList: Array<unknown> = [];
      for (const [id, neighbors] of Object.entries(
        getAdjacenyList(attachableLines, circles, lens)
      )) {
        const circle = circles.find((c) => c.id === id);
        [
          adjList.push({
            id: circle?.id,
            value: circle?.value,
            neighbors: neighbors.map(
              (n) => circles.find((c) => c.id === n)?.id
            ),
          }),
        ];
      }

      console.log(JSON.stringify(adjList));

      const res = await axios.post(url, {
        code: algo.code,
        lang: language,
        type,
        env: {
          ADJACENCY_LIST: JSON.stringify(adjList),
          START_NODE: JSON.stringify(startNode ?? "NO-START-NODE-SELECTED"),
          START_NODE_VALUE: JSON.stringify(
            circles.find((c) => c.id === startNode)?.value
          ),
          START_NODE_NEIGHBORS: JSON.stringify(
            circles.find((c) => c.id === startNode)?.nodeReceiver.attachedIds
          ),
        },
      });

      const outputWithType = { type, ...res.data };

      if (process.env.NODE_ENV === "development") {
        console.log("code output", outputWithType);
      }
      const parsedOutput = dataSchema.parse(outputWithType);

      return unFlattened(parsedOutput);
      // }
    },
    onSuccess: (data, ctx) => {
      match(data)
        .with({ type: AlgoType.Validator }, ({ output, logs }) => {
          if (ctx.lens?.id) {
            dispatch(
              CanvasActions.setValidationVisualization({
                id: ctx.lens.id,
                result: output,
              })
            );
          }
        })

        .with({ type: AlgoType.Visualizer }, ({ output, logs }) => {
          console.log("dispatching output", output);
          dispatch(CodeExecActions.setVisitedVisualization(output));
        })
        .with({ type: "error" }, (errorInfo) => {
          dispatch(CodeExecActions.setVisitedVisualization([]));
          dispatch(CodeExecActions.setIsApplyingAlgorithm(false));
          dispatch(CodeExecActions.resetVisitedPointer());
          dispatch(
            CodeExecActions.setError({
              logs: errorInfo.logs.map((log) => JSON.stringify(log)),
              message: errorInfo.logs.join(" "), // what da hell am i doing here
            })
          );
        })
        // #TODO
        .otherwise((_) => _);
    },
  });

  return { codeMutation, getAdjacenyList };
};
