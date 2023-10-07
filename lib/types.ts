import { Meta } from '@/redux/slices/canvasSlice';
import { Algorithm, Playground } from '@prisma/client';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { io } from 'socket.io-client';
import { string } from 'zod';

export type NodeMetadata = {
  value: number;

  id: string;
  hasNext?: boolean;
  color: string;
};

export type RealMessedUpAlgoType = Pick<
  Algorithm,
  'title' | 'code' | 'description' | 'type' | 'language'
>;
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

export const DISPLAY_TYPES = ['nodes', 'canvas', 'bar'] as const;

export type DisplayTypes = (typeof DISPLAY_TYPES)[number];

export type NodeConnector = Omit<
  CircleConnector,
  'nodeConnector' | 'type' | 'value'
> & {
  type: 'node1' | 'node2';
  connectedToId: string | null;
};

export type NodeReceiver = Omit<
  CircleConnector,
  'nodeConnector' | 'type' | 'value'
> & {
  type: 'circle';
  attachedIds: string[];
};

export type CircleConnector = {
  id: string;
  type: 'circle';
  value: number;
  color: string;
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
// >;

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
  nodeConnectedSide?: 'one' | 'two';

  directed: false;
};

export type DirectedEdge = Rect & {
  attachNodeOne: NodeConnector;
  attachNodeTwo: NodeConnector;
  nodeConnectedSide?: 'one' | 'two';
  directed: true;
};

export type Edge = UndirectedEdge | DirectedEdge;

// export type LineNodeTaggedUnion =
//   | (UndirectedEdge & { nodeConnectedSide: 'one' })
//   | (UndirectedEdge & { nodeConnectedSide: 'two' });

export type AlgorithmMetadata = {
  active: boolean;
};

export type SelectedAttachableLine = {
  id: string;
  selected: 'line' | 'node1' | 'node2';
};

export type SelectedValidatorLens = {
  id: string;
  selected: 'validator-lens';
};
export type SelectedValidatorLensResizeCircle = {
  id: string;
  type: 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left';
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

export type AdjacencyList<T> = Map<T, T[]>;

export type SelectedGeometryInfo = {
  // every piece of geomotry that's selected should exist here, even if it's part of the same object
  selectedIds: Array<string>;
  maxPoints: MaxPoints;
};

export const DRAW_TYPES = [
  'pencil',
  'circle-toggle',
  'directed-edge-toggle',
  'undirected-edge-toggle',
  'validator-lens-select',
] as const;
export type DrawTypes = (typeof DRAW_TYPES)[number];
export type TaggedDrawTypes = { tag: DrawTypes; state?: string } | null;

export type PencilCoordinates = {
  drawnCoordinates: [number, number][][];
  drawingCoordinates: [number, number][];
};

export type Percentage = `${string}%`;
export type Prettify<T> = {
  [Key in keyof T]: T[Key];
} & {};

export type SerializedPlayground = Omit<Playground, 'createdAt'> & {
  createdAt: string;
};
export type IO = ReturnType<typeof io>;
export type UntypedData =
  | { roomID: string; type: 'circleReciever'; state: any; senderID: string }
  | { roomID: string; type: 'edge'; state: any; senderID: string };
export type SocketAction = { type: string; payload: any; meta: Meta };

export type FirstParameter<T> = T extends (arg: infer R, ...rest: any[]) => any
  ? R
  : T;

export enum AlgoType {
  Visualizer = 'Visualizer',
  Validator = 'Validator',
}

export enum CanvasControlBarActions {
  Clear = 'Clear',
  Node = 'Node',
  UndirectedEdge = 'UndirectedEdge',
  DirectedEdge = 'DirectedEdge',
  Pencil = 'Pencil',
  Validators = 'Validators',
  Eraser = 'Eraser',
}

export type ArrayItem<T> = T extends (infer U)[] ? U : never;

export type PickedPlayground = Pick<
  Playground,
  'id' | 'circles' | 'lines' | 'pencil' | 'userId' | 'validatorLens'
>;
let test = {} as PickedPlayground;
