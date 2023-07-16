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
  meta: Meta;
};
export const useCanvasWheel = ({ meta, canvasRef }: UseCanvasWheel) => {
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
          canvasRef
        );

        dispatch(CanvasActions.setValidatorLensContainer);
        // this should all be a zoom action

        dispatch(
          CanvasActions.setCircles(
            circles.map((circle) => ({
              ...circle,
              center: Draw.zoomCircle(
                circle.center,
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
            })),
            meta
          )
        );
        dispatch(
          CanvasActions.zoomValidatorLens({
            center,
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
            center,
            zoomAmount,
          })
        );

        // setPencilCoordinates((prev) => ({
        //   drawingCoordinates: prev.drawingCoordinates.map((cords) =>
        //     Draw.mouseCenteredZoom(cords, center, zoomAmount)
        //   ),
        //   drawnCoordinates: prev.drawnCoordinates.map((continuousCords) =>
        //     continuousCords.map((cords) =>
        //       Draw.mouseCenteredZoom(cords, center, zoomAmount)
        //     )
        //   ),
        // }));
        dispatch(CanvasActions.zoomPencilCoordinates({ center, zoomAmount }));
      } else {
        const newOffsetX = event.deltaX * 0.5;
        const newOffsetY = event.deltaY * 0.5;

        offsetX.current = newOffsetX;
        offsetY.current = newOffsetY;
        const shift: [number, number] = [newOffsetX, newOffsetY];
        // now instead we just shift the camera

        dispatch(CanvasActions.shiftCamera({ shift }));
        console.log('circles for example', circles);
        // console.log('cameraCoordinate', cameraCoordinate);
        // dispatch(CanvasActions.shiftValidatorLensContainer({ shift }));
        // dispatch(
        //   CanvasActions.setCircles(
        //     circles.map((circle) => ({
        //       ...circle,
        //       center: [
        //         circle.center[0] - newOffsetX,
        //         circle.center[1] - newOffsetY,
        //       ],
        //       nodeReceiver: {
        //         ...circle.nodeReceiver,
        //         center: [
        //           circle.nodeReceiver.center[0] - newOffsetX,
        //           circle.nodeReceiver.center[1] - newOffsetY,
        //         ],
        //       },
        //     }))
        //   )
        // );
        // dispatch(
        //   CanvasActions.setLines(
        //     attachableLines.map((line) => ({
        //       ...line,
        //       x1: line.x1 - newOffsetX,
        //       x2: line.x2 - newOffsetX,
        //       y1: line.y1 - newOffsetY,
        //       y2: line.y2 - newOffsetY,
        //       attachNodeOne: {
        //         ...line.attachNodeOne,
        //         center: [
        //           line.attachNodeOne.center[0] - newOffsetX,
        //           line.attachNodeOne.center[1] - newOffsetY,
        //         ],
        //       },
        //       attachNodeTwo: {
        //         ...line.attachNodeTwo,
        //         center: [
        //           line.attachNodeTwo.center[0] - newOffsetX,
        //           line.attachNodeTwo.center[1] - newOffsetY,
        //         ],
        //       },
        //     }))
        //   )
        // );
        // dispatch(
        //   CanvasActions.panMaxPoints({
        //     pan: [newOffsetX, newOffsetY],
        //   })
        // );
        // // setPencilCoordinates((prev) => ({
        // //   ...prev,
        // //   drawingCoordinates: prev.drawingCoordinates.map((cord) => [
        // //     cord[0] - newOffsetX,
        // //     cord[1] - newOffsetY,
        // //   ]),
        // //   drawnCoordinates: prev.drawnCoordinates.map((continuousCords) =>
        // //     continuousCords.map((cord) => [
        // //       cord[0] - newOffsetX,
        // //       cord[1] - newOffsetY,
        // //     ])
        // //   ),
        // // }));
        // dispatch(
        //   CanvasActions.panPencilCoordinates(
        //     {
        //       pan: [newOffsetX, newOffsetY],
        //     },
        //     meta
        //   )
        // );
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
