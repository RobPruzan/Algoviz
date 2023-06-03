import { MutableRefObject } from 'react';

export type NodeMetadata = {
  value: number;

  id: string;
  hasNext?: boolean;
  color: string;
};

// Array list of array lists, each inner array list is a specific state during the sort
// in inner array list links represent if they are split into new arrays or not
// quick sort is inplace, so its always in one array, but merge sort creates sub array
export type HistoryNode = {
  id: string;
  next?: HistoryNode | null;
  prev?: HistoryNode | null;
  element: NodeMetadata[];
  stateContext: string;
  pivotPointerPosition?: number;
  fakeArrayBounds?: [number, number];
};

export type UseSortParams = {
  currentHistory: HistoryNode[];
  tempHistoryArrayList: MutableRefObject<HistoryNode[]>;
};

export type HandleSortParams = {
  arr: NodeMetadata[];
  onFinish: (tempNodesRows: HistoryNode[]) => void;
};
export type BaseFirstLetterUpperCase<S extends string> =
  S extends `${infer L1}${infer L2}` ? `${Uppercase<L1>}${L2}` : S;

export type FirstLetterUpperCase<S extends string> =
  S extends `${infer L1}${infer L2} ${infer Rest}`
    ? `${Uppercase<L1>}${L2} ${FirstLetterUpperCase<Rest>}`
    : BaseFirstLetterUpperCase<S>;

export const ALGORITHMS = [
  'merge sort',
  'quick sort',
  'bubble sort',
  'insertion sort',
] as const;

export type Algorithms = (typeof ALGORITHMS)[number];

export type AlgorithmInfo = {
  value: Algorithms;
  label: FirstLetterUpperCase<Algorithms>;
};

export const DISPLAY_TYPES = ['nodes', 'canvas', 'bar'] as const;

export type DisplayTypes = (typeof DISPLAY_TYPES)[number];

export type NodeConnector = Omit<Circle, 'nodeConnector'>;

export type Circle = {
  id: string;
  type: 'circle';
  center: [number, number];
  color: string;
  radius: number;
  nodeConnector: NodeConnector;
};

export type Rect = {
  id: string;
  type: 'rect';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: string;
};
