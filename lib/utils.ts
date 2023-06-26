import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  AlgorithmInfo,
  CircleReceiver,
  Edge,
  HistoryNode,
  IO,
  NodeMetadata,
  SerializedPlayground,
} from './types';
import { z } from 'zod';
import ky from 'ky';
import { useRef } from 'react';

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

export const DEFAULT_CODE = `type NodeID = string // uuid representing a node
type AdjacencyList = Record<NodeID, NodeID[]>
type VisitedIDs = NodeID[]
type Visualization = VisitedIDs[]

function algorithm(adjList: AdjacencyList): Visualization{
    // your code here
};
`;

export const serializedPlaygroundSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  circles: z.array(z.any()),
  lines: z.array(z.any()),
  pencil: z.array(z.any()),
  userId: z.string(),
  name: z.string(),
  zoomAmount: z.number(),
});

export const serializedPlaygroundsSchema = z.object({
  playgrounds: z.array(serializedPlaygroundSchema),
});
export const getPlaygrounds = async (): Promise<
  {
    userId: string;
    id: number;
    name: string;
  }[]
> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ROUTE}/playground/get`
  );
  const json = await res.json();

  const parsedJson = serializedPlaygroundsSchema.parse(json);

  return parsedJson.playgrounds;
};

export const sendUpdate = (
  state:
    | {
        roomID: string;
        type: 'circleReciever';
        state: CircleReceiver;
        senderID: string;
      }
    | { roomID: string; type: 'edge'; state: Edge; senderID: string },
  socketRef: ReturnType<typeof useRef<IO>>
) => {
  socketRef.current?.emit('update', state);
};

export const sendCreate = (
  state:
    | { roomID: string; type: 'circleReciever'; state: CircleReceiver }
    | { roomID: string; type: 'edge'; state: Edge },
  socketRef: ReturnType<typeof useRef<IO>>
) => {
  socketRef.current?.emit('create', state);
};
