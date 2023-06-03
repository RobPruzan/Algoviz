'use client';
import { Circle, Rect } from '@/lib/types';
import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import * as Canvas from '@/lib/canvas';
import { Button } from '@/components/ui/button';
const CircleApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);

  const [rects, setRects] = useState<Rect[]>([]);
  const [selectedRectID, setSelectedRectID] = useState<string | null>(null);

  const activeTask =
    selectedCircleID === null
      ? selectedRectID === null
        ? null
        : 'line'
      : 'circle';

  const handleUpdateCircles = (newCircle: Circle) => {
    setCircles((prev) =>
      Canvas.replaceCanvasElement({
        oldArray: prev,
        newElement: newCircle,
      })
    );
  };
  const handleUpdateRects = (newRect: Rect) => {
    setRects((prev) =>
      Canvas.replaceCanvasElement({
        oldArray: prev,
        newElement: newRect,
      })
    );
  };

  const handleAddRect = () => {
    const newLine: Rect = {
      id: crypto.randomUUID(),
      type: 'rect',
      center: [Math.random() * 400, Math.random() * 400],
      length: 50,
      width: 5,
      color: 'white',
    };

    setRects((prevLines) => [...prevLines, newLine]);
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
      rects,
    });

    if (!activeCircleId && !activeRectID) return;
    const activeCircle = circles.find((circle) => circle.id === activeCircleId);
    const activeRect = rects.find((line) => line.id === activeRectID);
    const activeItem = activeCircle || activeRect;
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
        setSelectedRectID(activeRect.id);

        const newRect: Rect = {
          ...activeRect,
          color: 'gray',
        };
        handleUpdateRects(newRect);

        break;
      default:
        break;
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const mousePositionX = event.nativeEvent.offsetX;
    const mousePositionY = event.nativeEvent.offsetY;
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
        const activeRect = rects.find((rect) => rect.id === selectedRectID);
        if (!activeRect) return;
        const newRect: Rect = {
          ...activeRect,
          center: [mousePositionX, mousePositionY],
        };
        handleUpdateRects(newRect);
        break;
      default:
        break;
    }
  };

  const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    const activeCircle = circles.find(
      (circle) => circle.id === selectedCircleID
    );
    const activeRect = rects.find((rect) => rect.id === selectedRectID);
    if (!activeCircle && !activeRect) return;
    const activeItem = activeCircle || activeRect;

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
        setSelectedRectID(null);
        break;
      default:
        break;
    }

    console.log('up');
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
    rects.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.center[0], line.center[1] - line.length / 2);
      ctx.lineTo(line.center[0], line.center[1] + line.length / 2);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.stroke();
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
  }, [circles, rects]);

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
        width={900}
        height={800}
      />
    </>
  );
};

export default CircleApp;
