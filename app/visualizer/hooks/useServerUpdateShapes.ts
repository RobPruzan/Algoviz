import useDebounce from '@/hooks/useDebounce';
import { useEffect } from 'react';
import { useShapeUpdateMutation } from './useShapeUpdateMutation';
import { useAppSelector } from '@/redux/store';
import { useSearchParams } from 'next/navigation';

export const useServerUpdateShapes = () => {
  const {
    attachableLines,
    circles,
    currentZoomFactor: creationZoomFactor,
  } = useAppSelector((store) => store.canvas.present);
  const debouncedCircles = useDebounce(circles, 500);
  const debouncedLines = useDebounce(attachableLines, 500);
  const searchParams = useSearchParams();
  const shapeUpdateMutation = useShapeUpdateMutation();
  const playgroundID = searchParams.get('playground-id');
  useEffect(() => {
    if (playgroundID) {
      shapeUpdateMutation.mutate({
        circles: debouncedCircles,
        zoomAmount: creationZoomFactor,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCircles]);
  useEffect(() => {
    if (playgroundID) {
      shapeUpdateMutation.mutate({
        lines: debouncedLines,
        zoomAmount: creationZoomFactor,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLines]);
};
