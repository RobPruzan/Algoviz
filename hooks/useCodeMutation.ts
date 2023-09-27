import { CodeExecActions } from '@/redux/slices/codeExecSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import * as Graph from '@/lib/graph';
import { AlgoType, ArrayItem } from '@/lib/types';
import { P, match } from 'ts-pattern';
import { getSelectedItems } from '@/lib/utils';
import { useGetAlgorithmsQuery } from './useGetAlgorithmsQuery';
import { CanvasActions, ValidatorLensInfo } from '@/redux/slices/canvasSlice';
import { useMeta } from '@/hooks/useMeta';
import { Languages, runJavascriptWithWorker } from '@/lib/language-snippets';
import _logger from 'next-auth/utils/logger';
import { useState } from 'react';
import { useGetSelectedItems } from './useGetSelectedItems';

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

  const getAdjacenyList: (selectAll: boolean) => Record<string, string[]> = (
    selectAll: boolean
  ) =>
    [
      ...Graph.getAdjacencyList({
        edges: selectedAttachableLines.concat(
          selectedAttachableLinesThroughLens(selectAll)
        ),
        vertices: selectedCircles.concat(selectedCirclesThroughLens(selectAll)),
      }).entries(),
    ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
      return { ...prev, [id]: neighbors };
    }, {});
  const codeMutation = useMutation({
    onError: (error) => {
      onError?.(error);
    },
    mutationFn: async ({
      algo,
      type,
      endNode,
      startNode,
      language,
      selectAll,
    }: {
      algo: Pick<
        ArrayItem<ReturnType<typeof useGetAlgorithmsQuery>['data']>,
        'code'
      >;

      type: AlgoType;
      language: Languages;
      selectAll: boolean;
      lens?: ValidatorLensInfo;
      startNode: string | null;
      endNode: string | null;
    }) => {
      if (language === 'javascript') {
        try {
          const result = await runJavascriptWithWorker(
            algo.code,
            getAdjacenyList(selectAll)
          );
        } catch (error) {}
        return;
      }

      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) Promise.reject();

      const res = await axios.post(url, {
        code: algo.code,
        lang: language,
        type,
        env: {
          ADJACENCY_LIST: JSON.stringify(getAdjacenyList(selectAll)),
          START_NODE: JSON.stringify(startNode ?? 'NO-START-NODE-SELECTED'),
        },
      });

      const dataSchema = z.union([
        z.object({
          output: z.union([z.array(z.array(z.string())), z.array(z.string())]),
          logs: z.string(),
          type: z.literal(AlgoType.Visualizer),
        }),
        z.object({
          output: z.boolean(),
          logs: z.string(),
          type: z.literal(AlgoType.Validator),
        }),
        z.object({
          output: z.array(z.string()),
          type: z.literal('error'),
        }),
      ]);

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
            output: Array<string>;

            type: 'error';
          };

      const outputWithType = { type, ...res.data };

      const parsedOutput = dataSchema.parse(outputWithType);

      const unFlatten =
        parsedOutput.type === AlgoType.Visualizer
          ? {
              ...parsedOutput,
              output: (
                parsedOutput.output as Array<any> | null | undefined
              )?.map((o) => (o instanceof Array ? o : [o])),
            }
          : parsedOutput;

      return unFlatten as AlteredOutputUnion;
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
          dispatch(CodeExecActions.setVisitedVisualization(output));
        })
        .with({ type: 'error' }, (errorInfo) => {
          dispatch(
            CodeExecActions.setError({
              logs: errorInfo.output.map((log) => JSON.stringify(log)),
              message: errorInfo.output.join(' '),
            })
          );
        })
        // #TODO
        .otherwise((_) => _);
    },
  });

  return { codeMutation, getAdjacenyList };
};
