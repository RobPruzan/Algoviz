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
      console.log('ACTION IS', action);
      state.visited = action.payload;
    },
    incrementVisitedPointer: (state) => {
      console.log('action run inc');

      state.visitedPointer++;
    },
    decrementVisitedPointer: (state) => {
      console.log('action run dec');
      state.visitedPointer--;
    },
  },
});

export const DFSActions = dfsSlice.actions;
export const dfsReducer = dfsSlice.reducer;
