import {
  ControlBarContextData,
  ControlBarContextState,
} from '@/Context/ControlBarContext';
import { HistoryNodesContextState } from '@/Context/HistoryNodesContext';
import { NodeMetadata } from '@/lib/types';
import { MutableRefObject, useRef, useState } from 'react';

type NodeRowState = { nodes: NodeMetadata[]; context: string };

export const useQuickSort = () => {
  // we obviously need to actually quicksort the array
  // we should have a temp, and then once we're done we can visualize the new array however we want
  // could be as simple as if the node has no next then it has a border which represents the new array :thinking
  const tempNodeRows = useRef<NodeRowState[]>([]);

  const quicksort = (
    arr: NodeMetadata[],
    low: number = 0,
    high: number = arr.length - 1
  ): NodeMetadata[] => {
    if (low < high) {
      const partitionIndex = partition(arr, low, high);
      quicksort(arr, low, partitionIndex - 1);
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
    tempNodeRows.current.push({
      nodes: arr,
      context: `Swapped ${arr[i + 1].value} with ${arr[high].value}`,
    });

    return i + 1;
  };

  const handleQuickSort = ({
    arr,
    onFinish,
  }: {
    arr: NodeMetadata[];
    onFinish: (tempNodesRows: NodeRowState[]) => void;
  }) => {
    console.log('passed array');
    const sorted = quicksort(arr);
    onFinish(tempNodeRows.current);

    return sorted;
  };

  return { handleQuickSort };
};
