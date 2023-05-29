import { MutableRefObject } from 'react';

export type NodeMetadata = {
  value: number;

  id: string;
  next?: NodeMetadata | null;
  color: string;
};

// Array list of array lists, each inner array list is a specific state during the sort
// in inner array list links represent if they are split into new arrays or not
// quick sort is inplace, so its always in one array, but merge sort creates sub array
export type HistoryNode = {
  next: HistoryNode | null;
  prev: HistoryNode | null;
  element: NodeMetadata[];
  stateContext: string;
  pivotPointerPosition?: number;
  fakeArrayBounds?: [number, number];
};

export type UseSortParams = {
  currentHistory: HistoryNode[];
  tempHistoryArrayList: MutableRefObject<HistoryNode[]>;
};
