import { HistoryNode, NodeMetadata, UseSortParams } from '@/lib/types';

export const useMergeSort = ({
  currentHistory,
  tempHistoryArrayList,
}: UseSortParams) => {
  function mergeSort(arr: NodeMetadata[]): NodeMetadata[] {
    if (arr.length <= 1) {
      return arr;
    }

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return merge(mergeSort(left), mergeSort(right));
  }

  function merge(left: NodeMetadata[], right: NodeMetadata[]): NodeMetadata[] {
    let resultArray = [],
      leftIndex = 0,
      rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex].value < right[rightIndex].value) {
        resultArray.push(left[leftIndex]);
        leftIndex++; // move left array cursor
      } else {
        resultArray.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return resultArray
      .concat(left.slice(leftIndex))
      .concat(right.slice(rightIndex));
  }

  function pushNewHistoryNode({
    arr,
    stateContext,
  }: {
    arr: number[];
    stateContext: string;
  }) {
    const newNode: HistoryNode = {
      next: null,
      prev: null,
      element: arr.map((value) => ({
        value,
        id: `${value}`,
        color: 'blue',
      })),
      stateContext,
    };
    tempHistoryArrayList.current.push(newNode);
  }
};
