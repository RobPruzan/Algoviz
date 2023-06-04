import { CircleReceiver, Edge, AlgorithmMetadata } from '@/lib/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as Canvas from '@/lib/canvas';
export type CanvasState = {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  variableInspector: { show: false } | { show: true };
};

const initialState: CanvasState = {
  attachableLines: [],
  circles: [],
  variableInspector: { show: false },
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
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
      state.variableInspector = { show: action.payload };
    },
  },
});

export const CanvasActions = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;
