import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  AlgorithmInfo,
  HistoryNode,
  NodeMetadata,
  SerializedSpace,
} from './types';
import { z } from 'zod';
import ky from 'ky';
import { Space } from '@prisma/client';

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

export const getSpaces = async (): Promise<SerializedSpace[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/space/get`);
  const json = await res.json();
  const spacesSchema = z.object({
    spaces: z.array(
      z.object({
        id: z.number(),
        createdAt: z.string(),
        circles: z.array(z.any()),
        lines: z.array(z.any()),
        pencil: z.array(z.any()),
        userId: z.string(),
        name: z.string(),
      })
    ),
  });
  console.log('THE OG JSON', json);
  const parsedJson = spacesSchema.parse(json);
  return parsedJson.spaces;
};
