import { CodeExecActions } from '@/redux/slices/codeExecSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import * as Graph from '@/lib/graph';
import { AlgoType } from '@/lib/types';
import { P, match } from 'ts-pattern';

export const useCodeMutation = () => {
  const dispatch = useAppDispatch();
  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas);
  const selectedAttachableLines = attachableLines.filter((line) =>
    // not a set because of redux :(
    selectedGeometryInfo?.selectedIds.includes(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.includes(circle.id)
  );

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
    mutationFn: async ({ code, type }: { code: string; type: AlgoType }) => {
      console.group('mutating', adjacencyList);
      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) Promise.reject();

      const res = await axios.post(url, {
        code,
        globalVar: adjacencyList,
      });

      // const dataSchema = z.object({
      //   data: z.object({
      //     result: z.object({
      //       exitValue: z.union([z.array(z.array(z.string())), z.boolean() ]),

      //       logs: z.array(z.array(z.unknown())),
      //     }),
      //   }),
      // });
      // tagged union, if type is validator, its array of array of strings, if visualizer, its boolean
      const dataSchema = z.union([
        z.object({
          data: z.object({
            result: z.object({
              type: z.literal('Visualizer'),
              exitValue: z.array(z.array(z.string())),
              logs: z.array(z.unknown()),
            }),
          }),
        }),
        z.object({
          data: z.object({
            result: z.object({
              type: z.literal('Validator'),
              exitValue: z.boolean(),
              logs: z.array(z.unknown()),
            }),
          }),
        }),
        z.object({
          // type: z.literal('error'),
          // error: z.string(),
          data: z.object({
            result: z.object({
              type: z.literal('error'),
              error: z.string(),
              logs: z.array(z.unknown()),
            }),
          }),
        }),
      ]);

      console.log('buh buh buuuuuu', {
        data: { result: { ...res.data.data.result, type } },
      });

      const parsed = dataSchema.parse({
        data: { result: { ...res.data.data.result, type } },
      });

      return parsed.data.result;
    },
    onError: (err) => {
      console.error('wah wah', err);
    },
    onSuccess: (data, ctx) => {
      console.log('returned data', data);
      match(data)
        .with({ type: AlgoType.Validator }, ({ exitValue }) => {
          dispatch(CodeExecActions.setValidationVisualization(exitValue));
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
          console.log('error', errorInfo);
        })
        .otherwise((_) => console.log('no match'));

      // dispatch(CodeExecActions.setVisitedVisualization(data.exitValue));
    },
  });

  return codeMutation;
};
