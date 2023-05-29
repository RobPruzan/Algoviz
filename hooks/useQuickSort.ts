import {
  HandleSortParams,
  HistoryNode,
  NodeMetadata,
  UseSortParams,
} from '@/lib/types';

export type NodeRowState = { nodes: NodeMetadata[]; context: string };

export const useQuickSort = ({
  currentHistory,
  tempHistoryArrayList,
}: UseSortParams) => {
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
    let pivotPointer = low - 1;
    var swappedWithAnyElements = false;
    pushNewHistoryNode({
      arr,
      pivotId: pivot.id,
      stateContext: `Initializing the pivot to: ${pivot.value}; moving nodes smaller than pivot to left of pivot pointer`,
      pivotPointerPosition: pivotPointer,
      fakeArrayBounds: [low, high],
    });

    for (let j = low; j < high; j++) {
      if (arr[j].value < pivot.value) {
        pivotPointer++;
        pushNewHistoryNode({
          stateContext: 'Incrementing pivot pointer',
          arr,
          pivotId: pivot.id,
          pivotPointerPosition: pivotPointer,
          fakeArrayBounds: [low, high],
        });
        const iSwap = arr[pivotPointer].id;
        const jSwap = arr[j].id;

        [arr[pivotPointer], arr[j]] = [arr[j], arr[pivotPointer]];

        pushNewHistoryNode({
          arr,
          swap: [iSwap, jSwap],
          pivotId: pivot.id,
          stateContext: `Moving ${arr[pivotPointer].value} to left of pivot pointer by swapping with ${arr[j].value}`,
          pivotPointerPosition: pivotPointer,
          fakeArrayBounds: [low, high],
        });
        swappedWithAnyElements = true;
      }
    }
    [arr[pivotPointer + 1], arr[high]] = [arr[high], arr[pivotPointer + 1]];

    const swap1 = arr[pivotPointer + 1].id;
    const swap2 = arr[high].id;

    pushNewHistoryNode({
      arr,
      swap: [swap1, swap2],
      pivotId: pivot.id,
      stateContext: `${
        swappedWithAnyElements ? '' : 'All nodes already greater than pivot. '
      }Moving pivot node to pivot pointer location by swapping: ${
        arr[pivotPointer + 1].value
      } with ${arr[high].value}`,
      pivotPointerPosition: pivotPointer,
      fakeArrayBounds: [low, high],
    });

    return pivotPointer + 1;
  };

  function pushNewHistoryNode({
    arr,
    swap,
    pivotId,
    stateContext,
    pivotPointerPosition,
    fakeArrayBounds,
  }: {
    arr: NodeMetadata[];
    swap?: string[];
    pivotId?: string;
    stateContext: string;
    pivotPointerPosition: number;
    fakeArrayBounds: [number, number];
  }) {
    const tail = tempHistoryArrayList.current.at(-1);

    const copiedArray = arr.map((node) => ({ ...node }));

    const newHistoryNode: HistoryNode = {
      prev: tail ?? null,
      next: null,
      element: copiedArray.map((node) => {
        if (swap?.includes(node.id)) {
          return { ...node, color: 'green' };
        }
        if (node.id === pivotId) {
          return { ...node, color: 'red' };
        }

        return node;
      }),
      id: crypto.randomUUID(),
      stateContext,
      pivotPointerPosition,
      fakeArrayBounds,
    };

    tail ? (tail.next = newHistoryNode) : null;

    tempHistoryArrayList.current.push(newHistoryNode);
  }

  const handleQuickSort = ({ arr, onFinish }: HandleSortParams) => {
    tempHistoryArrayList.current = [...currentHistory];
    const sorted = quicksort(arr);
    currentHistory.length > 0 &&
      pushNewHistoryNode({
        stateContext: 'Completed Sort',
        arr: sorted,
        pivotPointerPosition: -2,
        fakeArrayBounds: [-1, -1],
      });

    onFinish(tempHistoryArrayList.current);

    return { sorted };
  };

  return { handleQuickSort };
};
