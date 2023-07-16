import { PencilCoordinates, SelectedAttachableLine } from '@/lib/types';
import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  MutableRefObject,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import * as Draw from '@/lib/Canvas/draw';
type UseCanvasWheel = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
};
export const useCanvasWheel = ({ canvasRef }: UseCanvasWheel) => {
  const offsetX = useRef(0);
  const offsetY = useRef(0);
  const dispatch = useAppDispatch();
  const { attachableLines, circles, cameraCoordinate } = useAppSelector(
    (store) => store.canvas
  );
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      // this is going to look awful and will 100% be refactored when everything works, no point in making something clean that might not work
      if (event.ctrlKey) {
        // This is a pinch gesture
        const zoomAmount = event.deltaY > 0 ? 0.98 : 1.02;
        dispatch(CanvasActions.updateCreationZoomFactor(zoomAmount));
        const center: [number, number] = Draw.getCursorPosition(
          event,
          canvasRef,
          cameraCoordinate
        );

        dispatch(CanvasActions.setValidatorLensContainer);
        // this should all be a zoom action

        dispatch(
          CanvasActions.setCircles(
            circles.map((circle) => ({
              ...circle,
              center: Draw.zoomCircle(
                [circle.center[0], circle.center[1]],
                circle.radius,
                center,
                zoomAmount
              )[0],
              nodeReceiver: {
                ...circle.nodeReceiver,
                center: Draw.zoomCircle(
                  circle.nodeReceiver.center,
                  circle.nodeReceiver.radius,
                  center,
                  zoomAmount
                )[0],
                radius: Draw.zoomCircle(
                  circle.nodeReceiver.center,
                  circle.nodeReceiver.radius,
                  center,
                  zoomAmount
                )[1],
              },
              radius: Draw.zoomCircle(
                circle.center,
                circle.radius,
                center,
                zoomAmount
              )[1],
            }))
          )
        );
        dispatch(
          CanvasActions.zoomValidatorLens({
            center: cameraCoordinate,
            zoomAmount,
          })
        );
        dispatch(
          CanvasActions.setLines(
            attachableLines.map((line) => ({
              ...line,
              x1: Draw.mouseCenteredZoom(
                [line.x1, line.y1],
                center,
                zoomAmount
              )[0],
              x2: Draw.mouseCenteredZoom(
                [line.x2, line.y2],
                center,
                zoomAmount
              )[0],
              y1: Draw.mouseCenteredZoom(
                [line.x1, line.y1],
                center,
                zoomAmount
              )[1],
              y2: Draw.mouseCenteredZoom(
                [line.x2, line.y2],
                center,
                zoomAmount
              )[1],
              width: line.width * zoomAmount,

              attachNodeOne: {
                ...line.attachNodeOne,
                center: Draw.zoomCircle(
                  line.attachNodeOne.center,
                  line.attachNodeOne.radius,
                  center,
                  zoomAmount
                )[0],
                radius: Draw.zoomCircle(
                  line.attachNodeOne.center,
                  line.attachNodeOne.radius,
                  center,
                  zoomAmount
                )[1],
              },
              attachNodeTwo: {
                ...line.attachNodeTwo,
                center: Draw.zoomCircle(
                  line.attachNodeTwo.center,
                  line.attachNodeTwo.radius,
                  center,
                  zoomAmount
                )[0],
                radius: Draw.zoomCircle(
                  line.attachNodeTwo.center,
                  line.attachNodeTwo.radius,
                  center,
                  zoomAmount
                )[1],
              },
            }))
          )
        );
        dispatch(
          CanvasActions.zoomMaxPoints({
            center: cameraCoordinate,
            zoomAmount,
          })
        );

        dispatch(
          CanvasActions.zoomPencilCoordinates({
            center: cameraCoordinate,
            zoomAmount,
          })
        );
      } else {
        const newOffsetX = event.deltaX * 0.5;
        const newOffsetY = event.deltaY * 0.5;

        offsetX.current = newOffsetX;
        offsetY.current = newOffsetY;
        const shift: [number, number] = [newOffsetX, newOffsetY];

        dispatch(CanvasActions.shiftCamera({ shift }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attachableLines, canvasRef, circles, cameraCoordinate]
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // needs to be an imperative event listener to set passive to false
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, handleWheel]);
};
