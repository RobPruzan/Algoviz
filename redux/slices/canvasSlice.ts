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
  },
});

export const CanvasActions = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;
