import { Circle } from '@/lib/types';
import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import * as Canvas from '@/lib/canvas';
const CircleApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

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

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      circles.some((circle) => {
        if (
          x >= circle.boundingBox.x &&
          x <= circle.boundingBox.x + circle.boundingBox.width &&
          y >= circle.boundingBox.y &&
          y <= circle.boundingBox.y + circle.boundingBox.height
        ) {
          console.log(circle);
          const newCircle: Circle = {
            ...circle,
            color: 'white',
          };

          setSelectedCircle(circle);
          setCircles((prev) =>
            Canvas.replaceCircle({
              oldArray: prev,
              newCircle,
            })
          );
          return true;
        }
        return false;
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        circles.forEach((circle) => {
          ctx.beginPath();
          ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = circle.color;
          ctx.fill();
        });
      }
    }
  }, [circles]);

  return (
    <>
      <button onClick={addCircle}>Add Circle</button>
      <canvas
        className="bg-fancy"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={() => {
          const selectedCircleId = selectedCircle?.id;
          if (!selectedCircleId) {
            return;
          }
          setCircles((prev) =>
            Canvas.replaceCircle({
              oldArray: prev,
              newCircle: {
                ...selectedCircle,
                color: 'red',
              },
            })
          );

          setSelectedCircle(null);
          console.log('up');
        }}
        width={750}
        height={500}
      />
    </>
  );
};

export default CircleApp;
