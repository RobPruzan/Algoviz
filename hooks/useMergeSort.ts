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
    const leftTail = left.at(-1);
    leftTail ? (leftTail.hasNext = false) : null;
    // const tailLinkBrokenLeft = left.slice(0, -1).concat([
    //   {
    //     ...left.slice(-1)[0],
    //     hasNext: false,
    //   },
    // ]);
    const right = arr.slice(middle);

    pushNewHistoryNode({
      stateContext: `Splitting array into two halves:`,
      arr: [...left, ...right],
    });

    return merge(mergeSort(left), mergeSort(right));
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
    arr: NodeMetadata[];
    stateContext: string;
  }) {
    const copiedSubArray = arr.map((node) => ({ ...node }));
    const copiedFullArray = tempHistoryArrayList.current
      .at(0)
      ?.element.map((node) => ({ ...node }));

    'actual vs current', arr, 'vs', copiedFullArray;
    // JSON.parse(JSON.stringify(tempHistoryArrayList.current.at(0)) ?? [])
    const newNode: HistoryNode = {
      next: null,
      prev: null,
      // TODO determine what this is doing
      element: copiedFullArray ?? arr,
      id: crypto.randomUUID(),
      stateContext,
    };
    tempHistoryArrayList.current.push(newNode);
  }

  const handleMergeSort = ({ arr, onFinish }: HandleSortParams) => {
    const sorted = mergeSort(arr);
    pushNewHistoryNode({
      stateContext: 'Completed Sort',
      arr: sorted,
    });
    onFinish(tempHistoryArrayList.current);
  };

  return { handleMergeSort };
};
