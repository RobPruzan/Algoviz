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

export const useCodeMutation = () => {
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
  const getAlgorithmsQuery = useGetAlgorithmsQuery();
  const selectedAttachableLinesThroughLens = attachableLines.filter((line) =>
    validatorLensContainer.some((lens) => lens.selectedIds.includes(line.id))
  );
  const selectedCirclesThroughLens = circles.filter((circle) =>
    validatorLensContainer.some((lens) => lens.selectedIds.includes(circle.id))
  );

  // const { meta } = useMeta(notSignedInUserId);

  const adjacencyList: Record<string, string[]> = [
    ...Graph.getAdjacencyList({
      edges: selectedAttachableLines.concat(selectedAttachableLinesThroughLens),
      vertices: selectedCircles.concat(selectedCirclesThroughLens),
    }).entries(),
  ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
    return { ...prev, [id]: neighbors };
  }, {});
  const codeMutation = useMutation({
    mutationFn: async ({
      algo,

      type,
      lens,
      endNode,
      startNode,
    }: {
      algo: Pick<
        ArrayItem<ReturnType<typeof useGetAlgorithmsQuery>['data']>,
        'code'
      >;

      type: AlgoType;
      lens?: ValidatorLensInfo;
      startNode: string | null;
      endNode: string | null;
    }) => {
      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) Promise.reject();
      const res = await axios.post(url, {
        code: algo.code,
        globalVar: adjacencyList,
        startNode,
        endNode,
      });

      const dataSchema = z.union([
        z.object({
          data: z.object({
            result: z.object({
              type: z.literal('Visualizer'),
              exitValue: z.array(z.array(z.string())).nullish(),
              logs: z.array(z.unknown()),
            }),
          }),
        }),
        z.object({
          data: z.object({
            result: z.object({
              type: z.literal('Validator'),
              exitValue: z.boolean().nullish(),
              logs: z.array(z.unknown()),
            }),
          }),
        }),
        z.object({
          data: z.object({
            result: z.object({
              type: z.literal('error'),
              error: z.string(),
              logs: z.array(z.unknown()),
            }),
          }),
        }),
      ]);

      const parsed = dataSchema.parse({
        data: { result: { ...res.data.data.result, type } },
      });

      return parsed.data.result;
    },
    onError: (err) => {
      console.error('wah wah', err);
    },
    onSuccess: (data, ctx) => {
      match(data)
        .with({ type: AlgoType.Validator }, ({ exitValue }) => {
          if (ctx.lens?.id) {
            // this all fucking sucks and i cant think straight
            // i need to remap all these actions so the state is in canvas
            // then i need to map the result to each invidual lens
            dispatch(
              CanvasActions.setValidationVisualization({
                id: ctx.lens.id,
                result: exitValue,
              })
            );
          }
        })
        .with({ type: AlgoType.Visualizer }, ({ exitValue }) => {
          dispatch(CodeExecActions.setVisitedVisualization(exitValue));
        })
        .with({ type: 'error' }, (errorInfo) => {
          // dispatch(CodeExecActions.setError(error));
          dispatch(
            CodeExecActions.setError({
              logs: errorInfo.logs.map((log) => JSON.stringify(log)),
              message: errorInfo.error,
            })
          );
        })
        .otherwise((_) => console.log('no match'));

      // dispatch(CodeExecActions.setVisitedVisualization(data.exitValue));
    },
  });

  return codeMutation;
};
