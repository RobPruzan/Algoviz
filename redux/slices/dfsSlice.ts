import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type InitialState = {
  visited: string[];
  visitedPointer: number;
};
const initialState: InitialState = { visited: [], visitedPointer: 0 };
const dfsSlice = createSlice({
  name: 'dfs',
  initialState,
  reducers: {
    setVisited: (state, action: PayloadAction<string[]>) => {
      state.visited = action.payload;
    },
    incrementVisitedPointer: (state) => {
      if (state.visitedPointer < state.visited.length - 1) {
        state.visitedPointer++;
      }
    },
    decrementVisitedPointer: (state) => {
      if (state.visitedPointer > 0) {
        state.visitedPointer--;
      }
    },

    resetVisitedPointer: (state) => {
      state.visitedPointer = 0;
    },
  },
});

export const DFSActions = dfsSlice.actions;
export const dfsReducer = dfsSlice.reducer;
