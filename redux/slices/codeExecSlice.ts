import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type NodeID = string;

type InitialState = {
  visualization: NodeID[][];
  visualizationPointer: number;
  isApplyingAlgorithm: boolean;
};
const initialState: InitialState = {
  visualization: [],
  visualizationPointer: 0,
  isApplyingAlgorithm: false,
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
  },
});

export const codeExecActions = codeExecSlice.actions;
export const codeExecReducer = codeExecSlice.reducer;
