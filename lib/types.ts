import { Dispatch, MutableRefObject, SetStateAction } from 'react';

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
  'breadth first search',
  'merge sort',
  'quick sort',
  'bubble sort',
  'insertion sort',
  'depth first search',
] as const;

export type Algorithms = (typeof ALGORITHMS)[number];

export type AlgorithmInfo = {
  value: Algorithms;
  label: FirstLetterUpperCase<Algorithms>;
};
export type SideBarContextState = {
  algorithm: Algorithms;
  display: DisplayTypes;
};

export type SideBarContextData = {
  sideBarState: SideBarContextState;
  setSideBarState: Dispatch<SetStateAction<SideBarContextState>>;
};
export const DISPLAY_TYPES = ['nodes', 'canvas', 'bar'] as const;

export type DisplayTypes = (typeof DISPLAY_TYPES)[number];

export type NodeConnector = Omit<
  CircleConnector,
  'nodeConnector' | 'type' | 'value'
> & {
  type: 'node1' | 'node2' | 'circle';
  connectedToId: string | null;
};

export type NodeReceiver = Omit<
  CircleConnector,
  'nodeConnector' | 'type' | 'value'
> & {
  type: 'node1' | 'node2' | 'circle';
  attachedIds: string[];
};

export type CircleConnector = {
  id: string;
  type: 'circle';
  value: number;
  // center: [number, number];
  color: string;
  // radius: number;
  nodeConnector: NodeConnector;
} & GeoCircle;

export type GeoCircle = {
  center: [number, number];
  radius: number;
};

export type CircleReceiver = Omit<CircleConnector, 'nodeConnector'> & {
  nodeReceiver: NodeReceiver;
  algorithmMetadata: AlgorithmMetadata;
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

export type UndirectedEdge = Rect & {
  attachNodeOne: NodeConnector;
  attachNodeTwo: NodeConnector;
  algorithmMetadata: AlgorithmMetadata;
  directed: false;
};

export type DirectedEdge = Rect & {
  attachNodeOne: NodeConnector;
  attachNodeTwo: NodeConnector;
  algorithmMetadata: AlgorithmMetadata;
  directed: true;
};

export type Edge = UndirectedEdge | DirectedEdge;

export type LineNodeTaggedUnion =
  | (UndirectedEdge & { nodeConnectedSide: 'one' })
  | (UndirectedEdge & { nodeConnectedSide: 'two' });

export type AlgorithmMetadata = {
  active: boolean;
};

export type SelectedAttachableLine = {
  id: string;
  selected: 'line' | 'node1' | 'node2';
};

export type SelectBox = {
  p1: [number, number];
  p2: [number, number];
  type: 'selectBox';
};
export type MaxPoints = {
  closestToOrigin: [number, number];
  furthestFromOrigin: [number, number];
};

export type AdjacencyList<T extends string> = Map<string, string[]>;
