import {
  HandleSortParams,
  HistoryNode,
  NodeMetadata,
  UseSortParams,
} from '@/lib/types';

export const useMergeSort = ({
  currentHistory,
  tempHistoryArrayList,
}: UseSortParams) => {
  function mergeSort(arr: NodeMetadata[]): NodeMetadata[] {
    if (arr.length <= 1) {
      return arr;
    }

    const middle = Math.floor(arr.length / 2);

    // need to update the arraylist to break the connection at the middle, not simply just slicing
    const left = arr.slice(0, middle);
    const tailLinkBrokenLeft = left.slice(0, -1).concat([
      {
        ...left.slice(-1)[0],
        next: null,
      },
    ]);
    const right = arr.slice(middle);

    console.log([...tailLinkBrokenLeft, ...right], 'vs', arr);

    return merge(mergeSort(tailLinkBrokenLeft), mergeSort(right));
  }

  function merge(left: NodeMetadata[], right: NodeMetadata[]): NodeMetadata[] {
    let resultArray = [],
      leftIndex = 0,
      rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex].value < right[rightIndex].value) {
        resultArray.push(left[leftIndex]);
        leftIndex++;
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
      id: crypto.randomUUID(),
      stateContext,
    };
    tempHistoryArrayList.current.push(newNode);
  }

  const handleMergeSort = ({ arr, onFinish }: HandleSortParams) => {
    tempHistoryArrayList.current = [...currentHistory];
    const sorted = mergeSort(arr);
    pushNewHistoryNode({
      stateContext: 'Completed Sort',
      arr: sorted.map((node) => node.value),
    });
    onFinish(tempHistoryArrayList.current);
  };

  return { handleMergeSort };
};
