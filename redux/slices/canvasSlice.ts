import { CircleReceiver, Edge, AlgorithmMetadata } from '@/lib/types';
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
};

const initialState: CanvasState = {
  attachableLines: [],
  circles: [],
  variableInspector: { show: false, queues: [], stack: [] },
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setLines: (state, action: PayloadAction<Edge[]>) => {
      state.attachableLines = action.payload;
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
      console.log('deleteing', filtered, 'vs', state.circles);

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
      console.log('deleteing', filtered, 'vs', state.circles);

      state.attachableLines = filtered;
    },
  },
});

export const CanvasActions = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;
