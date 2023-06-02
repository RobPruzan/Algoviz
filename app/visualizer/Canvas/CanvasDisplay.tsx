import { Button } from '@/components/ui/button';
import React, { EventHandler, useEffect, useRef, useState } from 'react';

type Props = {};

type CanvasNode = {
  x: number;
  y: number;
  radius: number;
  value?: number;
  color?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const CanvasDisplay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<CanvasNode[]>([]);

  const addCircle = () => {
    const newCircle: CanvasNode = {
      x: Math.random() * 400, // Assuming canvas size is 400
      y: Math.random() * 400,
      radius: 50,
    };

    newCircle.boundingBox = {
      x: newCircle.x - newCircle.radius,
      y: newCircle.y - newCircle.radius,
      width: newCircle.radius * 2,
      height: newCircle.radius * 2,
    };

    setCircles((prevCircles) => [...prevCircles, newCircle]);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    circles.some((circle) => {
      if (!circle.boundingBox) return false;
      if (
        x >= circle.boundingBox.x &&
        x <= circle.boundingBox.x + circle.boundingBox.width &&
        y >= circle.boundingBox.y &&
        y <= circle.boundingBox.y + circle.boundingBox.height
      ) {
        console.log(circle);
        return true; // stop iteration after first circle is found
      }
      return false;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Make the canvas high resolution
    const scale = window.devicePixelRatio;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    canvas.width = canvas.width * scale;
    canvas.height = canvas.height * scale;
    ctx.scale(scale, scale);

    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  }, [circles]);

  return (
    <>
      <button onClick={addCircle}>Add Circle</button>
      <canvas ref={canvasRef} onClick={handleClick} width={400} height={400} />
    </>
  );
};

export default CanvasDisplay;
