'use client';
import {
  Edge,
  CircleConnector,
  CircleReceiver,
  NodeReceiver,
  SelectedAttachableLine,
  SelectBox,
  MaxPoints,
} from '@/lib/types';
import React, {
  useRef,
  useState,
  useEffect,
  MouseEvent,
  useCallback,
} from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import * as Graph from '@/lib/Canvas/canvas';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import {
  ContextMenu,
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
import { P } from 'ts-pattern';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

const CanvasDisplay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectBox, setSelectBox] = useState<SelectBox | null>(null);

  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);

  const previousMousePositionRef = useRef<[number, number]>(); //this will be used for everything down the line to make
  const { visited } = useAppSelector((store) => store.dfs);

  const dispatch = useAppDispatch();
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);

  const isMouseDownRef = useRef(false);
  const offsetX = useRef(0);
  const offsetY = useRef(0);
  const [selectedAttachableLine, setSelectedAttachableLine] =
    useState<SelectedAttachableLine | null>(null);

  const [copied, setCopied] = useState<Set<string>>(new Set());

  const [selectedGeometryInfo, setSelectedGeometryInfo] = useState<{
    selectedIds: Set<string>;
    maxPoints: MaxPoints;
  } | null>(null);
  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.size ?? -1) > 0;

  const { visited: dfsVisited, visitedPointer } = useAppSelector(
    (store) => store.dfs
  );

  const dfsVisitedNodes = dfsVisited.slice(0, visitedPointer);

  console.log(visited, visitedPointer, visited.slice(0, visitedPointer));

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    const activeItemInfo = Canvas.getMouseDownActiveItem({
      attachableLines,
      canvasRef,
      circles,
      event,
      selectBox,
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

    switch (activeItemInfo?.activeItem?.type) {
      case 'circle':
        if (!activeItemInfo.activeCircle) return;
        setSelectedCircleID(activeItemInfo.activeCircle.id);

        break;

      case 'rect':
        if (!activeItemInfo.activeRect) return;

        setSelectedAttachableLine({
          id: activeItemInfo.activeRect.id,
          selected: 'line',
        });

        const newRect: Edge = {
          ...activeItemInfo.activeRect,
          // color: 'gray',
        };
        dispatch(CanvasActions.replaceAttachableLine(newRect));
        break;

      case 'node1':
        if (!activeItemInfo.activeSelectNodeOne) return;
        const activeRectContainerOne = attachableLines.find(
          (line) =>
            line.attachNodeOne.id === activeItemInfo.activeSelectNodeOne?.id
        );
        if (!activeRectContainerOne) return;
        setSelectedAttachableLine({
          id: activeItemInfo.activeSelectNodeOne.id,
          selected: 'node1',
        });
        const newRectContainerOne: Edge = {
          ...activeRectContainerOne,
          attachNodeOne: {
            ...activeRectContainerOne.attachNodeOne,
            color: '#1c356b',
          },
        };
        dispatch(CanvasActions.replaceAttachableLine(newRectContainerOne));
        break;

      case 'node2':
        if (!activeItemInfo.activeSelectNodeTwo) return;
        const activeRectContainerTwo = attachableLines.find(
          (line) =>
            line.attachNodeTwo.id === activeItemInfo.activeSelectNodeTwo?.id
        );
        if (!activeRectContainerTwo) return;
        setSelectedAttachableLine({
          id: activeItemInfo.activeSelectNodeTwo.id,
          selected: 'node2',
        });
        const newRectContainerTwo: Edge = {
          ...activeRectContainerTwo,
          attachNodeTwo: {
            ...activeRectContainerTwo.attachNodeTwo,
            color: '#1c356b',
          },
        };
        dispatch(CanvasActions.replaceAttachableLine(newRectContainerTwo));
        break;
      default:
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

        break;
    }
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
        if (selectedGeometryInfo.selectedIds.has(circle.id)) {
          return {
            ...circle,
            center: [circle.center[0] - shift[0], circle.center[1] - shift[1]],
            nodeReceiver: {
              ...circle.nodeReceiver,
              attachedIds: circle.nodeReceiver.attachedIds.filter((id) =>
                selectedGeometryInfo.selectedIds.has(id)
              ),

              center: [
                circle.nodeReceiver.center[0] - shift[0],
                circle.nodeReceiver.center[1] - shift[1],
              ],
            },
          };
        }
        // the circle isn't selected but it has stuff that is, then break the link
        return {
          ...circle,
          nodeReceiver: {
            ...circle.nodeReceiver,
            attachedIds: circle.nodeReceiver.attachedIds.filter(
              (id) => !selectedGeometryInfo.selectedIds.has(id)
            ),
          },
        };
      });
      // dispatch this
      const updatedLines: Edge[] = attachableLines.map((line) => {
        if (
          selectedGeometryInfo.selectedIds.has(line.id) ||
          selectedGeometryInfo.selectedIds.has(line.attachNodeOne.id) ||
          selectedGeometryInfo.selectedIds.has(line.attachNodeTwo.id)
        ) {
          // need to deduplicate this
          const newLine: Edge = {
            ...line,
            x1: line.x1 - shift[0],
            y1: line.y1 - shift[1],
            x2: line.x2 - shift[0],
            y2: line.y2 - shift[1],
            attachNodeOne: {
              ...line.attachNodeOne,
              center: [
                line.attachNodeOne.center[0] - shift[0],
                line.attachNodeOne.center[1] - shift[1],
              ],
              connectedToId:
                line.attachNodeOne.connectedToId &&
                selectedGeometryInfo.selectedIds.has(
                  line.attachNodeOne.connectedToId
                )
                  ? line.attachNodeOne.connectedToId
                  : null,
            },
            attachNodeTwo: {
              ...line.attachNodeTwo,
              center: [
                line.attachNodeTwo.center[0] - shift[0],
                line.attachNodeTwo.center[1] - shift[1],
              ],
              connectedToId:
                line.attachNodeTwo.connectedToId &&
                selectedGeometryInfo.selectedIds.has(
                  line.attachNodeTwo.connectedToId
                )
                  ? line.attachNodeTwo.connectedToId
                  : null,
            },
          };
          return newLine;
        }
        return line;
      });
      const newSelectBox: {
        selectedIds: Set<string>;
        maxPoints: MaxPoints;
      } = {
        ...selectedGeometryInfo,
        maxPoints: {
          closestToOrigin: [
            selectedGeometryInfo.maxPoints.closestToOrigin[0] - shift[0],
            selectedGeometryInfo.maxPoints.closestToOrigin[1] - shift[1],
          ],
          furthestFromOrigin: [
            selectedGeometryInfo.maxPoints.furthestFromOrigin[0] - shift[0],
            selectedGeometryInfo.maxPoints.furthestFromOrigin[1] - shift[1],
          ],
        },
      };

      setSelectedGeometryInfo(newSelectBox);
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

        const intersectingCircleOne = Canvas.findConnectorIntersectingConnector(
          {
            circle: activeRectContainingNodeOne.attachNodeOne,
            circles: circles.map((c) => c.nodeReceiver),
          }
        );

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

        dispatch(CanvasActions.replaceAttachableLine(newRectContainingNodeOne));
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

        const intersectingCircleTwo = Canvas.findConnectorIntersectingConnector(
          {
            circle: activeRectContainingNodeTwo.attachNodeTwo,
            circles: circles.map((c) => c.nodeReceiver),
          }
        );

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
        dispatch(CanvasActions.replaceAttachableLine(newRectContainingNodeTwo));
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
  };

  const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    const {
      activeAttachNodeOne,
      activeAttachNodeTwo,
      activeCircle,
      activeItem,
      activeRect,
      activeRectContainerOne,
      activeRectContainerTwo,
    } = Canvas.getMouseUpActiveItem({
      attachableLines,
      circles,
      selectedAttachableLine,
      selectedCircleID,
      selectBox,
    });
    isMouseDownRef.current = false;
    if (!activeItem) return;

    switch (activeItem?.type) {
      case 'circle':
        if (!activeCircle) return;
        dispatch(
          CanvasActions.replaceCircle({
            ...activeCircle,
            // color: '#181e2b',
          })
        );
        setSelectedCircleID(null);
      // break;
      case 'rect':
        if (!activeRect) return;
        dispatch(
          CanvasActions.replaceAttachableLine({
            ...activeRect,
            color: 'white',
          })
        );
        setSelectedAttachableLine(null);
      // break;
      case 'node1':
        if (!activeRectContainerOne) return;
        dispatch(
          CanvasActions.replaceAttachableLine({
            ...activeRectContainerOne,
            // color: 'blue',
            attachNodeOne: {
              ...activeRectContainerOne.attachNodeOne,
              color: '#42506e',
            },
          })
        );
        setSelectedAttachableLine(null);
      default:
        setSelectBox(null);

        if (!activeRectContainerTwo) return;
        dispatch(
          CanvasActions.replaceAttachableLine({
            ...activeRectContainerTwo,
            attachNodeTwo: {
              ...activeRectContainerTwo.attachNodeTwo,
              color: '#42506e',
            },
          })
        );

        setSelectedAttachableLine(null);

        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;

    Canvas.optimizeCanvas({
      ctx,
      canvas,
    });

    // first written, first rendered
    // meaning items written later will layer over the previous

    Canvas.drawNodes({
      ctx,
      nodes: circles,
      selectedCircleID,
      selectedIds: selectedGeometryInfo?.selectedIds,
      dfsVisitedNodes,
    });
    Canvas.drawEdges({
      ctx,
      edges: attachableLines,
      selectedIds: selectedGeometryInfo?.selectedIds,
      selectedAttachableLine,
    });
    Canvas.drawEdgeConnectors({
      ctx,
      edges: attachableLines,
    });

    Canvas.drawNodeReceivers({
      ctx,
      nodes: circles,
    });

    if (selectBox) {
      Canvas.drawBox({
        ctx,
        box: selectBox,
        fill: true,
      });
    }

    if (selectedGeometryInfo?.maxPoints) {
      Canvas.drawBox({
        ctx,
        box: {
          p1: selectedGeometryInfo?.maxPoints.closestToOrigin,
          p2: selectedGeometryInfo?.maxPoints.furthestFromOrigin,
        },
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
  ]);

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
  }, [dispatch, selectedGeometryInfo]);
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
      } else {
        const newOffsetX = event.deltaX * 0.5;
        const newOffsetY = event.deltaY * 0.5;

        console.log(event.deltaX, event.deltaY);
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
      }
    },
    [attachableLines, circles, dispatch]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      // Clean up the event listener on unmount
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <canvas
            className="bg-fancy"
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onWheel={(e) => e}
            tabIndex={0}
            onContextMenu={handleContextMenu}
            onMouseUp={handleMouseUp}
            width={1000}
            onKeyDown={(e) => {
              console.log('e', e);
              if (
                (e.ctrlKey || e.metaKey) &&
                e.key === 'c' &&
                selectedGeometryInfo
              ) {
                console.log('copying', selectedGeometryInfo.selectedIds);
                setCopied(selectedGeometryInfo.selectedIds);
              }
              if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                console.log('pasting');
                // can refactor cause this is pretty heavy
                // should build helper functions for updating, since I'm doing this so much, but it may be an over abstraction
                const idMap = new Map<string, string>();
                const duplicatedCircles = circles
                  .filter((circle) => copied.has(circle.id))
                  .forEach((circle) => {
                    idMap.set(circle.id, crypto.randomUUID());
                    idMap.set(circle.nodeReceiver.id, crypto.randomUUID());
                    circle.nodeReceiver.attachedIds.forEach((id) =>
                      idMap.set(id, crypto.randomUUID())
                    );
                    // idMap.set(, crypto.randomUUID())
                  });

                const duplicatedLines = attachableLines
                  .filter((line) => copied.has(line.id))
                  .forEach((line) => {
                    idMap.set(line.id, crypto.randomUUID());
                    idMap.set(line.attachNodeOne.id, crypto.randomUUID());
                    idMap.set(line.attachNodeTwo.id, crypto.randomUUID());
                    line.attachNodeOne.connectedToId &&
                      idMap.set(
                        line.attachNodeOne.connectedToId,
                        crypto.randomUUID()
                      );
                    line.attachNodeTwo.connectedToId &&
                      idMap.set(
                        line.attachNodeTwo.connectedToId,
                        crypto.randomUUID()
                      );
                  });
                //  should design this without asserting non null, but for now its fine
                const pasteCircles = circles
                  .filter((circle) => copied.has(circle.id))
                  .map((circle) => ({
                    ...circle,
                    id: idMap.get(circle.id)!,
                    nodeReceiver: {
                      ...circle.nodeReceiver,
                      id: idMap.get(circle.nodeReceiver.id)!,
                      attachedIds: circle.nodeReceiver.attachedIds.map(
                        (id) => idMap.get(id)!
                      ),
                    },
                  }));
                const pasteLines = attachableLines
                  .filter((line) => copied.has(line.id))
                  .map((line) => ({
                    ...line,
                    id: idMap.get(line.id)!,
                    attachNodeOne: {
                      ...line.attachNodeOne,
                      id: idMap.get(line.attachNodeOne.id)!,
                      connectedToId: line.attachNodeOne.connectedToId
                        ? idMap.get(line.attachNodeOne.connectedToId)!
                        : null,
                    },
                    attachNodeTwo: {
                      ...line.attachNodeTwo,
                      id: idMap.get(line.attachNodeTwo.id)!,
                      connectedToId: line.attachNodeTwo.connectedToId
                        ? idMap.get(line.attachNodeTwo.connectedToId)!
                        : null,
                    },
                  }));

                console.log('pasting', duplicatedCircles, duplicatedLines);

                dispatch(
                  CanvasActions.setCircles([...circles, ...pasteCircles])
                );
                dispatch(
                  CanvasActions.setLines([...attachableLines, ...pasteLines])
                );
              }
            }}
            onCopy={() => {
              console.log('copy');
            }}
            onPaste={() => {}}
            // onKeyDown={e => {
            //   if (e.ctrlKey && e.key === 'c') {
            //     selectedGeometryInfo && setCopied([...selectedGeometryInfo.selectedIds.keys()])
            //   }
            //   if ((e.ctrlKey || e.co) && e.key === 'z')
            // }}
            height={700}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
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
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSubTrigger inset>Edit Node</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 p-3 h-24 flex flex-col items-center justify-evenly">
              <Label htmlFor="vertex-input">Update Vertex Value</Label>
              <Input type="number" id="vertex-input" />
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};

export default CanvasDisplay;
