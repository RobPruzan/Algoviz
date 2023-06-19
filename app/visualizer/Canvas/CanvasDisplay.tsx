'use client';

import {
  Edge,
  CircleConnector,
  CircleReceiver,
  NodeReceiver,
  SelectedAttachableLine,
  SelectBox,
  MaxPoints,
  ALGORITHMS,
  DrawTypes,
  PencilCoordinates,
  SelectedGeometryInfo,
} from '@/lib/types';
import { AlgoComboBox, isStringAlgorithm } from '../Sort/AlgoComboBox';
import React, {
  useRef,
  useState,
  useEffect,
  MouseEvent,
  useCallback,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import * as Draw from '@/lib/Canvas/drawUtils';

import * as Graph from '@/lib/Canvas/canvas';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { P, match } from 'ts-pattern';
import { Button } from '@/components/ui/button';
import { Check, Minus, Plus } from 'lucide-react';
import { SideBarContext } from '@/context/SideBarContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { algorithmsInfo, cn } from '@/lib/utils';
import { DFSActions } from '@/redux/slices/dfsSlice';

export type Props = {
  selectedGeometryInfo: SelectedGeometryInfo | null;
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
  canvasWidth: number | '60%';
  handleDfs: () => void;
  selectedControlBarAction: DrawTypes | null;
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;
};

const CanvasDisplay = ({
  selectedGeometryInfo,
  setSelectedGeometryInfo,
  handleDfs,
  selectedControlBarAction,
  setSelectedControlBarAction,
  canvasWidth,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  console.log('viewport width', window.innerWidth);

  const [selectBox, setSelectBox] = useState<SelectBox | null>(null);

  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);
  const [pencilCoordinates, setPencilCoordinates] = useState<PencilCoordinates>(
    {
      drawingCoordinates: [],
      drawnCoordinates: [],
    }
  );

  const previousMousePositionRef = useRef<[number, number]>(); //this will be used for everything down the line to make
  // const { visited } = useAppSelector((store) => store.dfs);
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const dispatch = useAppDispatch();
  const { attachableLines, circles, creationZoomFactor } = useAppSelector(
    (store) => store.canvas
  );

  const isMouseDownRef = useRef(false);
  const offsetX = useRef(0);
  const offsetY = useRef(0);
  const [selectedAttachableLine, setSelectedAttachableLine] =
    useState<SelectedAttachableLine | null>(null);

  const [copied, setCopied] = useState<Set<string>>(new Set());

  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.size ?? -1) > 0;

  const { visited: dfsVisited, visitedPointer } = useAppSelector(
    (store) => store.dfs
  );
  const dfsStore = useAppSelector((store) => store.dfs);

  const [playingAlgorithm, setPlayingAlgorithm] = useState(false);

  const dfsVisitedNodes = dfsVisited.slice(0, visitedPointer);
  // should make all the handlers hooks
  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    const activeItemInfo = Canvas.getMouseDownActiveItem({
      attachableLines,
      canvasRef,
      circles,
      event,
      selectBox,
      selectedControlBarAction,
    });

    if (
      isSelectBoxSet &&
      !Canvas.isPointInRectangle(
        [event.nativeEvent.offsetX, event.nativeEvent.offsetY],
        selectedGeometryInfo.maxPoints.closestToOrigin,
        selectedGeometryInfo.maxPoints.furthestFromOrigin
      )
    ) {
      setSelectedGeometryInfo(null);
      return;
    }

    match(activeItemInfo?.activeItem)
      .with({ type: 'circle' }, (circle) => {
        setSelectedCircleID(circle.id);
      })
      .with({ type: 'rect' }, (rect) => {
        setSelectedAttachableLine({
          id: rect.id,
          selected: 'line',
        });
      })
      .with({ type: 'node1' }, (nodeOne) => {
        const activeRectContainerOne = attachableLines.find(
          (line) => line.attachNodeOne.id === nodeOne.id
        );
        if (!activeRectContainerOne) return;
        setSelectedAttachableLine({
          id: nodeOne.id,
          selected: 'node1',
        });
      })
      .with({ type: 'node2' }, (nodeTwo) => {
        const activeRectContainerTwo = attachableLines.find(
          (line) => line.attachNodeTwo.id === nodeTwo.id
        );
        if (!activeRectContainerTwo) return;
        setSelectedAttachableLine({
          id: nodeTwo.id,
          selected: 'node2',
        });
      })
      .with({ type: 'pencil' }, () => {})

      .otherwise(() => {
        if (selectedGeometryInfo?.selectedIds.size ?? -1 > 0) return;

        // this is just mouse down, so it begins the render of the select box
        const initialMouseCoordinate: [number, number] = [
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY,
        ];
        setSelectBox({
          p1: initialMouseCoordinate,
          p2: initialMouseCoordinate,
          type: 'selectBox',
        });
      });
  };

  const handleContextMenu = (
    event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) => {
    const activeCircleId = Canvas.getActiveCircle({
      circles,
      event,
      canvasRef,
    });

    const activeCircle = circles.find((circle) => circle.id === activeCircleId);

    if (!activeCircle) return;
    setSelectedCircleID(activeCircle.id);
    setSelectedGeometryInfo(null);
  };

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
          const updatedCircles: CircleReceiver[] = circles.map((circle) => {
            const shiftedCircle = Canvas.shiftCircle({ circle, shift });
            if (selectedGeometryInfo.selectedIds.has(circle.id)) {
              return {
                ...shiftedCircle,
                nodeReceiver: {
                  ...shiftedCircle.nodeReceiver,
                  attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
                    selectedGeometryInfo.selectedIds.has(id)
                  ),
                },
              };
            } else {
              return {
                ...circle,
                nodeReceiver: {
                  ...circle.nodeReceiver,
                  attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
                    selectedGeometryInfo.selectedIds.has(id)
                  ),
                },
              };
            }
          });
          // dispatch this
          const updatedLines: Edge[] = attachableLines.map((line) => {
            if (
              selectedGeometryInfo.selectedIds.has(line.id) ||
              selectedGeometryInfo.selectedIds.has(line.attachNodeOne.id) ||
              selectedGeometryInfo.selectedIds.has(line.attachNodeTwo.id)
            ) {
              const nodeOneConnectedToId =
                line.attachNodeOne.connectedToId &&
                selectedGeometryInfo.selectedIds.has(
                  line.attachNodeOne.connectedToId
                )
                  ? line.attachNodeOne.connectedToId
                  : null;

              const nodeTwoConnectedToId =
                line.attachNodeTwo.connectedToId &&
                selectedGeometryInfo.selectedIds.has(
                  line.attachNodeTwo.connectedToId
                )
                  ? line.attachNodeTwo.connectedToId
                  : null;
              // need to deduplicate this
              const shiftedLine = Canvas.shiftLine({ line, shift });
              const newLine: Edge = {
                ...shiftedLine,
                attachNodeOne: {
                  ...shiftedLine.attachNodeOne,
                  connectedToId: nodeOneConnectedToId,
                },
                attachNodeTwo: {
                  ...shiftedLine.attachNodeTwo,
                  connectedToId: nodeTwoConnectedToId,
                },
              };

              return newLine;
            }
            return line;
          });
          // weird behavior when moving quick because of circles, need to investigate latter
          setSelectedGeometryInfo(
            Canvas.shiftSelectBox({ selectedGeometryInfo, shift })
          );
          dispatch(CanvasActions.setCircles(updatedCircles));
          dispatch(CanvasActions.setLines(updatedLines));
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

                setSelectedGeometryInfo(selectedGeometryInfo);
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

  const handleMouseUp = () => {
    const { activeItem } = Canvas.getMouseUpActiveItem({
      attachableLines,
      circles,
      selectedAttachableLine,
      selectedCircleID,
      selectBox,
      selectedControlBarAction,
    });
    isMouseDownRef.current = false;

    match(activeItem)
      .with({ type: 'circle' }, () => {
        setSelectedCircleID(null);
      })
      .with({ type: 'rect' }, () => {
        setSelectedAttachableLine(null);
      })
      .with({ type: 'node1' }, () => {
        setSelectedAttachableLine(null);
      })
      .with({ type: 'pencil' }, () => {
        if (selectedControlBarAction === 'pencil') {
          setPencilCoordinates((prev) => ({
            drawnCoordinates: [
              ...prev.drawnCoordinates,
              prev.drawingCoordinates,
            ],
            drawingCoordinates: [],
          }));
        }
      })
      .otherwise(() => {
        setSelectBox(null);
        setSelectedAttachableLine(null);
      });
  };

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        if (selectedGeometryInfo) {
          dispatch(
            CanvasActions.deleteCircles([
              ...selectedGeometryInfo.selectedIds.keys(),
            ])
          );
          dispatch(
            CanvasActions.deleteLines([
              ...selectedGeometryInfo.selectedIds.keys(),
            ])
          );
        }
        setSelectedGeometryInfo(null);
      }
    };

    document.addEventListener('keydown', handleDelete);

    return () => document.removeEventListener('keydown', handleDelete);
  }, [dispatch, selectedGeometryInfo, setSelectedGeometryInfo]);
  // pls clean up future me
  function zoomCircle(
    center: [number, number],
    radius: number,
    target: [number, number],
    zoomFactor: number
  ): [[number, number], number] {
    // Translate to origin
    let translatedCenter: [number, number] = [
      center[0] - target[0],
      center[1] - target[1],
    ];

    // Scale
    let scaledCenter: [number, number] = [
      translatedCenter[0] * zoomFactor,
      translatedCenter[1] * zoomFactor,
    ];
    let scaledRadius: number = radius * zoomFactor;

    // Translate back
    let newCenter: [number, number] = [
      scaledCenter[0] + target[0],
      scaledCenter[1] + target[1],
    ];

    return [newCenter, scaledRadius];
  }

  function zoomLine(
    center: [number, number],
    target: [number, number],
    zoomFactor: number
  ): [number, number] {
    // Translate to origin
    let translatedCenter: [number, number] = [
      center[0] - target[0],
      center[1] - target[1],
    ];

    // Scale
    let scaledCenter: [number, number] = [
      translatedCenter[0] * zoomFactor,
      translatedCenter[1] * zoomFactor,
    ];

    // Translate back
    let newCenter: [number, number] = [
      scaledCenter[0] + target[0],
      scaledCenter[1] + target[1],
    ];

    return newCenter;
  }

  function getCursorPosition(event: WheelEvent): [number, number] {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
  }

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      // this is going to look awful and will 100% be refactored when everything works, no point in making something clean that might not work
      if (event.ctrlKey) {
        // This is a pinch gesture
        const zoomAmount = event.deltaY > 0 ? 0.98 : 1.02;
        dispatch(CanvasActions.updateCreationZoomFactor(zoomAmount));
        const center: [number, number] = getCursorPosition(event);

        // should make a helper function for translations totallllyyy
        dispatch(
          CanvasActions.setCircles(
            circles.map((circle) => ({
              ...circle,
              center: zoomCircle(
                circle.center,
                circle.radius,
                center,
                zoomAmount
              )[0],
              nodeReceiver: {
                ...circle.nodeReceiver,
                center: zoomCircle(
                  circle.nodeReceiver.center,
                  circle.nodeReceiver.radius,
                  center,
                  zoomAmount
                )[0],
                radius: zoomCircle(
                  circle.nodeReceiver.center,
                  circle.nodeReceiver.radius,
                  center,
                  zoomAmount
                )[1],
              },
              radius: zoomCircle(
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
              x1: zoomLine([line.x1, line.y1], center, zoomAmount)[0],
              x2: zoomLine([line.x2, line.y2], center, zoomAmount)[0],
              y1: zoomLine([line.x1, line.y1], center, zoomAmount)[1],
              y2: zoomLine([line.x2, line.y2], center, zoomAmount)[1],
              width: line.width * zoomAmount,
              // x1: line.x1 * zoomAmount,
              // y1: line.y1 * zoomAmount,
              // x2: line.x2 * zoomAmount,
              // y2: line.y2 * zoomAmount,

              attachNodeOne: {
                ...line.attachNodeOne,
                center: zoomCircle(
                  line.attachNodeOne.center,
                  line.attachNodeOne.radius,
                  center,
                  zoomAmount
                )[0],
                radius: zoomCircle(
                  line.attachNodeOne.center,
                  line.attachNodeOne.radius,
                  center,
                  zoomAmount
                )[1],
              },
              attachNodeTwo: {
                ...line.attachNodeTwo,
                center: zoomCircle(
                  line.attachNodeTwo.center,
                  line.attachNodeTwo.radius,
                  center,
                  zoomAmount
                )[0],
                radius: zoomCircle(
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
                  closestToOrigin: zoomLine(
                    geoInfo.maxPoints.closestToOrigin,
                    center,
                    zoomAmount
                  ),
                  furthestFromOrigin: zoomLine(
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
            zoomLine(cords, center, zoomAmount)
          ),
          drawnCoordinates: prev.drawnCoordinates.map((continuousCords) =>
            continuousCords.map((cords) => zoomLine(cords, center, zoomAmount))
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
    [attachableLines, circles, dispatch, setSelectedGeometryInfo]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    console.log('applying');
    let intervalId: NodeJS.Timeout | null = null;
    setInterval(() => {
      if (playingAlgorithm) {
        console.log('calling', dfsVisited.length, dfsStore);

        if (dfsStore.visitedPointer < dfsStore.visited.length) {
          dispatch(DFSActions.incrementVisitedPointer());
          console.log('balling', dfsStore);
        } else {
          intervalId && clearInterval(intervalId);
          setPlayingAlgorithm(false);
        }
      }
    }, 1000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dfsStore, dfsVisited.length, dispatch, playingAlgorithm]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key === 'Escape') {
      setSelectedGeometryInfo(null);
    }
    e;
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedGeometryInfo) {
      setCopied(selectedGeometryInfo.selectedIds);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // can refactor cause this is pretty heavy
      // should build helper functions for updating, since I'm doing this so much, but it may be an over abstraction
      const idMap = new Map<string, string>();
      circles
        .filter((circle) => copied.has(circle.id))
        .forEach((circle) => {
          idMap.set(circle.id, crypto.randomUUID());
          idMap.set(circle.nodeReceiver.id, crypto.randomUUID());
          circle.nodeReceiver.attachedIds.forEach((id) =>
            idMap.set(id, crypto.randomUUID())
          );
          // idMap.set(, crypto.randomUUID())
        });

      attachableLines
        .filter((line) => copied.has(line.id))
        .forEach((line) => {
          idMap.set(line.id, crypto.randomUUID());
          idMap.set(line.attachNodeOne.id, crypto.randomUUID());
          idMap.set(line.attachNodeTwo.id, crypto.randomUUID());
          line.attachNodeOne.connectedToId &&
            idMap.set(line.attachNodeOne.connectedToId, crypto.randomUUID());
          line.attachNodeTwo.connectedToId &&
            idMap.set(line.attachNodeTwo.connectedToId, crypto.randomUUID());
        });

      //  should design this without asserting non null, but for now its fine
      const offset = 20;
      const pasteCircles: CircleReceiver[] = circles
        .filter((circle) => copied.has(circle.id))
        .map((circle) => ({
          ...circle,
          id: idMap.get(circle.id)!,
          center: [circle.center[0] - offset, circle.center[1] - offset],
          nodeReceiver: {
            ...circle.nodeReceiver,
            id: idMap.get(circle.nodeReceiver.id)!,
            attachedIds: circle.nodeReceiver.attachedIds.map(
              (id) => idMap.get(id)!
            ),
            center: [
              circle.nodeReceiver.center[0] - offset,
              circle.nodeReceiver.center[1] - offset,
            ],
          },
        }));
      const pasteLines: Edge[] = attachableLines
        .filter((line) => copied.has(line.id))
        .map((line) => ({
          ...line,
          id: idMap.get(line.id)!,
          x1: line.x1 - offset,
          y1: line.y1 - offset,
          x2: line.x2 - offset,
          y2: line.y2 - offset,
          attachNodeOne: {
            ...line.attachNodeOne,
            id: idMap.get(line.attachNodeOne.id)!,
            connectedToId: line.attachNodeOne.connectedToId
              ? idMap.get(line.attachNodeOne.connectedToId)!
              : null,
            center: [
              line.attachNodeOne.center[0] - offset,
              line.attachNodeOne.center[1] - offset,
            ],
          },
          attachNodeTwo: {
            ...line.attachNodeTwo,
            id: idMap.get(line.attachNodeTwo.id)!,
            connectedToId: line.attachNodeTwo.connectedToId
              ? idMap.get(line.attachNodeTwo.connectedToId)!
              : null,
            center: [
              line.attachNodeTwo.center[0] - offset,
              line.attachNodeTwo.center[1] - offset,
            ],
          },
        }));

      setSelectedGeometryInfo((geo) =>
        geo
          ? {
              ...geo,

              selectedIds: new Set<string>(
                [...geo.selectedIds.keys()].map((id) => idMap.get(id)!)
              ),
              // still need to update selected box
              maxPoints: {
                closestToOrigin: [
                  geo.maxPoints.closestToOrigin[0] - offset,
                  geo.maxPoints.closestToOrigin[1] - offset,
                ],
                furthestFromOrigin: [
                  geo.maxPoints.furthestFromOrigin[0] - offset,
                  geo.maxPoints.furthestFromOrigin[1] - offset,
                ],
              },
            }
          : null
      );

      dispatch(CanvasActions.setCircles([...circles, ...pasteCircles]));
      dispatch(CanvasActions.setLines([...attachableLines, ...pasteLines]));
    }
  };
  const intervalId = useRef<null | NodeJS.Timer>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;

    Draw.optimizeCanvas({
      ctx,
      canvas,
    });

    if (selectedGeometryInfo?.maxPoints) {
      Draw.drawBox({
        ctx,
        box: {
          p1: selectedGeometryInfo?.maxPoints.closestToOrigin,
          p2: selectedGeometryInfo?.maxPoints.furthestFromOrigin,
        },
      });
    }
    // first written, first rendered
    // meaning items written later will layer over the previous

    Draw.drawNodes({
      ctx,
      nodes: circles,
      selectedCircleID,
      selectedIds: selectedGeometryInfo?.selectedIds,
      dfsVisitedNodes,
    });

    if (selectBox) {
      Draw.drawBox({
        ctx,
        box: selectBox,
        fill: true,
      });
    }

    Draw.drawEdges({
      ctx,
      edges: attachableLines,
      selectedIds: selectedGeometryInfo?.selectedIds,
      selectedAttachableLine,
    });

    Draw.drawEdgeConnectors({
      ctx,
      edges: attachableLines,
    });

    Draw.drawNodeReceivers({
      ctx,
      nodes: circles,
    });

    // for whatever reason this is wrapping the node reciever in a ring, need to determine why :/
    // i guess canvas could be a ref inside the ref
    if (pencilCoordinates) {
      Draw.drawPencil({
        ctx,
        pencilCoordinates,
      });
    }
  }, [
    circles,
    attachableLines,
    selectBox,
    selectedCircleID,
    selectedAttachableLine,
    selectedGeometryInfo?.selectedIds,
    selectedGeometryInfo?.maxPoints,
    dfsVisitedNodes,
    pencilCoordinates,
  ]);

  return (
    <>
      <ContextMenu>
        <ContextMenu>
          <ContextMenuTrigger>
            <canvas
              className={`
              ${selectedControlBarAction === 'pencil' ? 'cursor-crosshair' : ''}
               bg-fancy `}
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              tabIndex={-1}
              onContextMenu={handleContextMenu}
              onMouseUp={handleMouseUp}
              width={window.innerWidth}
              onKeyDown={handleKeyDown}
              height={window.innerHeight}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem
              onClick={(e) => {
                if (selectedCircleID) {
                  dispatch(CanvasActions.deleteCircle(selectedCircleID));

                  setSelectedCircleID(null);
                }
              }}
              inset
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                // need to create new lines
                // need to attach them to every circle
                // double loup'e it
                const visited = new Set<string>();
                const selectedCircles = circles.filter((circle) =>
                  selectedGeometryInfo?.selectedIds.has(circle.id)
                );
                for (const circleA of selectedCircles) {
                  for (const circleB of selectedCircles) {
                    const storeCircleA = circles.find(
                      (circle) => circle.id == circleA.id
                    );
                    const storeCircleB = circles.find(
                      (circle) => circle.id == circleB.id
                    );
                    if (!storeCircleA || !storeCircleB) {
                      throw new Error('Something is wrong with the store');
                    }
                    if (
                      visited.has(storeCircleA.id + storeCircleB.id) ||
                      visited.has(storeCircleB.id + storeCircleA.id) ||
                      storeCircleB.id == storeCircleA.id
                    ) {
                      continue;
                    }
                    // create new line to connect circles
                    // reciever only ends up with one new connector node attached
                    const [x1, y1] = storeCircleA.center;
                    const [x2, y2] = storeCircleB.center;
                    const newLine: Edge = {
                      x1,
                      y1,
                      x2,
                      y2,
                      id: crypto.randomUUID(),
                      type: 'rect',
                      width: 7 * creationZoomFactor,
                      directed: false,
                      color: 'white',
                      attachNodeOne: {
                        center: [x1, y1],
                        radius: 10 * creationZoomFactor,
                        color: '#42506e',
                        id: crypto.randomUUID(),
                        type: 'node1',
                        connectedToId: storeCircleA.nodeReceiver.id,
                      },
                      attachNodeTwo: {
                        center: [x2, y2],
                        radius: 10 * creationZoomFactor,
                        color: '#42506e',
                        id: crypto.randomUUID(),
                        type: 'node2',
                        connectedToId: storeCircleB.nodeReceiver.id,
                      },
                    };
                    dispatch(
                      CanvasActions.attachNodeToReciever({
                        circleId: storeCircleA.id,
                        attachId: newLine.attachNodeOne.id,
                      })
                    );
                    dispatch(
                      CanvasActions.attachNodeToReciever({
                        circleId: storeCircleB.id,
                        attachId: newLine.attachNodeTwo.id,
                      })
                    );
                    dispatch(CanvasActions.addLine(newLine));
                    visited.add(storeCircleA.id + storeCircleB.id);
                    visited.add(storeCircleB.id + storeCircleA.id);
                    setSelectedGeometryInfo((prev) =>
                      prev
                        ? {
                            ...prev,
                            selectedIds: new Set([
                              ...prev.selectedIds,
                              newLine.id,
                              newLine.attachNodeOne.id,
                              newLine.attachNodeTwo.id,
                            ]),
                          }
                        : null
                    );
                  }
                }
                setSelectedGeometryInfo(null);
              }}
              inset
            >
              Fully Connect Nodes
            </ContextMenuItem>

            <ContextMenuSub>
              <ContextMenuSubTrigger inset>Algorithms</ContextMenuSubTrigger>
              <ContextMenuSubContent className=" ">
                <Command>
                  <CommandInput placeholder="Search Sorting Algorithm..." />
                  <CommandEmpty>No algorithm found.</CommandEmpty>
                  <CommandGroup>
                    {algorithmsInfo.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        onSelect={(currentValue) => {
                          if (!isStringAlgorithm(currentValue)) return;
                          // setValue(currentValue === value ? '' : currentValue);
                          setSideBarState((prev) => ({
                            ...prev,
                            algorithm: currentValue,
                          }));
                          // setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            sideBarState.algorithm === framework.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
                <Button
                  // onClick={() => {
                  // handleDfs();
                  // dispatch(DFSActions.resetVisitedPointer());
                  //   intervalId.current = setInterval(() => {
                  //     console.log('calling', dfsVisited.length, visitedPointer);
                  //     if (visitedPointer < dfsVisited.length) {
                  //       dispatch(DFSActions.incrementVisitedPointer());
                  //     } else {
                  //       intervalId.current && clearInterval(intervalId.current);
                  //     }
                  //   }, 1000);
                  // }}
                  className="bg-secondary mt-3 ring-0 hover:bg-primary hover:border hover:border-secondary w-full"
                >
                  Apply algorithm
                </Button>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>

        <ContextMenuTrigger></ContextMenuTrigger>
      </ContextMenu>
    </>
  );
};

export default CanvasDisplay;
