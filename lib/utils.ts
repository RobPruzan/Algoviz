import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HistoryNode, NodeMetadata } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getNodeArray = (nodeRow: NodeMetadata[]) => {
  const arrays: NodeMetadata[][] = [];
  const tempArray: (NodeMetadata & { arrayPosition: number })[] = [];

  nodeRow.forEach((node, index) => {
    const newNode = { ...node, arrayPosition: index };
    if (!node.next) {
      tempArray.push(newNode);
      arrays.push(tempArray);
      return;
    }
    tempArray.push(newNode);
  });
  return arrays;
};

export const getHistoryArray = (historyPointer: HistoryNode | null) => {
  const nodeArrayList = [];
  let curr: HistoryNode | null = historyPointer;

  console.log('da history pointer', historyPointer);

  while (curr) {
    nodeArrayList.push(curr);
    console.log('inside');
    curr = curr.prev;
  }
  nodeArrayList.reverse();
  console.log('da list', nodeArrayList);
  return nodeArrayList;
};
