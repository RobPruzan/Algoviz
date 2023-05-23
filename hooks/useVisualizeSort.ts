import { ControlBarContextData } from '@/Context/ControlBarContext';
import { HistoryNode, NodeMetadata } from '@/lib/types';
import { useState } from 'react';

type UseVisualizerParams = {
  nodeRows: NodeMetadata[][];
  setNodeRows: React.Dispatch<React.SetStateAction<NodeMetadata[][]>>;
  tempNodeRows: HistoryNode[];
} & ControlBarContextData;

export const useVisualizeSort = ({
  nodeRows,
  setNodeRows,
  setState,
  state,
  tempNodeRows,
}: UseVisualizerParams) => {
  const [history, setHistory] = useState<HistoryNode | null>(null);

  // we need to update the actual state of the node rows, so we will need the setHandler
  // need sometimeout while we loop through it
  // need to be able to control it
  // need to be able to step through it.
  // A doubly linked list may make sense here`
  // this makes more sense as a state machine
  // but i can implement the state machine as a doubly linked list
  const handleMoveForward = () => {
    setState((prev) => {
      const newPointer = prev.historyPointer ? prev.historyPointer.next : null;
      return {
        ...prev,
        historyPointer: newPointer,
      };
    });
  };
  const handleMoveBackward = () => {
    setState((prev) => {
      const newPointer = prev.historyPointer ? prev.historyPointer.prev : null;
      return {
        ...prev,
        historyPointer: newPointer,
      };
    });
  };
};
