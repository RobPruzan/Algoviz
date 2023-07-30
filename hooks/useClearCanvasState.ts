import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';
import { useAppDispatch } from '@/redux/store';
import { useEffect } from 'react';

export const useClearCanvasState = (meta: Meta) => {
  const dispatch = useAppDispatch();

  useEffect(
    () => () => {
      dispatch(CanvasActions.resetCircles(undefined));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(
    () => () => {
      dispatch(CanvasActions.resetLines(undefined));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};
