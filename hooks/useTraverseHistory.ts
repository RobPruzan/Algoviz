import { HistoryNode, NodeMetadata } from '@/lib/types';
import { useState } from 'react';
import { NodeRowState } from './useQuickSort';
import { ControlBarContextData } from '@/context/ControlBarContext';

// type UseVisualizerParams = Pick<ControlBarContextData, 'setState'>;
type UseVisualizerParams = {} & ControlBarContextData;

export const useTraverseHistory = ({
  setControlBarState,
  controlBarState,
}: UseVisualizerParams) => {
  const handleMoveForward = (tempHistoryArrayList: HistoryNode[]) => {
    if (tempHistoryArrayList.length - 1 <= controlBarState.historyPointer)
      return;
    setControlBarState((prevState) => ({
      ...prevState,
      historyPointer: prevState.historyPointer + 1,
    }));
  };
  const handleMoveBackward = () => {
    setControlBarState((prev) => {
      const newPointer = prev.historyPointer - 1;
      if (newPointer < 0) return prev;
      return {
        ...prev,
        historyPointer: newPointer,
      };
    });
  };

  return {
    handleMoveForward,
    handleMoveBackward,
  };
};
