import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, {
  Dispatch,
  MouseEvent,
  MutableRefObject,
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
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
} from '@/lib/types';
import { match } from 'ts-pattern';
import {
  CanvasActions,
  Meta,
  ValidatorLensInfo,
} from '@/redux/slices/canvasSlice';
import { CollaborationActions } from '@/redux/slices/colloborationState';
type UseCanvasMouseMoveProps = {
  isMouseDownRef: MutableRefObject<boolean>;
  selectBox: SelectBox | null;
  setSelectBox: Dispatch<SetStateAction<SelectBox | null>>;
  selectedControlBarAction: 'pencil' | null;

  setPencilCoordinates: React.Dispatch<React.SetStateAction<PencilCoordinates>>;
  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
  meta: Meta;
  selectedValidatorLens: SelectedValidatorLens | null;
  selectedResizeValidatorLensCircle: SelectedValidatorLensResizeCircle | null;
};

export const useCanvasMouseMove = ({
  setPencilCoordinates,
  isMouseDownRef,
  selectBox,
  selectedControlBarAction,
  setSelectBox,
  selectedCircleID,
  selectedAttachableLine,
  meta,
  selectedValidatorLens,
  selectedResizeValidatorLensCircle,
}: UseCanvasMouseMoveProps) => {
  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas);

  const previousMousePositionRef = useRef<[number, number]>();
  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.length ?? -1) > 0;
  const dispatch = useAppDispatch();

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const mousePositionX = event.nativeEvent.offsetX;
    const mousePositionY = event.nativeEvent.offsetY;
    dispatch(
      CollaborationActions.setUserMousePosition(
        {
          mousePosition: [mousePositionX, mousePositionY],
          user: {
            id: meta.userID,
          },
        },
        meta
      )
    );

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
          selectedValidatorLens,
          selectedResizeValidatorLensCircle,
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
          dispatch(
            CanvasActions.shiftCircles(
              {
                selectedGeometryInfo,
                shift,
              },
              meta
            )
          );
          dispatch(CanvasActions.shiftLines({ shift }, meta));
          dispatch(CanvasActions.shiftSelectBox({ shift }, meta));
          previousMousePositionRef.current = [mousePositionX, mousePositionY];
          return;
        }

        switch (activeTask) {
          case 'bottom-left':
          case 'bottom-right':
          case 'top-left':
          case 'top-right':
            const lens = validatorLensContainer.find(
              (lens) => selectedResizeValidatorLensCircle?.id === lens.id
            );
            if (!lens) return;
            dispatch(
              CanvasActions.resizeValidatorLens({
                lens,
                mousePos: [mousePositionX, mousePositionY],
                side: activeTask,
              })
            );

          case 'validator-lens':
            const activeLens = validatorLensContainer.find(
              (lens) => lens.id === selectedValidatorLens?.id
            );
            if (!activeLens) return;
            dispatch(
              CanvasActions.shiftValidatorLens(
                { shift, id: activeLens.id },
                meta
              )
            );

            break;
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
            // this needs to be cleaned up
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

              dispatch(
                CanvasActions.replaceAttachableLine(newAttachedLine, meta)
              );
            }
            if (nodeTwoConnectedLine) {
              const newAttachedLine = Canvas.builtUpdatedAttachedLine({
                circleReciever: newCircle,
                currentLine: nodeTwoConnectedLine,
                nodeRecieverType: 'two',
              });
              dispatch(
                CanvasActions.replaceAttachableLine(newAttachedLine, meta)
              );
            }

            dispatch(CanvasActions.replaceCircle(newCircle, meta));

            break;
          case 'line':
            // why am i still normal shifting this??
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

            dispatch(CanvasActions.setCircles(filteredCircles, meta));
            dispatch(CanvasActions.replaceAttachableLine(newRect, meta));
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
                  CanvasActions.replaceCircle(
                    {
                      ...nodeRecieverContainerOne,
                      nodeReceiver: newIntersectingCircleOne,
                    },
                    meta
                  )
                );
            }

            dispatch(
              CanvasActions.replaceAttachableLine(
                newRectContainingNodeOne,
                meta
              )
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
                  CanvasActions.replaceCircle(
                    {
                      ...nodeConnectorContainerTwo,
                      nodeReceiver: newIntersectingCircleTwo,
                    },
                    meta
                  )
                );
            }
            dispatch(
              CanvasActions.replaceAttachableLine(
                newRectContainingNodeTwo,
                meta
              )
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

                dispatch(
                  CanvasActions.setSelectedGeometryInfo(
                    selectedGeometryInfo,
                    meta
                  )
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
