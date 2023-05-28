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

export const getHistoryArray = (
  history: HistoryNode[],
  historyIndex: number
) => {
  const nodeArrayList: HistoryNode[] = [];
  const node = history.at(historyIndex);
  var curr = historyIndex;

  while (curr >= 0) {
    const at = history.at(curr);
    at && nodeArrayList.push(at);
    curr -= 1;
  }

  return nodeArrayList.reverse();
};
