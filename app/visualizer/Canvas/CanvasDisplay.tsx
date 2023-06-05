'use client';
import {
  Edge,
  CircleConnector,
  CircleReceiver,
  NodeConnector,
  NodeReceiver,
  Rect,
  SelectedAttachableLine,
} from '@/lib/types';
import React, {
  useRef,
  useState,
  useEffect,
  MouseEvent,
  Dispatch,
  SetStateAction,
} from 'react';
import * as Canvas from '@/lib/canvas';
import * as Graph from '@/lib/canvas';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CanvasDisplay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);

  const previousMousePositionRef = useRef<[number, number]>(); //this will be used for everything down the line to make

  const dispatch = useAppDispatch();
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);

  const [selectedAttachableLine, setSelectedAttachableLine] =
    useState<SelectedAttachableLine | null>(null);
  const adjacencyList = circles.map((c) => [
    c.nodeReceiver.id,
    c.nodeReceiver.attachedIds,
  ]);

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const activeItemInfo = Canvas.getMouseDownActiveItem({
      attachableLines,
      canvasRef,
      circles,
      event,
    });

    switch (activeItemInfo?.activeItem?.type) {
      case 'circle':
        if (!activeItemInfo.activeCircle) return;
        setSelectedCircleID(activeItemInfo.activeCircle.id);

        console.log('circle is:', activeItemInfo.activeCircle.id);

        const newCircle: CircleReceiver = {
          ...activeItemInfo.activeCircle,
          color: 'white',
        };

        dispatch(CanvasActions.replaceCircle(newCircle));
        break;

      case 'rect':
        if (!activeItemInfo.activeRect) return;

        setSelectedAttachableLine({
          id: activeItemInfo.activeRect.id,
          selected: 'line',
        });

        const newRect: Edge = {
          ...activeItemInfo.activeRect,
          color: 'gray',
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
      default:
        break;
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const mousePositionX = event.nativeEvent.offsetX;
    const mousePositionY = event.nativeEvent.offsetY;

    const activeTask = Canvas.getActiveGeometry({
      selectedCircleID,
      selectedAttachableLine,
    });
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
          center: [mousePositionX, mousePositionY],
          nodeReceiver: {
            ...activeCircle.nodeReceiver,
            center: [mousePositionX, mousePositionY],
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
          x1: mousePositionX,
          y1: mousePositionY,
          x2: mousePositionX - 10,
          y2: mousePositionY - 100,
          attachNodeOne: {
            ...activeRect.attachNodeOne,
            center: [mousePositionX, mousePositionY],
          },
          attachNodeTwo: {
            ...activeRect.attachNodeTwo,
            center: [mousePositionX - 10, mousePositionY - 100],
          },
        };
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
        break;
    }
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
    });

    if (!activeItem) return;

    switch (activeItem?.type) {
      case 'circle':
        if (!activeCircle) return;
        dispatch(
          CanvasActions.replaceCircle({
            ...activeCircle,
            color: '#181e2b',
          })
        );
        setSelectedCircleID(null);
        break;
      case 'rect':
        if (!activeRect) return;
        dispatch(
          CanvasActions.replaceAttachableLine({
            ...activeRect,
            color: 'white',
          })
        );
        setSelectedAttachableLine(null);
        break;
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
    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(
        circle.center[0],
        circle.center[1],
        circle.radius,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = circle.color;
      ctx.fill();
    });
    attachableLines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(Math.floor(line.x1), Math.floor(line.y1));
      ctx.lineTo(Math.floor(line.x2), Math.floor(line.y2));
      ctx.strokeStyle = line.color;
      ctx.lineWidth = Math.floor(line.width);
      ctx.stroke();
    });

    attachableLines
      .map((line) => line.attachNodeOne)
      .forEach((circle) => {
        ctx.beginPath();
        ctx.arc(
          Math.floor(circle.center[0]),
          Math.floor(circle.center[1]),
          Math.floor(circle.radius),
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = circle.color;
        ctx.fill();
      });
    attachableLines
      .map((line) => line.attachNodeTwo)
      .forEach((circle) => {
        ctx.beginPath();
        ctx.arc(
          Math.floor(circle.center[0]),
          Math.floor(circle.center[1]),
          circle.radius,
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = circle.color;
        ctx.fill();
      });

    circles.forEach((circle) => {
      const nodeReceiver = circle.nodeReceiver;
      ctx.beginPath();
      ctx.arc(
        Math.floor(nodeReceiver.center[0]),
        Math.floor(nodeReceiver.center[1]),
        Math.floor(nodeReceiver.radius),
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = nodeReceiver.color;
      ctx.fill();
      // set the text style
      ctx.font = '25px Arial'; // change to whatever font style you want
      ctx.fillStyle = 'white'; // text color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw the text
      // This will draw the text in the center of the circle
      var text = circle.value.toString();
      ctx.fillText(
        text,
        Math.floor(circle.center[0]),
        Math.floor(circle.center[1])
      );
    });
  }, [circles, attachableLines]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <canvas
            className="bg-fancy"
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            // temporary, should have its own handler
            onContextMenu={handleMouseDown}
            onMouseUp={handleMouseUp}
            width={2000}
            height={2000}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuItem inset>
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
