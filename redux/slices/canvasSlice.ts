import {
  CircleReceiver,
  AlgorithmMetadata,
  DirectedEdge,
  Edge,
} from '@/lib/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as Canvas from '@/lib/Canvas/canvas';
import { ImmutableQueue } from '@/lib/graph';
export type CanvasState = {
  circles: CircleReceiver[];
  attachableLines: Edge[];
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
  variableInspector: { show: false, queues: [], stack: [] },
  creationZoomFactor: 1,
};

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
  },
});

export const CanvasActions = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;
