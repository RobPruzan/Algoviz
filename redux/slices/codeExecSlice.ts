import {
  AlgoFlattenedVis,
  ParsedVisOutput,
} from "@/hooks/network/useCodeMutation";
import { SelectedValidatorLens } from "@/lib/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { boolean } from "zod";

type NodeID = string;
export const MODES = ["visualizer", "validator"] as const;
export type Modes = (typeof MODES)[number];

export type NodeValidation = {
  id: string;
  valid: boolean;
};

type InitialState = {
  algoOutput: AlgoFlattenedVis | null | undefined;

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
  algoOutput: null,
  visualizationPointer: 0,
  isApplyingAlgorithm: false,
  mode: "visualizer",
  appliedToWholeApp: false,
  // validation: null,
  selectedAlgorithm: null,
  error: null,
};
const codeExecSlice = createSlice({
  name: "codeExec",
  initialState,
  reducers: {
    cleanUp: (state) => {
      return initialState;
    },
    setVisualizationPointer: (state, action: PayloadAction<number>) => {
      if (
        action.payload >= 0 &&
        action.payload <= (state.algoOutput?.flattenedOutput.length ?? 0) - 1
      ) {
        state.visualizationPointer = action.payload;
      }
    },

    setError: (state, action: PayloadAction<InitialState["error"]>) => {
      state.error = action.payload;
    },

    setSelectedAlgorithm: (state, action: PayloadAction<string | null>) => {
      state.selectedAlgorithm = action.payload;
    },

    setVisitedVisualization: (
      state,
      action: PayloadAction<InitialState["algoOutput"]>
    ) => {
      state.algoOutput = action.payload;
    },
    incrementVisualizationPointer: (state) => {
      // const TEMP_FILTERED_REVERT_THIS = state.algoOutput?.fullOutput.filter(o => o.tag !== 'Line')
      if (
        state.visualizationPointer <
        (state.algoOutput?.flattenedOutput.length ?? 0) - 1
      ) {
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
