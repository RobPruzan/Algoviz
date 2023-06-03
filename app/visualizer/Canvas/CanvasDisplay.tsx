'use client';
import { AttachableLine, Circle, Rect } from '@/lib/types';
import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import * as Canvas from '@/lib/canvas';
import { Button } from '@/components/ui/button';
const CircleApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);

  const [attachableLines, setAttachableLines] = useState<AttachableLine[]>([]);
  const [selectedAttachableLine, setSelectedAttachableLine] = useState<{
    id: string;
    selected: 'line' | 'node1' | 'node2';
  } | null>(null);

  const handleUpdateCircles = (newCircle: Circle) => {
    setCircles((prev) =>
      Canvas.replaceCanvasElement({
        oldArray: prev,
        newElement: newCircle,
      })
    );
  };
  const handleUpdateRects = (newRect: AttachableLine) => {
    setAttachableLines((prev) =>
      Canvas.replaceCanvasElement({
        oldArray: prev,
        newElement: newRect,
      })
    );
  };

  const handleAddRect = () => {
    const [x1, y1] = [Math.random() * 400, Math.random() * 400];
    const newLine: AttachableLine = {
      id: crypto.randomUUID(),
      type: 'rect',
      // center: [Math.random() * 400, Math.random() * 400],
      x1,
      y1,
      x2: x1 - 10,
      y2: y1 - 50,
      width: 5,
      color: 'white',
      attachNodeOne: {
        center: [x1, y1],
        radius: 5,
        color: 'blue',
        id: crypto.randomUUID(),
        type: 'node1',
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 5,
        color: 'blue',
        id: crypto.randomUUID(),
        type: 'node2',
      },
    };

    setAttachableLines((prevLines) => [...prevLines, newLine]);
  };

  const handleAddCircle = () => {
    const circleCenter: [number, number] = [
      Math.random() * 400,
      Math.random() * 400,
    ];
    const circleRadius = 50;
    const newNodeConnector: Circle['nodeConnector'] = {
      id: crypto.randomUUID(),
      center: circleCenter,
      radius: circleRadius / 5,
      color: 'blue',
      type: 'circle',
    };
    const newCircle: Circle = {
      id: crypto.randomUUID(),
      type: 'circle',
      center: circleCenter,
      radius: circleRadius,
      color: 'red',
      nodeConnector: newNodeConnector,
    };

    setCircles((prevCircles) => [...prevCircles, newCircle]);
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const activeCircleId = Canvas.getActiveCircle({
      circles,
      event,
      canvasRef,
    });
    const activeRectID = Canvas.getActiveRect({
      canvasRef,
      event,
      rects: attachableLines,
    });

    const activeSelectableNodeOneId = Canvas.getActiveCircle({
      canvasRef,
      event,
      circles: attachableLines.map((line) => line.attachNodeOne),
    });

    const activeSelectableNodeTwoId = Canvas.getActiveCircle({
      canvasRef,
      event,
      circles: attachableLines.map((line) => line.attachNodeTwo),
    });

    if (
      !activeCircleId &&
      !activeRectID &&
      !activeSelectableNodeOneId &&
      !activeSelectableNodeTwoId
    )
      return;
    const activeCircle = circles.find((circle) => circle.id === activeCircleId);
    const activeRect = attachableLines.find((line) => line.id === activeRectID);
    const activeSelectNodeOne = attachableLines.find(
      (line) => line.attachNodeOne.id === activeSelectableNodeOneId
    )?.attachNodeOne;
    const activeSelectNodeTwo = attachableLines.find(
      (line) => line.attachNodeTwo.id === activeSelectableNodeTwoId
    )?.attachNodeTwo;

    const activeItem =
      activeSelectNodeOne || activeSelectNodeTwo || activeCircle || activeRect;

    switch (activeItem?.type) {
      case 'circle':
        if (!activeCircle) return;
        setSelectedCircleID(activeCircle.id);

        const newCircle: Circle = {
          ...activeCircle,
          color: 'white',
        };

        handleUpdateCircles(newCircle);
        break;
      case 'rect':
        if (!activeRect) return;

        setSelectedAttachableLine({ id: activeRect.id, selected: 'line' });

        const newRect: AttachableLine = {
          ...activeRect,
          color: 'gray',
        };
        handleUpdateRects(newRect);

        break;
      case 'node1':
        if (!activeSelectNodeOne) return;
        const activeRectContainerOne = attachableLines.find(
          (line) => line.attachNodeOne.id === activeSelectNodeOne.id
        );
        if (!activeRectContainerOne) return;
        setSelectedAttachableLine({
          id: activeSelectNodeOne.id,
          selected: 'node1',
        });
        const newRectContainerOne: AttachableLine = {
          ...activeRectContainerOne,
          attachNodeOne: {
            ...activeRectContainerOne.attachNodeOne,
            color: 'orange',
          },
        };

        handleUpdateRects(newRectContainerOne);
        break;
      case 'node2':
        if (!activeSelectNodeTwo) return;
        const activeRectContainerTwo = attachableLines.find(
          (line) => line.attachNodeTwo.id === activeSelectNodeTwo.id
        );
        if (!activeRectContainerTwo) return;
        setSelectedAttachableLine({
          id: activeSelectNodeTwo.id,
          selected: 'node2',
        });
        const newRectContainerTwo: AttachableLine = {
          ...activeRectContainerTwo,
          attachNodeTwo: {
            ...activeRectContainerTwo.attachNodeTwo,
            color: 'orange',
          },
        };
        handleUpdateRects(newRectContainerTwo);
      default:
        break;
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const mousePositionX = event.nativeEvent.offsetX;
    const mousePositionY = event.nativeEvent.offsetY;

    const activeTask =
      selectedCircleID === null
        ? selectedAttachableLine === null
          ? null
          : selectedAttachableLine.selected
        : 'circle';
    switch (activeTask) {
      case 'circle':
        const activeCircle = circles.find(
          (circle) => circle.id === selectedCircleID
        );
        if (!activeCircle) return;

        const newCircle: Circle = {
          ...activeCircle,
          center: [mousePositionX, mousePositionY],
          nodeConnector: {
            ...activeCircle.nodeConnector,
            center: [mousePositionX, mousePositionY],
          },
        };
        handleUpdateCircles(newCircle);
        break;
      case 'line':
        const activeRect = attachableLines.find(
          (rect) => rect.id === selectedAttachableLine?.id
        );
        if (!activeRect) return;
        const newRect: AttachableLine = {
          ...activeRect,
          // center: [mousePositionX, mousePositionY],
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
        handleUpdateRects(newRect);
        break;
      case 'node1':
        const activeRectContainingNodeOne = attachableLines.find(
          (rect) => rect.attachNodeOne.id === selectedAttachableLine?.id
        );
        if (!activeRectContainingNodeOne) return;

        const newRectContainingNodeOne: AttachableLine = {
          ...activeRectContainingNodeOne,
          x1: mousePositionX,
          y1: mousePositionY,
          attachNodeOne: {
            ...activeRectContainingNodeOne.attachNodeOne,
            center: [mousePositionX, mousePositionY],
          },
        };

        const intersectingCircleOne = Canvas.findCircleIntersectingCircle({
          circle: activeRectContainingNodeOne.attachNodeOne,
          circles: circles.map((c) => c.nodeConnector),
        });

        if (intersectingCircleOne) {
          newRectContainingNodeOne.x1 = intersectingCircleOne.center[0];
          newRectContainingNodeOne.y1 = intersectingCircleOne.center[1];
          newRectContainingNodeOne.attachNodeOne.center = [
            newRectContainingNodeOne.x1,
            newRectContainingNodeOne.y1,
          ];
        }

        handleUpdateRects(newRectContainingNodeOne);
        // if you select the node, you expect the node to expand/move
        // you also expect the attach behavior with the circle nodes
        // you also expect the line to move with it
        break;
      case 'node2':
        const activeRectContainingNodeTwo = attachableLines.find(
          (rect) => rect.attachNodeTwo.id === selectedAttachableLine?.id
        );
        if (!activeRectContainingNodeTwo) return;
        const newRectContainingNodeTwo: AttachableLine = {
          ...activeRectContainingNodeTwo,
          x2: mousePositionX,
          y2: mousePositionY,
          attachNodeTwo: {
            ...activeRectContainingNodeTwo.attachNodeTwo,
            center: [mousePositionX, mousePositionY],
          },
        };

        const intersectingCircleTwo = Canvas.findCircleIntersectingCircle({
          circle: activeRectContainingNodeTwo.attachNodeTwo,
          circles: circles.map((c) => c.nodeConnector),
        });

        if (intersectingCircleTwo) {
          newRectContainingNodeTwo.x2 = intersectingCircleTwo.center[0];
          newRectContainingNodeTwo.y2 = intersectingCircleTwo.center[1];
          newRectContainingNodeTwo.attachNodeTwo.center = [
            newRectContainingNodeTwo.x2,
            newRectContainingNodeTwo.y2,
          ];
        }
        handleUpdateRects(newRectContainingNodeTwo);
        // if you select the node, you expect the node to expand/move
        // you also expect the attach behavior with the circle nodes
        // you also expect the line to move with it
        break;
      default:
        break;
    }
  };

  const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    const activeCircle = circles.find(
      (circle) => circle.id === selectedCircleID
    );

    const activeRect =
      selectedAttachableLine?.selected === 'line'
        ? attachableLines.find((rect) => rect.id === selectedAttachableLine?.id)
        : null;

    const activeRectContainerOne =
      selectedAttachableLine?.selected === 'node1'
        ? attachableLines.find(
            (rect) => rect.attachNodeOne.id === selectedAttachableLine?.id
          )
        : null;
    const activeRectContainerTwo =
      selectedAttachableLine?.selected === 'node2'
        ? attachableLines.find(
            (rect) => rect.attachNodeTwo.id === selectedAttachableLine?.id
          )
        : null;

    const activeAttachNodeOne = activeRectContainerOne?.attachNodeOne;
    const activeAttachNodeTwo = activeRectContainerTwo?.attachNodeTwo;
    const activeItem =
      activeCircle || activeRect || activeAttachNodeOne || activeAttachNodeTwo;

    if (!activeItem) return;

    switch (activeItem?.type) {
      case 'circle':
        if (!activeCircle) return;
        handleUpdateCircles({
          ...activeCircle,
          color: 'red',
        });
        setSelectedCircleID(null);
        break;
      case 'rect':
        if (!activeRect) return;
        handleUpdateRects({
          ...activeRect,
          color: 'white',
        });
        setSelectedAttachableLine(null);
        break;
      case 'node1':
        if (!activeRectContainerOne) return;
        handleUpdateRects({
          ...activeRectContainerOne,
          // color: 'blue',
          attachNodeOne: {
            ...activeRectContainerOne.attachNodeOne,
            color: 'blue',
          },
        });
        setSelectedAttachableLine(null);
      default:
        if (!activeRectContainerTwo) return;
        handleUpdateRects({
          ...activeRectContainerTwo,
          attachNodeTwo: {
            ...activeRectContainerTwo.attachNodeTwo,
            color: 'blue',
          },
        });
        setSelectedAttachableLine(null);
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;
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
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.stroke();
    });

    attachableLines
      .map((line) => line.attachNodeOne)
      .forEach((circle) => {
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
    attachableLines
      .map((line) => line.attachNodeTwo)
      .forEach((circle) => {
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

    circles.forEach((circle) => {
      const nodeConnector = circle.nodeConnector;
      ctx.beginPath();
      ctx.arc(
        nodeConnector.center[0],
        nodeConnector.center[1],
        nodeConnector.radius,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = nodeConnector.color;
      ctx.fill();
    });
  }, [circles, attachableLines]);

  return (
    <>
      <Button className="bg-secondary" onClick={handleAddCircle}>
        Add Circle
      </Button>
      <Button className="bg-secondary" onClick={handleAddRect}>
        Add Line
      </Button>

      <canvas
        className="bg-fancy"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        width={2000}
        height={2000}
      />
    </>
  );
};

export default CircleApp;
