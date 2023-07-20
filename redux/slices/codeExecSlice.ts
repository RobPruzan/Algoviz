import { SelectedValidatorLens } from '@/lib/types';
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
  visualization: NodeID[][] | null | undefined;

  visualizationPointer: number;
  isApplyingAlgorithm: boolean;
  mode: Modes;
  appliedToWholeApp: boolean;
  // validation: (NodeValidation[] | boolean) | null;
  selectedAlgorithm: string | null;
  error: {
    message: string;
    logs: string[];
  } | null;
};
const initialState: InitialState = {
  visualization: [],
  visualizationPointer: 0,
  isApplyingAlgorithm: false,
  mode: 'visualizer',
  appliedToWholeApp: false,
  // validation: null,
  selectedAlgorithm: null,
  error: null,
};
const codeExecSlice = createSlice({
  name: 'dfs',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<InitialState['error']>) => {
      state.error = action.payload;
    },

    setSelectedAlgorithm: (state, action: PayloadAction<string | null>) => {
      state.selectedAlgorithm = action.payload;
    },
    // setValidationVisualization: (
    //   state,
    //   action: PayloadAction<InitialState['validation']>
    // ) => {
    //   state.validation = action.payload;
    // },

    setVisitedVisualization: (
      state,
      action: PayloadAction<InitialState['visualization']>
    ) => {
      state.visualization = action.payload;
    },
    incrementVisualizationPointer: (state) => {
      if (state.visualizationPointer < (state.visualization?.length ?? 0)) {
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
      state.appliedToWholeApp = action.payload;
    },
  },
});

export const CodeExecActions = codeExecSlice.actions;
export const codeExecReducer = codeExecSlice.reducer;
