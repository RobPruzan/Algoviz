import { configureStore } from '@reduxjs/toolkit';
import { canvasReducer } from './slices/canvasSlice';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
