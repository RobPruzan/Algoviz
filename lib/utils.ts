import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  AlgorithmInfo,
  CircleReceiver,
  Edge,
  HistoryNode,
  IO,
  NodeMetadata,
  SelectedGeometryInfo,
  SerializedPlayground,
} from './types';
import { z } from 'zod';
import ky from 'ky';
import { useRef } from 'react';
import { ValidatorLensInfo } from '@/redux/slices/canvasSlice';

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

export const DEFAULT_VISUALIZATION_CODE = `type NodeID = string // uuid representing a node
type AdjacencyList = Record<NodeID, NodeID[]>
type VisitedIDs = NodeID[]
type Visualization = VisitedIDs[]

function algorithm(adjList: AdjacencyList): Visualization{
    // your code here
};
`;

export const DEFAULT_VALIDATOR_CODE = `type NodeID = string // uuid representing a node
type AdjacencyList = Record<NodeID, NodeID[]>
type VisitedIDs = NodeID[]


function algorithm(adjList: AdjacencyList): boolean {
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

export const minimalPlaygroundSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  userId: z.string(),
  name: z.string(),
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

  const parsedJson = z
    .object({ playgrounds: z.array(minimalPlaygroundSchema) })
    .parse(json);

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

export const twCond = ({
  base = '',
  cases,
  fallback,
}: {
  base?: string;
  cases: { cond: boolean; className: string }[];
  fallback?: string;
}): string => {
  return (
    base + ' ' + cases.find((cond) => cond.cond)?.className ?? fallback ?? ''
  );
};

export const RESIZE_CIRCLE_RADIUS = 5;

export const getValidatorLensResizeCirclesCenter = (
  validatorLens: ValidatorLensInfo
) => {
  const topLeft = validatorLens.rect.topLeft;
  const topRight: [number, number] = [
    validatorLens.rect.bottomRight[0],
    validatorLens.rect.topLeft[1],
  ];
  const bottomLeft: [number, number] = [
    validatorLens.rect.topLeft[0],
    validatorLens.rect.bottomRight[1],
  ];
  const bottomRight = validatorLens.rect.bottomRight;

  return {
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    RESIZE_CIRCLE_RADIUS,
  };
};

export const getSelectedItems = ({
  attachableLines,
  circles,
  selectedGeometryInfo,
}: {
  attachableLines: Edge[];
  circles: CircleReceiver[];
  selectedGeometryInfo: SelectedGeometryInfo | null;
}) => {
  const selectedAttachableLines = attachableLines.filter((line) =>
    // not a set because of redux :(
    selectedGeometryInfo?.selectedIds.includes(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.includes(circle.id)
  );

  return {
    selectedAttachableLines,
    selectedCircles,
  };
};

export const getValidatorLensSelectedIds = ({
  attachableLines,
  circles,
  validatorLensContainer,
}: {
  attachableLines: Edge[];
  circles: CircleReceiver[];
  validatorLensContainer: ValidatorLensInfo[];
}) => {
  const selectedIds = attachableLines
    .filter((line) =>
      validatorLensContainer.some((lens) => lens.selectedIds.includes(line.id))
    )
    .map((line) => line.id)
    .flat()
    .concat(
      circles
        .filter((circle) =>
          validatorLensContainer.some((lens) =>
            lens.selectedIds.includes(circle.id)
          )
        )
        .map((circle) => circle.id)
        .flat()
    );

  return selectedIds;
};
