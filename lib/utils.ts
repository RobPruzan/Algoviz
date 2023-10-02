import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  // AlgorithmInfo,
  CircleReceiver,
  Edge,
  HistoryNode,
  IO,
  NodeMetadata,
  RealMessedUpAlgoType,
  SelectedGeometryInfo,
  SerializedPlayground,
} from './types';
import { z } from 'zod';
import ky from 'ky';
import { useRef } from 'react';
import {
  CanvasActions,
  Meta,
  ValidatorLensInfo,
} from '@/redux/slices/canvasSlice';
import { CodeStorage } from '@/hooks/codeStorage';
import { defaultAlgo } from '@/app/visualizer/ContentWrapper';
// import { type AppDispatch } from '@/redux/store';
import { useGetPresets } from '@/hooks/useGetPresets';

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
type BuildParams<T extends ReturnType<typeof useGetPresets>['data']> = {
  preset: T extends { presets: Array<infer R> } ? R : never;
  currentZoomFactor: number;

  dispatcher: Function;
};

export const dispatchPreset = <
  T extends ReturnType<typeof useGetPresets>['data']
>({
  currentZoomFactor,
  dispatcher,

  preset,
}: BuildParams<T>) => {
  // trivial offset to add to the UUID, works fine
  const offset = String(Date.now());
  const newZoom = preset.zoomAmount * currentZoomFactor;
  // need to do a mouse centered zoom on the coordinates for that to work
  // everything also needs to be integrated to the selected item flow, get the mouse pos, mouse center zoom every single item and then place, no other odd scaling. Works for the circle, doesn't work for the line since before we just hardcoded it
  // dispatch(
  //   CanvasActions.addPreset(

  const newPreset = {
    type: preset.type,
    code: preset.code,
    startNode: preset.startNode + offset,
    // offset mapping is necessary to allow multiple presets to be made in the same playground
    attachableLines: (preset.lines as Edge[]).map((line) => ({
      ...line,
      id: line.id + offset,
      width: line.width * newZoom,
      attachNodeOne: {
        ...line.attachNodeOne,
        id: line.attachNodeOne.id + offset,
        radius: line.attachNodeOne.radius * newZoom,
        connectedToId: line.attachNodeOne.connectedToId + offset,
      },
      attachNodeTwo: {
        ...line.attachNodeTwo,
        radius: line.attachNodeTwo.radius * newZoom,
        id: line.attachNodeTwo.id + offset,
        connectedToId: line.attachNodeTwo.connectedToId + offset,
      },
    })),
    circles: (preset.circles as CircleReceiver[]).map((circle) => ({
      ...circle,
      id: circle.id + offset,

      radius: circle.radius * newZoom,
      nodeReceiver: {
        ...circle.nodeReceiver,
        radius: circle.nodeReceiver.radius * newZoom,
        id: circle.nodeReceiver.id + offset,
        attachedIds: circle.nodeReceiver.attachedIds.map(
          (nrID: string) => nrID + offset
        ),
      },
    })),
  };
  dispatcher(newPreset);
};
export const GREEN_BLINKING_PRESETS = [
  'depth-first-search',
  'breadth-first-search',
  'backtracking',
];
export const getCode = (
  userAlgo: RealMessedUpAlgoType,
  presetCode: string | null
) => {
  if (typeof window === 'undefined') {
    return userAlgo.code;
  }
  // probably should just prompt user that defaultng currently selected algo not preset algo
  if (userAlgo !== defaultAlgo) {
    return userAlgo.code;
  }

  if (presetCode) {
    return presetCode;
  }
  const storageCode = CodeStorage.getCode().code;
  if (userAlgo === defaultAlgo && storageCode) {
    return storageCode;
  } else {
    return userAlgo.code;
  }
};

export const API_URL =
  typeof window !== 'undefined' ? window.origin + '/api' : '';

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
  const res = await fetch(`${API_URL}/playground/get`);
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

export const run = <T>(f: () => T): T => f();
