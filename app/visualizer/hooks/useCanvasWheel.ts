import {
  SelectBox,
  SelectedGeometryInfo,
  PencilCoordinates,
  SelectedAttachableLine,
} from '@/lib/types';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  MutableRefObject,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import * as Draw from '@/lib/Canvas/drawUtils';
type UseCanvasWheel = {
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
  setPencilCoordinates: React.Dispatch<React.SetStateAction<PencilCoordinates>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
};
export const useCanvasWheel = ({
  setPencilCoordinates,
  setSelectedGeometryInfo,
  canvasRef,
}: UseCanvasWheel) => {
  const offsetX = useRef(0);
  const offsetY = useRef(0);
  const dispatch = useAppDispatch();
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
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
        // should make a helper function for translations totallllyyy
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
            }))
          )
        );
        dispatch(
          CanvasActions.setLines(
            attachableLines.map((line) => ({
              ...line,
              x1: Draw.zoomLine([line.x1, line.y1], center, zoomAmount)[0],
              x2: Draw.zoomLine([line.x2, line.y2], center, zoomAmount)[0],
              y1: Draw.zoomLine([line.x1, line.y1], center, zoomAmount)[1],
              y2: Draw.zoomLine([line.x2, line.y2], center, zoomAmount)[1],
              width: line.width * zoomAmount,
              // x1: line.x1 * zoomAmount,
              // y1: line.y1 * zoomAmount,
              // x2: line.x2 * zoomAmount,
              // y2: line.y2 * zoomAmount,

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

        setSelectedGeometryInfo((geoInfo) =>
          geoInfo
            ? {
                ...geoInfo,
                maxPoints: {
                  closestToOrigin: Draw.zoomLine(
                    geoInfo.maxPoints.closestToOrigin,
                    center,
                    zoomAmount
                  ),
                  furthestFromOrigin: Draw.zoomLine(
                    geoInfo.maxPoints.furthestFromOrigin,
                    center,
                    zoomAmount
                  ),
                },
              }
            : null
        );

        setPencilCoordinates((prev) => ({
          drawingCoordinates: prev.drawingCoordinates.map((cords) =>
            Draw.zoomLine(cords, center, zoomAmount)
          ),
          drawnCoordinates: prev.drawnCoordinates.map((continuousCords) =>
            continuousCords.map((cords) =>
              Draw.zoomLine(cords, center, zoomAmount)
            )
          ),
        }));
      } else {
        const newOffsetX = event.deltaX * 0.5;
        const newOffsetY = event.deltaY * 0.5;

        offsetX.current = newOffsetX;
        offsetY.current = newOffsetY;
        // should make a helper function for translations totallllyyy
        dispatch(
          CanvasActions.setCircles(
            circles.map((circle) => ({
              ...circle,
              center: [
                circle.center[0] - newOffsetX,
                circle.center[1] - newOffsetY,
              ],
              nodeReceiver: {
                ...circle.nodeReceiver,
                center: [
                  circle.nodeReceiver.center[0] - newOffsetX,
                  circle.nodeReceiver.center[1] - newOffsetY,
                ],
              },
            }))
          )
        );
        dispatch(
          CanvasActions.setLines(
            attachableLines.map((line) => ({
              ...line,
              x1: line.x1 - newOffsetX,
              x2: line.x2 - newOffsetX,
              y1: line.y1 - newOffsetY,
              y2: line.y2 - newOffsetY,
              attachNodeOne: {
                ...line.attachNodeOne,
                center: [
                  line.attachNodeOne.center[0] - newOffsetX,
                  line.attachNodeOne.center[1] - newOffsetY,
                ],
              },
              attachNodeTwo: {
                ...line.attachNodeTwo,
                center: [
                  line.attachNodeTwo.center[0] - newOffsetX,
                  line.attachNodeTwo.center[1] - newOffsetY,
                ],
              },
            }))
          )
        );

        setSelectedGeometryInfo((geoInfo) =>
          geoInfo
            ? {
                ...geoInfo,
                maxPoints: {
                  closestToOrigin: [
                    geoInfo.maxPoints.closestToOrigin[0] - newOffsetX,
                    geoInfo.maxPoints.closestToOrigin[1] - newOffsetY,
                  ],
                  furthestFromOrigin: [
                    geoInfo.maxPoints.furthestFromOrigin[0] - newOffsetX,
                    geoInfo.maxPoints.furthestFromOrigin[1] - newOffsetY,
                  ],
                },
              }
            : null
        );
        setPencilCoordinates((prev) => ({
          ...prev,
          drawingCoordinates: prev.drawingCoordinates.map((cord) => [
            cord[0] - newOffsetX,
            cord[1] - newOffsetY,
          ]),
          drawnCoordinates: prev.drawnCoordinates.map((continuousCords) =>
            continuousCords.map((cord) => [
              cord[0] - newOffsetX,
              cord[1] - newOffsetY,
            ])
          ),
        }));
      }
    },
    [
      attachableLines,
      canvasRef,
      circles,
      dispatch,
      setPencilCoordinates,
      setSelectedGeometryInfo,
    ]
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, handleWheel]);
};
