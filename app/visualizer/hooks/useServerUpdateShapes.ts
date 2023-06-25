import useDebounce from '@/hooks/useDebounce';
import { useEffect } from 'react';
import { useShapeUpdateMutation } from './useShapeUpdateMutation';
import { useAppSelector } from '@/redux/store';

export const useServerUpdateShapes = () => {
  const { attachableLines, circles, creationZoomFactor } = useAppSelector(
    (store) => store.canvas
  );
  const debouncedCircles = useDebounce(circles, 500);
  const debouncedLines = useDebounce(attachableLines, 500);
  const shapeUpdateMutation = useShapeUpdateMutation();
  useEffect(() => {
    shapeUpdateMutation.mutate({
      circles: debouncedCircles,
      zoomAmount: creationZoomFactor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCircles]);
  useEffect(() => {
    shapeUpdateMutation.mutate({
      lines: debouncedLines,
      zoomAmount: creationZoomFactor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLines]);
};
