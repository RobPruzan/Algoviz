import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch } from '@/redux/store';
import { useEffect } from 'react';

export const useClearCanvasState = () => {
  const dispatch = useAppDispatch();
  useEffect(
    () => () => {
      dispatch(CanvasActions.resetCircles());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(
    () => () => {
      dispatch(CanvasActions.resetLines());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};
