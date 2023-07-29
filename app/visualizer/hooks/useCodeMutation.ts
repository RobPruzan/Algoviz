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
import { Languages } from '@/lib/language-snippets';

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
    onError: (error) => {
      console.log('fuck me ass', error);
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
      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) Promise.reject();
      console.log('sending');

      const res = await axios.post(url, {
        code: algo.code,
        lang: language,
        // globalVar: adjacencyList,
        // startNode,
        // endNode,
        // needs to be json guh
        env: {
          ADJACENCY_LIST: JSON.stringify(adjacencyList),
          // START_NODE: startNode,
          // END_NODE: endNode,
        },
      });

      console.log('CODE RES', res);

      const dataSchema = z.union([
        z.object({
          output: z.array(z.array(z.string())),
          logs: z.string(),
          type: z.literal('Visualizer'),
        }),
        z.object({
          output: z.boolean(),
          logs: z.string(),
          type: z.literal('Validator'),
        }),
        z.object({
          output: z.array(z.string()),
          type: z.literal('error'),
        }),
      ]);

      const outputWithType = { type, ...res.data };
      const parsedOutput = dataSchema.parse(outputWithType);
      console.log('whats getting parsed', res.data.data.error);
      // if (res.data.data.error) {
      //   console.log('hola', res.data);
      //   const parsed = dataSchema.parse({
      //     data: { result: { ...res.data.data } },
      //   });

      //   return parsed.data.result;
      // }
      // const parsed = dataSchema.parse({
      //   data: { result: { ...res.data.data.result, type } },
      // });

      return parsedOutput;
    },
    // onError: (err) => {
    //   console.error('wah wah', err);
    // },
    onSuccess: (data, ctx) => {
      match(data)
        .with({ type: AlgoType.Validator }, ({ output, logs }) => {
          if (ctx.lens?.id) {
            // this all fucking sucks and i cant think straight
            // i need to remap all these actions so the state is in canvas
            // then i need to map the result to each invidual lens
            dispatch(
              CanvasActions.setValidationVisualization({
                id: ctx.lens.id,
                // need to make sure at some point when i run code for validator i store a boolean
                // so i can index it here :3
                result: output,
              })
            );
          }
        })
        .with({ type: AlgoType.Visualizer }, ({ output, logs }) => {
          dispatch(CodeExecActions.setVisitedVisualization());
        })
        .with({ type: 'error' }, (errorInfo) => {
          console.log('matching error');
          // dispatch(CodeExecActions.setError(error));
          dispatch(
            CodeExecActions.setError({
              logs: errorInfo.output.map((log) => JSON.stringify(log)),
              // fix dis
              message: errorInfo.output.join(' '),
            })
          );
        })
        .otherwise((_) => console.log('no match'));

      // dispatch(CodeExecActions.setVisitedVisualization(data.exitValue));
    },
  });

  return codeMutation;
};
