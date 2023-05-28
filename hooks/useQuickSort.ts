import {
  ControlBarContextData,
  ControlBarContextState,
} from '@/Context/ControlBarContext';
import { HistoryNodesContextState } from '@/Context/HistoryNodesContext';
import { HistoryNode, NodeMetadata } from '@/lib/types';
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react';

export type NodeRowState = { nodes: NodeMetadata[]; context: string };

export const useQuickSort = ({
  currentHistory,
  tempHistoryArrayList,
}: {
  currentHistory: HistoryNode[];
  tempHistoryArrayList: MutableRefObject<HistoryNode[]>;
}) => {
  // we obviously need to actually quicksort the array
  // we should have a temp, and then once we're done we can visualize the new array however we want
  // could be as simple as if the node has no next then it has a border which represents the new array :thinking
  // const tempHistoryArrayList = useRef<HistoryNode[]>([]);

  const quicksort = (
    arr: NodeMetadata[],
    low: number = 0,
    high: number = arr.length - 1
  ): NodeMetadata[] => {
    if (low < high) {
      const partitionIndex = partition(arr, low, high);
      console.log('da array 1');
      quicksort(arr, low, partitionIndex - 1);
      console.log('da array 2');

      quicksort(arr, partitionIndex + 1, high);
    }

    return arr;
  };

  const partition = (
    arr: NodeMetadata[],
    low: number,
    high: number
  ): number => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (arr[j].value < pivot.value) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const tail = tempHistoryArrayList.current.at(-1);

    const copiedArray = arr.map((node) => ({ ...node }));

    const newHistoryNode: HistoryNode = {
      prev: tail ?? null,
      next: null,
      element: copiedArray,
      stateContext: `Swapped ${arr[i + 1].value} with ${arr[high].value}`,
    };

    tail ? (tail.next = newHistoryNode) : null;

    tempHistoryArrayList.current.push(newHistoryNode);
    console.log('pusing');
    return i + 1;
  };

  const handleQuickSort = ({
    arr,
    onFinish,
  }: {
    arr: NodeMetadata[];
    onFinish: (tempNodesRows: HistoryNode[]) => void;
  }) => {
    tempHistoryArrayList.current = [
      ...currentHistory,
      ...tempHistoryArrayList.current,
    ];
    const sorted = quicksort(arr);

    onFinish(tempHistoryArrayList.current);

    return { sorted };
  };

  return { handleQuickSort };
};
