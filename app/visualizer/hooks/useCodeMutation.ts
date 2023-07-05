import { CodeExecActions } from '@/redux/slices/codeExecSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import * as Graph from '@/lib/graph';

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
    mutationFn: async (code: string) => {
      console.group('mutating', adjacencyList);
      const url = process.env.NEXT_PUBLIC_CODE_EXEC_URL;
      if (!url) Promise.reject();
      const res = await axios.post(url, {
        code,
        globalVar: adjacencyList,
      });
      console.log('da resss', res.data);
      const dataSchema = z.object({
        data: z.object({
          result: z.object({
            exitValue: z.array(z.array(z.string())),
            logs: z.array(z.array(z.unknown())),
          }),
        }),
      });
      const parsed = dataSchema.parse(res.data);

      return parsed.data.result;
    },
    onError: (err) => {
      console.error('wah wah', err);
    },
    onSuccess: (data) => {
      console.log('success', data);
      dispatch(CodeExecActions.setVisited(data.exitValue));
    },
  });

  return codeMutation;
};
