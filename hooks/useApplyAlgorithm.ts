import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import { DFSActions } from "@/redux/slices/dfsSlice";
import { CodeExecActions } from "@/redux/slices/codeExecSlice";
import { useInterval } from "@/hooks/useInterval";

export const useApplyAlgorithm = () => {
  const {
    algoOutput: visualization,
    visualizationPointer,
    isApplyingAlgorithm,
  } = useAppSelector((store) => store.codeExec);

  const dispatch = useAppDispatch();
  useInterval(
    () => {
      if (
        visualizationPointer <
        (visualization?.flattenedOutput.length ?? 0) - 1
      ) {
        dispatch(CodeExecActions.incrementVisualizationPointer());
      } else {
        dispatch(CodeExecActions.resetVisitedPointer());
        dispatch(CodeExecActions.setIsApplyingAlgorithm(false));
      }
    },
    isApplyingAlgorithm ? 1000 : null
  );
};
