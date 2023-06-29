import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { boolean } from 'zod';

type NodeID = string;
export const MODES = ['visualizer', 'validator'] as const;
export type Modes = (typeof MODES)[number];

export type NodeValidation = {
  id: string;
  valid: boolean;
};

type InitialState = {
  visualization: NodeID[][];
  visualizationPointer: number;
  isApplyingAlgorithm: boolean;
  mode: Modes;
  appliedToWholeApp: boolean;
  validation: NodeValidation[];
};
const initialState: InitialState = {
  visualization: [],
  visualizationPointer: 0,
  isApplyingAlgorithm: false,
  mode: 'visualizer',
  appliedToWholeApp: false,
  validation: [],
};
const codeExecSlice = createSlice({
  name: 'dfs',
  initialState,
  reducers: {
    setVisited: (
      state,
      action: PayloadAction<InitialState['visualization']>
    ) => {
      state.visualization = action.payload;
    },
    incrementVisualizationPointer: (state) => {
      if (state.visualizationPointer < state.visualization.length) {
        state.visualizationPointer++;
      }
    },
    decrementVisualizationPointer: (state) => {
      if (state.visualizationPointer > 0) {
        state.visualizationPointer--;
      }
    },

    resetVisitedPointer: (state) => {
      state.visualizationPointer = 0;
    },
    setIsApplyingAlgorithm: (state, action: PayloadAction<boolean>) => {
      state.isApplyingAlgorithm = action.payload;
    },
    toggleIsApplyingAlgorithm: (state) => {
      state.isApplyingAlgorithm = !state.isApplyingAlgorithm;
    },
    setMode: (state, action: PayloadAction<Modes>) => {
      state.mode = action.payload;
    },
    setApplyAlgoToWholeApp: (state, action: PayloadAction<boolean>) => {
      console.log('man what');
      state.appliedToWholeApp = action.payload;
    },

    setAreNodesValid: (state, action: PayloadAction<NodeValidation[]>) => {
      state.validation = action.payload;
    },
  },
});

export const CodeExecActions = codeExecSlice.actions;
export const codeExecReducer = codeExecSlice.reducer;
