import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type GraphState = {
  history: {
    queue: string[];
    visited: string[];
  }[];
};

const initialState: GraphState = {
  history: [],
};

const bfsSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setHistoryRef: (state, action: PayloadAction<GraphState>) => {
      // state.history = action.payload;
    },
  },
});
