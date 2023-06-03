'use client';
import { Circle, Line } from '@/lib/types';
import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import * as Canvas from '@/lib/canvas';
const CircleApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLineID, setSelectedLineID] = useState<string | null>(null);

  const handleUpdateCircles = (newCircle: Circle) => {
    setCircles((prev) =>
      Canvas.replaceCircle({
        oldArray: prev,
        newCircle,
      })
    );
  };

  const handleAddLine = () => {
    const newLine: Line = {
      center: [Math.random() * 400, Math.random() * 400],
      id: crypto.randomUUID(),
      length: 50,
      width: 5,
      color: 'white',
    };

    setLines((prevLines) => [...prevLines, newLine]);
  };

  const addCircle = () => {
    const newCircle: Circle = {
      x: Math.random() * 400,
      y: Math.random() * 400,
      radius: 50,
      color: 'red',
      id: crypto.randomUUID(),
      boundingBox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };

    newCircle.boundingBox = {
      x: newCircle.x - newCircle.radius,
      y: newCircle.y - newCircle.radius,
      width: newCircle.radius * 2,
      height: newCircle.radius * 2,
    };

    setCircles((prevCircles) => [...prevCircles, newCircle]);
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const activeCircleId = Canvas.getActiveCircle({
      circles,
      event,
      canvasRef,
    });
    if (!activeCircleId) return;
    const activeCircle = circles.find((circle) => circle.id === activeCircleId);
    if (!activeCircle) return;
    setSelectedCircleID(activeCircleId);

    const newCircle: Circle = {
      ...activeCircle,
      color: 'white',
    };

    handleUpdateCircles(newCircle);
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const activeCircle = circles.find(
      (circle) => circle.id === selectedCircleID
    );
    if (!activeCircle) return;
    const mousePositionX = event.nativeEvent.offsetX;
    const mousePositionY = event.nativeEvent.offsetY;

    const newCircle: Circle = {
      ...activeCircle,
      x: mousePositionX,
      y: mousePositionY,
    };
    handleUpdateCircles(newCircle);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;
    console.log('adding ahh');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = circle.color;
      ctx.fill();
    });
    lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.center[0], line.center[1]);
      ctx.lineTo(line.center[0], line.center[1] - line.length);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.stroke();
    });
  }, [circles, lines]);

  return (
    <>
      <button onClick={addCircle}>Add Circle</button>
      <button onClick={handleAddLine}>Add Circle</button>

      <canvas
        className="bg-fancy"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={() => {
          const activeCircle = circles.find(
            (circle) => circle.id === selectedCircleID
          );
          if (!activeCircle) return;
          handleUpdateCircles({
            ...activeCircle,
            color: 'red',
          });
          setSelectedCircleID(null);
          console.log('up');
        }}
        width={750}
        height={500}
      />
    </>
  );
};

export default CircleApp;
