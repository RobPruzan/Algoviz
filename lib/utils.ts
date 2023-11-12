import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
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
} from "./types";
import { map, z } from "zod";
import ky from "ky";

import { useRef } from "react";
import {
  CanvasActions,
  Meta,
  ValidatorLensInfo,
} from "@/redux/slices/canvasSlice";
import { CodeStorage } from "@/hooks/codeStorage";
import { defaultAlgo } from "@/app/visualizer/ContentWrapper";
// import { type AppDispatch } from '@/redux/store';
import { useGetPresets } from "@/hooks/useGetPresets";
import { ParsedVisOutput } from "@/hooks/useCodeMutation";
import { match } from "ts-pattern";

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
type BuildParams<T extends ReturnType<typeof useGetPresets>["data"]> = {
  preset: T extends { presets: Array<infer R> } ? R : never;
  currentZoomFactor: number;

  dispatcher: Function;
};

export const dispatchPreset = <
  T extends ReturnType<typeof useGetPresets>["data"]
>({
  currentZoomFactor,
  dispatcher,

  preset,
}: BuildParams<T>) => {
  // trivial offset to add to the UUID, works fine
  const offset = String(Date.now());
  // const newZoom = preset.zoomAmount * currentZoomFactor;
  // need to do a mouse centered zoom on the coordinates for that to work
  // everything also needs to be integrated to the selected item flow, get the mouse pos, mouse center zoom every single item and then place, no other odd scaling. Works for the circle, doesn't work for the line since before we just hardcoded it
  // dispatch(
  //   CanvasActions.addPreset(
  // i know what im doing move on pal
  const valLens =
    JSON.stringify(preset.validatorLens) === "{}" ? [] : preset.validatorLens;

  const copiedLens: ValidatorLensInfo[] = (valLens as ValidatorLensInfo[]).map(
    (lens) => ({
      ...lens,
      id: lens.id + offset,
      selectedIds: lens.selectedIds.map((id) => id + offset),
    })
  );

  const newPreset = {
    zoomAmount: preset.zoomAmount,
    type: preset.type,
    code: preset.code,
    startNode: preset.startNode + offset,
    validatorLens: copiedLens,
    // offset mapping is necessary to allow multiple presets to be made in the same playground
    attachableLines: (preset.lines as Edge[]).map((line) => ({
      ...line,
      id: line.id + offset,
      width: line.width,
      attachNodeOne: {
        ...line.attachNodeOne,
        id: line.attachNodeOne.id + offset,
        radius: line.attachNodeOne.radius,
        connectedToId: line.attachNodeOne.connectedToId + offset,
      },
      attachNodeTwo: {
        ...line.attachNodeTwo,
        radius: line.attachNodeTwo.radius,
        id: line.attachNodeTwo.id + offset,
        connectedToId: line.attachNodeTwo.connectedToId + offset,
      },
    })),
    circles: (preset.circles as CircleReceiver[]).map((circle) => ({
      ...circle,
      id: circle.id + offset,

      radius: circle.radius,
      nodeReceiver: {
        ...circle.nodeReceiver,
        radius: circle.nodeReceiver.radius,
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
  "depth-first-search",
  "breadth-first-search",
  "backtracking",
  "topological-sort",
];
export const getCode = (
  userAlgo: RealMessedUpAlgoType,
  presetCode: string | null
) => {
  if (typeof window === "undefined") {
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
  typeof window !== "undefined" ? window.origin + "/api" : "";

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
  validatorLens: z.array(z.any()),
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
        type: "circleReciever";
        state: CircleReceiver;
        senderID: string;
      }
    | { roomID: string; type: "edge"; state: Edge; senderID: string },
  socketRef: ReturnType<typeof useRef<IO>>
) => {
  socketRef.current?.emit("update", state);
};

export const sendCreate = (
  state:
    | { roomID: string; type: "circleReciever"; state: CircleReceiver }
    | { roomID: string; type: "edge"; state: Edge },
  socketRef: ReturnType<typeof useRef<IO>>
) => {
  socketRef.current?.emit("create", state);
};

export const twCond = ({
  base = "",
  cases,
  fallback,
}: {
  base?: string;
  cases: { cond: boolean; className: string }[];
  fallback?: string;
}): string => {
  return (
    base + " " + cases.find((cond) => cond.cond)?.className ?? fallback ?? ""
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

export function parseDictOrSet(
  inputString: string,
  mapper: (variable: string) => SerializedNode
):
  | { type: "table"; value: Record<string, Array<SerializedNode>> }
  | { type: "set"; value: Array<SerializedNode> }
  | { type: "unknown" } {
  const setPattern = /^\{(?:\s*Node\(.*?\)\s*,\s*)*\s*Node\(.*?\)\s*\}$/;
  const dictPattern =
    /^\{(?:\s*Node\(.*?\)\s*:\s*\[.*?\]\s*,\s*)*\s*Node\(.*?\)\s*:\s*\[.*?\]\s*\}$/;

  if (setPattern.test(inputString)) {
    const elements = inputString.match(/Node\(.*?\)/g);
    return elements
      ? { type: "set", value: elements.map(mapper) }
      : { type: "unknown" };
  }

  if (dictPattern.test(inputString)) {
    const dictElements = [
      ...inputString.matchAll(/(Node\(.*?\)):\s*\[(.*?)\]/g),
    ];
    if (!dictElements) return { type: "unknown" };

    const parsedDict: { [key: string]: Array<SerializedNode> } = {};

    dictElements.forEach((match) => {
      const key = match[1].trim();
      const nodeMatches = match[2].match(/Node\(.*?\)/g);
      if (nodeMatches) {
        parsedDict[key] = nodeMatches.map((s) => mapper(s.trim()));
      }
    });

    return { type: "table", value: parsedDict };
  }

  return { type: "unknown" };
}

export const toStackSnapshotAtVisUpdate = (trace: Array<ParsedVisOutput>) => {
  let previous = JSON.stringify(trace.at(0) ?? "");
  let snapshots: typeof trace = [];

  for (const frame of trace) {
    const stringified = JSON.stringify(frame.visualization);
    if (
      stringified !== previous ||
      // && frame.tag == "Call"
      frame.tag === "Return"
    ) {
      snapshots.push(frame);
    }
    if (frame.tag) previous = stringified;
  }
  return snapshots;
};

// export const variableToStack = ({ variable, trace }: { variable: string, trace: Array<ParsedVisOutput> }) => {
//   trace.map(stack => {
//     const current = stack.frames.at(-1)
//   }))
// }
type SerializedNode = { ID: string; value: number };
export type AutoParseResult<T> =
  | { value: Record<string, Array<SerializedNode>>; type: "table" }
  | { value: string; type: "string" }
  | { type: "array-of-nodes"; value: Array<SerializedNode> }
  | { type: "error"; value: T; message: string }
  | { type: "singleton"; value: SerializedNode };

export const parseNodeRepr = (nodeRepr: string): SerializedNode => {
  const regex = /Node\(ID='(.*?)',\s*value=(\d+)\)/;

  const match = nodeRepr.match(regex);
  if (!match) {
    throw new Error("invalid node type");
  }
  const [, ID, value] = match;
  return { ID, value: parseInt(value) };
};

export const wrapNodeInString = (someStr: string) => {
  const regex = /Node\(.*?\)/g;
  const matches = someStr.match(regex);

  return matches ?? [];
};

export const autoParseVariable = <
  T extends string | Record<string, unknown> | Array<unknown>
>(
  variable: T
): AutoParseResult<T> => {
  try {
    if (variable instanceof Array) {
      if (
        variable.length == 2 &&
        typeof variable.at(0) === "string" &&
        typeof variable.at(1) === "number"
      ) {
        return {
          type: "singleton",
          value: {
            ID: variable.at(0) as string,
            value: variable.at(1) as number,
          },
        };
      }
      return {
        type: "array-of-nodes",
        value: variable.map((variable) => {
          const typedVariable = variable as [string, number];
          return { ID: typedVariable[0], value: typedVariable[1] };
        }),
      };
    }
    if (typeof variable === "string") {
      if (variable.slice(0, 5) === "deque") {
        // const;

        const nodes = wrapNodeInString(variable).map(parseNodeRepr);
        return {
          type: "array-of-nodes",
          value: nodes,
        };
      }

      try {
        const dictOSet = parseDictOrSet(variable, parseNodeRepr);

        switch (dictOSet.type) {
          case "set": {
            return {
              type: "array-of-nodes",
              value: dictOSet.value,
            };
          }
          case "table": {
            return {
              type: "table",
              value: dictOSet.value,
            };
          }
          case "unknown": {
            return {
              type: "error",
              message: dictOSet.type,
              value: variable,
            };
          }
        }
      } catch (e) {
        return {
          type: "error",
          message: "something went wrong",
          value: variable,
        };
      }
      return { type: "string", value: variable };
    }
    if (typeof variable === "object") {
      return {
        type: "table",
        value: Object.fromEntries(
          Object.entries(variable).map(([k, v]) => [k, , JSON.stringify(v)])
        ),
      };
    }

    return {
      type: "error",
      value: variable,
      message: "wadu",
    };
  } catch (e) {
    let typedE = e as Error;

    return {
      type: "error",
      value: variable,
      message: typedE.message,
    };
  }

  // the certain cases
  // a node gets serialized as a tuple: [id, value]
  // a deque will be used often, so deque([...]) needs to be parsed
  // just a string can just be left alone
  // an object can be shown as a table, so we'll just return that
};
