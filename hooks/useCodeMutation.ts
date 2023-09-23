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

export const useCodeMutation = (onError?: (error: unknown) => any) => {
  const dispatch = useAppDispatch();
  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas.present);
  const { selectedAttachableLines, selectedCircles } = getSelectedItems({
    attachableLines,
    circles,
    selectedGeometryInfo,
  });

  const selectedAttachableLinesThroughLens = attachableLines.filter((line) =>
    validatorLensContainer.some((lens) => lens.selectedIds.includes(line.id))
  );
  const selectedCirclesThroughLens = circles.filter((circle) =>
    validatorLensContainer.some((lens) => lens.selectedIds.includes(circle.id))
  );

  const adjacencyList: Record<string, string[]> = [
    ...Graph.getAdjacencyList({
      edges: selectedAttachableLines.concat(selectedAttachableLinesThroughLens),
      vertices: selectedCircles.concat(selectedCirclesThroughLens),
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
    }: {
      algo: Pick<
        ArrayItem<ReturnType<typeof useGetAlgorithmsQuery>['data']>,
        'code'
      >;

      type: AlgoType;
      language: Languages;
      lens?: ValidatorLensInfo;
      startNode: string | null;
      endNode: string | null;
    }) => {
      if (language === 'javascript') {
        try {
          const result = await runJavascriptWithWorker(
            algo.code,
            adjacencyList
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
          ADJACENCY_LIST: JSON.stringify(adjacencyList),
        },
      });

      const dataSchema = z.union([
        z.object({
          output: z.array(z.array(z.string())),
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

      const outputWithType = { type, ...res.data };

      const parsedOutput = dataSchema.parse(outputWithType);

      return parsedOutput;
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

  return codeMutation;
};
