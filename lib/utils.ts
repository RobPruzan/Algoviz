import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlgorithmInfo, HistoryNode, NodeMetadata } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getNodeArray = (nodeRow: NodeMetadata[]) => {
  const arrays: NodeMetadata[][] = [];
  const tempArray: (NodeMetadata & { arrayPosition: number })[] = [];

  nodeRow.forEach((node, index) => {
    const newNode = { ...node, arrayPosition: index };
    if (!node.hasNext) {
      tempArray.push(newNode);
      arrays.push(tempArray);
      return;
    }
    tempArray.push(newNode);
  });
  return arrays;
};

export const algorithmsInfo: AlgorithmInfo[] = [
  {
    value: 'merge sort',
    label: 'Merge Sort',
  },
  {
    value: 'quick sort',
    label: 'Quick Sort',
  },
  {
    value: 'breadth first search',
    label: 'Breadth First Search',
  },
  {
    value: 'depth first search',
    label: 'Depth First Search',
  },
];
