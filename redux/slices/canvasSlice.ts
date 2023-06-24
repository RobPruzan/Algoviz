import {
  AlgorithmMetadata,
  DirectedEdge,
  Edge,
  SelectedGeometryInfo,
  Prettify,
} from '@/lib/types';
import { enableMapSet } from 'immer';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as Canvas from '@/lib/Canvas/canvas';
import * as Draw from '@/lib/Canvas/drawUtils';
import { ImmutableQueue } from '@/lib/graph';

// type test = Prettify<CircleReceiver>;
export type CanvasState = {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  selectedGeometryInfo: SelectedGeometryInfo | null;
  variableInspector: {
    show: boolean;
    stack: unknown[];
    queues: ImmutableQueue<unknown>[];
  };
  //
  creationZoomFactor: number;
};

const initialState: CanvasState = {
  attachableLines: [],
  circles: [],
  variableInspector: { show: true, queues: [], stack: [] },
  creationZoomFactor: 1,
  selectedGeometryInfo: null,
};
// if (typeof window != 'undefined') {
enableMapSet();
// }
const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    // i should break this up this is no good
    setLines: (state, action: PayloadAction<Edge[]>) => {
      state.attachableLines = action.payload;
    },
    updateCreationZoomFactor: (state, action: PayloadAction<number>) => {
      state.creationZoomFactor *= action.payload;
    },
    deleteCircle: (state, action: PayloadAction<string>) => {
      state.circles = state.circles.filter(
        (circle) => circle.id !== action.payload
      );
    },
    setCircles: (state, action: PayloadAction<CircleReceiver[]>) => {
      state.circles = action.payload;
    },
    replaceCircle: (state, action: PayloadAction<CircleReceiver>) => {
      state.circles = state.circles = Canvas.replaceCanvasElement({
        oldArray: state.circles,
        newElement: action.payload,
      });
    },
    attachNodeToReciever: (
      state,
      action: PayloadAction<{ circleId: string; attachId: string }>
    ) => {
      state.circles
        .find((circle) => circle.id === action.payload.circleId)
        ?.nodeReceiver.attachedIds.push(action.payload.attachId);
    },
    replaceAttachableLine: (state, action: PayloadAction<Edge>) => {
      state.attachableLines = Canvas.replaceCanvasElement({
        oldArray: state.attachableLines,
        newElement: action.payload,
      });
    },
    addLine: (state, action: PayloadAction<Edge>) => {
      state.attachableLines = [...state.attachableLines, action.payload];
    },
    addCircle: (state, action: PayloadAction<CircleReceiver>) => {
      state.circles = [...state.circles, action.payload];
    },
    updateInspectorVisibility: (state, action: PayloadAction<boolean>) => {
      state.variableInspector.show = action.payload;
    },
    updateVariableInspectorQueue: (
      state,
      action: PayloadAction<ImmutableQueue<unknown>[]>
    ) => {
      if (state.variableInspector.show) {
        state.variableInspector.queues = action.payload;
      }
    },

    deleteCircles: (state, action: PayloadAction<string[]>) => {
      const idSet = new Set<string>(action.payload);
      const filtered = state.circles.filter((circle) => !idSet.has(circle.id));

      state.attachableLines.forEach((line) => {
        if (
          line.attachNodeOne.connectedToId &&
          idSet.has(line.attachNodeOne.connectedToId)
        ) {
          line.attachNodeOne = {
            ...line.attachNodeOne,
            connectedToId: null,
          };
        }

        if (
          line.attachNodeTwo.connectedToId &&
          idSet.has(line.attachNodeTwo.connectedToId)
        ) {
          line.attachNodeTwo = {
            ...line.attachNodeTwo,
            connectedToId: null,
          };
        }
      });

      state.circles = filtered;
    },

    deleteLines: (state, action: PayloadAction<string[]>) => {
      const filtered = state.attachableLines.filter(
        (line) => !action.payload.includes(line.id)
      );
      const idSet = new Set<string>(action.payload);

      state.circles.forEach((circle) => {
        circle.nodeReceiver.attachedIds =
          circle.nodeReceiver.attachedIds.filter((id) => !idSet.has(id));
      });

      state.attachableLines = filtered;
    },
    shiftCircles: (
      state,
      action: PayloadAction<{
        selectedGeometryInfo: SelectedGeometryInfo;
        shift: [number, number];
      }>
    ) => {
      const updatedCircles: CircleReceiver[] = state.circles.map((circle) => {
        const { selectedGeometryInfo, shift } = action.payload;
        const shiftedCircle = Canvas.shiftCircle({ circle, shift });
        if (selectedGeometryInfo.selectedIds.includes(circle.id)) {
          return {
            ...shiftedCircle,
            nodeReceiver: {
              ...shiftedCircle.nodeReceiver,
              attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
                selectedGeometryInfo.selectedIds.includes(id)
              ),
            },
          };
        } else {
          return {
            ...circle,
            nodeReceiver: {
              ...circle.nodeReceiver,
              attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
                selectedGeometryInfo.selectedIds.includes(id)
              ),
            },
          };
        }
      });

      state.circles = updatedCircles;
    },

    nullifySelectedGeometryInfo: (state) => {
      state.selectedGeometryInfo = null;
    },

    shiftLines: (state, action: PayloadAction<{ shift: [number, number] }>) => {
      const selectedGeometryInfo = state.selectedGeometryInfo;
      if (selectedGeometryInfo) {
        const updatedLines: Edge[] = state.attachableLines.map((line) => {
          if (
            selectedGeometryInfo.selectedIds.includes(line.id) ||
            selectedGeometryInfo.selectedIds.includes(line.attachNodeOne.id) ||
            selectedGeometryInfo.selectedIds.includes(line.attachNodeTwo.id)
          ) {
            const nodeOneConnectedToId =
              line.attachNodeOne.connectedToId &&
              selectedGeometryInfo.selectedIds.includes(
                line.attachNodeOne.connectedToId
              )
                ? line.attachNodeOne.connectedToId
                : null;

            const nodeTwoConnectedToId =
              line.attachNodeTwo.connectedToId &&
              selectedGeometryInfo.selectedIds.includes(
                line.attachNodeTwo.connectedToId
              )
                ? line.attachNodeTwo.connectedToId
                : null;
            // need to deduplicate this
            const shiftedLine = Canvas.shiftLine({
              line,
              shift: action.payload.shift,
            });
            const newLine: Edge = {
              ...shiftedLine,
              attachNodeOne: {
                ...shiftedLine.attachNodeOne,
                connectedToId: nodeOneConnectedToId,
              },
              attachNodeTwo: {
                ...shiftedLine.attachNodeTwo,
                connectedToId: nodeTwoConnectedToId,
              },
            };

            return newLine;
          }
          return line;
        });

        state.attachableLines = updatedLines;
      }
    },

    shiftSelectBox: (
      state,
      action: PayloadAction<{ shift: [number, number] }>
    ) => {
      if (state.selectedGeometryInfo) {
        state.selectedGeometryInfo = Canvas.shiftSelectBox({
          selectedGeometryInfo: state.selectedGeometryInfo,
          shift: action.payload.shift,
        });
      }
    },
    setSelectedGeometryInfo: (
      state,
      action: PayloadAction<CanvasState['selectedGeometryInfo']>
    ) => {
      state.selectedGeometryInfo = action.payload;
    },
    zoomMaxPoints: (
      state,
      action: PayloadAction<{ center: [number, number]; zoomAmount: number }>
    ) => {
      if (state.selectedGeometryInfo) {
        state.selectedGeometryInfo.maxPoints.closestToOrigin = Draw.zoomLine(
          state.selectedGeometryInfo.maxPoints.closestToOrigin,
          action.payload.center,
          action.payload.zoomAmount
        );

        state.selectedGeometryInfo.maxPoints.furthestFromOrigin = Draw.zoomLine(
          state.selectedGeometryInfo.maxPoints.furthestFromOrigin,
          action.payload.center,
          action.payload.zoomAmount
        );
      }
    },
    panMaxPoints: (state, action: PayloadAction<{ pan: [number, number] }>) => {
      if (state.selectedGeometryInfo) {
        state.selectedGeometryInfo.maxPoints.closestToOrigin = [
          state.selectedGeometryInfo.maxPoints.closestToOrigin[0] -
            action.payload.pan[0],
          state.selectedGeometryInfo.maxPoints.closestToOrigin[1] -
            action.payload.pan[1],
        ];

        state.selectedGeometryInfo.maxPoints.furthestFromOrigin = [
          state.selectedGeometryInfo.maxPoints.furthestFromOrigin[0] -
            action.payload.pan[0],
          state.selectedGeometryInfo.maxPoints.furthestFromOrigin[1] -
            action.payload.pan[1],
        ];
      }
    },
    mapSelectedIds: (state, action: PayloadAction<(id: string) => string>) => {
      const cb = action.payload;
      if (state.selectedGeometryInfo) {
        state.selectedGeometryInfo.selectedIds =
          state.selectedGeometryInfo.selectedIds.map(cb);
      }
    },
    addSelectedIds: (state, action: PayloadAction<string[]>) => {
      if (state.selectedGeometryInfo) {
        state.selectedGeometryInfo.selectedIds = [
          ...state.selectedGeometryInfo.selectedIds,
          ...action.payload,
        ];
      }
    },
  },
});

export const CanvasActions = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;
