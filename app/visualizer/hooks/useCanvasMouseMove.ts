import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, {
  Dispatch,
  MouseEvent,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useRef,
} from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import {
  CircleReceiver,
  Edge,
  NodeReceiver,
  PencilCoordinates,
  SelectBox,
  SelectedAttachableLine,
  SelectedGeometryInfo,
} from '@/lib/types';
import { match } from 'ts-pattern';
import { CanvasActions } from '@/redux/slices/canvasSlice';

type UseCanvasMouseMoveProps = {
  isMouseDownRef: MutableRefObject<boolean>;
  selectBox: SelectBox | null;
  setSelectBox: Dispatch<SetStateAction<SelectBox | null>>;
  selectedControlBarAction: 'pencil' | null;

  setPencilCoordinates: React.Dispatch<React.SetStateAction<PencilCoordinates>>;
  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
};

export const useCanvasMouseMove = ({
  setPencilCoordinates,
  isMouseDownRef,
  selectBox,
  selectedControlBarAction,
  setSelectBox,
  selectedCircleID,
  selectedAttachableLine,
}: UseCanvasMouseMoveProps) => {
  const { attachableLines, circles, selectedGeometryInfo } = useAppSelector(
    (store) => store.canvas
  );

  const previousMousePositionRef = useRef<[number, number]>();
  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.size ?? -1) > 0;
  const dispatch = useAppDispatch();

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const mousePositionX = event.nativeEvent.offsetX;
    const mousePositionY = event.nativeEvent.offsetY;

    // if (selectedControlBarAction === 'pencil')
    match(selectedControlBarAction)
      .with('pencil', () => {
        if (isMouseDownRef.current) {
          setPencilCoordinates((prev) => ({
            ...prev,
            drawingCoordinates: [
              ...prev.drawingCoordinates,
              [mousePositionX, mousePositionY],
            ],
          }));
        }
      })
      .otherwise(() => {
        const activeTask = Canvas.getActiveGeometry({
          selectedCircleID,
          selectedAttachableLine,
          selectedGeometryInfo,
        });
        const prevPos = previousMousePositionRef.current ?? [
          mousePositionX,
          mousePositionY,
        ];

        const shift: [number, number] = [
          prevPos[0] - event.nativeEvent.offsetX,
          prevPos[1] - event.nativeEvent.offsetY,
        ];
        // this should be a case obviously just doing this for quick measures
        if (isSelectBoxSet && isMouseDownRef.current) {
          // const updatedCircles: CircleReceiver[] = circles.map((circle) => {
          //   const shiftedCircle = Canvas.shiftCircle({ circle, shift });
          //   if (selectedGeometryInfo.selectedIds.has(circle.id)) {
          //     return {
          //       ...shiftedCircle,
          //       nodeReceiver: {
          //         ...shiftedCircle.nodeReceiver,
          //         attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
          //           selectedGeometryInfo.selectedIds.has(id)
          //         ),
          //       },
          //     };
          //   } else {
          //     return {
          //       ...circle,
          //       nodeReceiver: {
          //         ...circle.nodeReceiver,
          //         attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
          //           selectedGeometryInfo.selectedIds.has(id)
          //         ),
          //       },
          //     };
          //   }
          // });
          dispatch(
            CanvasActions.shiftCircles({
              selectedGeometryInfo,
              shift,
            })
          );
          dispatch(CanvasActions.shiftLines({ shift }));
          // dispatch this
          // const updatedLines: Edge[] = attachableLines.map((line) => {
          //   if (
          //     selectedGeometryInfo.selectedIds.has(line.id) ||
          //     selectedGeometryInfo.selectedIds.has(line.attachNodeOne.id) ||
          //     selectedGeometryInfo.selectedIds.has(line.attachNodeTwo.id)
          //   ) {
          //     const nodeOneConnectedToId =
          //       line.attachNodeOne.connectedToId &&
          //       selectedGeometryInfo.selectedIds.has(
          //         line.attachNodeOne.connectedToId
          //       )
          //         ? line.attachNodeOne.connectedToId
          //         : null;

          //     const nodeTwoConnectedToId =
          //       line.attachNodeTwo.connectedToId &&
          //       selectedGeometryInfo.selectedIds.has(
          //         line.attachNodeTwo.connectedToId
          //       )
          //         ? line.attachNodeTwo.connectedToId
          //         : null;
          //     // need to deduplicate this
          //     const shiftedLine = Canvas.shiftLine({ line, shift });
          //     const newLine: Edge = {
          //       ...shiftedLine,
          //       attachNodeOne: {
          //         ...shiftedLine.attachNodeOne,
          //         connectedToId: nodeOneConnectedToId,
          //       },
          //       attachNodeTwo: {
          //         ...shiftedLine.attachNodeTwo,
          //         connectedToId: nodeTwoConnectedToId,
          //       },
          //     };

          //     return newLine;
          //   }
          //   return line;
          // });
          // weird behavior when moving quick because of circles, need to investigate latter
          // setSelectedGeometryInfo(
          //   Canvas.shiftSelectBox({ selectedGeometryInfo, shift })
          // );
          // dispatch(CanvasActions.setCircles(updatedCircles));
          dispatch(CanvasActions.shiftSelectBox({ shift }));
          // dispatch(CanvasActions.setLines(updatedLines));
          previousMousePositionRef.current = [mousePositionX, mousePositionY];
          return;
        }

        switch (activeTask) {
          case 'circle':
            const activeCircle = circles.find(
              (circle) => circle.id === selectedCircleID
            );
            if (!activeCircle) return;

            const nodeOneConnectedLine = Canvas.getLineAttachedToNodeReciever({
              attachableLines,
              activeCircle,
              nodeConnectedSide: 'one',
            });
            const nodeTwoConnectedLine = Canvas.getLineAttachedToNodeReciever({
              attachableLines,
              activeCircle,
              nodeConnectedSide: 'two',
            });

            const newCircle: CircleReceiver = {
              ...activeCircle,
              center: [
                activeCircle.nodeReceiver.center[0] - shift[0],
                activeCircle.nodeReceiver.center[1] - shift[1],
              ],
              nodeReceiver: {
                ...activeCircle.nodeReceiver,
                center: [
                  activeCircle.nodeReceiver.center[0] - shift[0],
                  activeCircle.nodeReceiver.center[1] - shift[1],
                ],
              },
            };
            if (nodeOneConnectedLine) {
              const newAttachedLine = Canvas.builtUpdatedAttachedLine({
                circleReciever: newCircle,
                currentLine: nodeOneConnectedLine,
                nodeRecieverType: 'one',
              });

              dispatch(CanvasActions.replaceAttachableLine(newAttachedLine));
            }
            if (nodeTwoConnectedLine) {
              const newAttachedLine = Canvas.builtUpdatedAttachedLine({
                circleReciever: newCircle,
                currentLine: nodeTwoConnectedLine,
                nodeRecieverType: 'two',
              });
              dispatch(CanvasActions.replaceAttachableLine(newAttachedLine));
            }

            dispatch(CanvasActions.replaceCircle(newCircle));
            break;
          case 'line':
            const activeRect = attachableLines.find(
              (rect) => rect.id === selectedAttachableLine?.id
            );

            if (!activeRect) return;

            const newRect: Edge = {
              ...activeRect,
              x1: activeRect.x1 - shift[0],
              y1: activeRect.y1 - shift[1],
              x2: activeRect.x2 - shift[0],
              y2: activeRect.y2 - shift[1],
              attachNodeOne: {
                ...activeRect.attachNodeOne,
                connectedToId: null,
                center: [activeRect.x1 - shift[0], activeRect.y1 - shift[1]],
              },
              attachNodeTwo: {
                ...activeRect.attachNodeTwo,
                connectedToId: null,
                center: [activeRect.x2 - shift[0], activeRect.y2 - shift[1]],
              },
            };
            const filteredCircles = circles.map((circle) => {
              return {
                ...circle,
                nodeReceiver: {
                  ...circle.nodeReceiver,
                  attachedIds: circle.nodeReceiver.attachedIds.filter(
                    (id) =>
                      !(id === activeRect.attachNodeOne.id) &&
                      !(id === activeRect.attachNodeTwo.id)
                  ),
                },
              };
            });

            dispatch(CanvasActions.setCircles(filteredCircles));
            dispatch(CanvasActions.replaceAttachableLine(newRect));
            break;
          case 'node1':
            const activeRectContainingNodeOne = attachableLines.find(
              (rect) => rect.attachNodeOne.id === selectedAttachableLine?.id
            );
            if (!activeRectContainingNodeOne) return;

            const newRectContainingNodeOne: Edge = {
              ...activeRectContainingNodeOne,
              x1: mousePositionX,
              y1: mousePositionY,
              attachNodeOne: {
                ...activeRectContainingNodeOne.attachNodeOne,
                center: [mousePositionX, mousePositionY],
              },
            };

            const intersectingCircleOne =
              Canvas.findConnectorIntersectingConnector({
                circle: activeRectContainingNodeOne.attachNodeOne,
                circles: circles.map((c) => c.nodeReceiver),
              });

            if (intersectingCircleOne) {
              newRectContainingNodeOne.x1 = intersectingCircleOne.center[0];
              newRectContainingNodeOne.y1 = intersectingCircleOne.center[1];
              newRectContainingNodeOne.attachNodeOne.center = [
                newRectContainingNodeOne.x1,
                newRectContainingNodeOne.y1,
              ];

              newRectContainingNodeOne.attachNodeOne.connectedToId =
                intersectingCircleOne.id;

              const newIntersectingCircleOne: NodeReceiver = {
                ...intersectingCircleOne,
                attachedIds: Canvas.concatIdUniquely(
                  activeRectContainingNodeOne.attachNodeOne.id,
                  intersectingCircleOne.attachedIds
                ),
              };
              const nodeRecieverContainerOne = circles.find(
                (c) => c.nodeReceiver.id === newIntersectingCircleOne.id
              );

              nodeRecieverContainerOne &&
                dispatch(
                  CanvasActions.replaceCircle({
                    ...nodeRecieverContainerOne,
                    nodeReceiver: newIntersectingCircleOne,
                  })
                );
            }

            dispatch(
              CanvasActions.replaceAttachableLine(newRectContainingNodeOne)
            );
            break;
          case 'node2':
            const activeRectContainingNodeTwo = attachableLines.find(
              (rect) => rect.attachNodeTwo.id === selectedAttachableLine?.id
            );
            if (!activeRectContainingNodeTwo) return;
            const newRectContainingNodeTwo: Edge = {
              ...activeRectContainingNodeTwo,
              x2: mousePositionX,
              y2: mousePositionY,
              attachNodeTwo: {
                ...activeRectContainingNodeTwo.attachNodeTwo,
                center: [mousePositionX, mousePositionY],
              },
            };

            const intersectingCircleTwo =
              Canvas.findConnectorIntersectingConnector({
                circle: activeRectContainingNodeTwo.attachNodeTwo,
                circles: circles.map((c) => c.nodeReceiver),
              });

            if (intersectingCircleTwo) {
              newRectContainingNodeTwo.x2 = intersectingCircleTwo.center[0];
              newRectContainingNodeTwo.y2 = intersectingCircleTwo.center[1];
              newRectContainingNodeTwo.attachNodeTwo.center = [
                newRectContainingNodeTwo.x2,
                newRectContainingNodeTwo.y2,
              ];

              newRectContainingNodeTwo.attachNodeTwo.connectedToId =
                intersectingCircleTwo.id;

              const newIntersectingCircleTwo: NodeReceiver = {
                ...intersectingCircleTwo,
                attachedIds: Canvas.concatIdUniquely(
                  activeRectContainingNodeTwo.attachNodeTwo.id,
                  intersectingCircleTwo.attachedIds
                ),
              };
              const nodeConnectorContainerTwo = circles.find(
                (c) => c.nodeReceiver.id === newIntersectingCircleTwo.id
              );

              nodeConnectorContainerTwo &&
                dispatch(
                  CanvasActions.replaceCircle({
                    ...nodeConnectorContainerTwo,
                    nodeReceiver: newIntersectingCircleTwo,
                  })
                );
            }
            dispatch(
              CanvasActions.replaceAttachableLine(newRectContainingNodeTwo)
            );
            break;
          default:
            if (selectBox) {
              const adjustableCord: [number, number] = [
                event.nativeEvent.offsetX,
                event.nativeEvent.offsetY,
              ];

              // simple check to make sure we have a select box first
              setSelectBox((prev) => {
                const selectedGeometryInfo = Canvas.getSelectedGeometry({
                  edges: attachableLines,
                  vertices: circles,
                  selectBox: prev?.p1 ? { ...prev, p2: adjustableCord } : null,
                });

                // setSelectedGeometryInfo(selectedGeometryInfo);
                dispatch(
                  CanvasActions.setSelectedGeometryInfo(selectedGeometryInfo)
                );
                return prev?.p1 ? { ...prev, p2: adjustableCord } : null;
              });
            }
            break;
        }
        previousMousePositionRef.current = [
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY,
        ];
      });
  };

  return handleMouseMove;
};
