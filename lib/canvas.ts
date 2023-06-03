import { Circle, Rect } from './types';
import { type MouseEvent } from 'react';
export const replaceCanvasElement = <T extends { id: string }>({
  oldArray,
  newElement: newCircle,
}: {
  oldArray: T[];
  newElement: T;
}) => {
  const newId = newCircle.id;
  const newArray = oldArray.filter((circle) => circle.id !== newId);
  newArray.push(newCircle);
  return newArray;
};

export const getActiveCircle = ({
  event,
  canvasRef,
  circles,
}: {
  event: MouseEvent<HTMLCanvasElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  circles: Circle[];
}) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const activeCircleIndex = circles.find((circle) =>
    isPointInCircle(x, y, circle.x, circle.y, circle.radius)
  );

  return activeCircleIndex?.id;
};

export const isPointInCircle = (
  px: number,
  py: number,
  x: number,
  y: number,
  radius: number
) => {
  const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
  return distance <= radius;
};

export const isPointInRect = (
  px: number,
  py: number,
  center: [number, number],
  width: number,
  height: number
) => {
  const [x, y] = center;
  const xMin = x - width / 2;
  const xMax = x + width / 2;
  const yMin = y - height / 2;
  const yMax = y + height / 2;
  return px >= xMin && px <= xMax && py >= yMin && py <= yMax;
};

export const getActiveRect = ({
  event,
  canvasRef,
  rects,
}: {
  event: MouseEvent<HTMLCanvasElement>;

  canvasRef: React.RefObject<HTMLCanvasElement>;
  rects: Rect[];
}) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const activeLineIndex = rects.find((rect) =>
    isPointInRect(x, y, rect.center, rect.width, rect.length)
  );

  return activeLineIndex?.id;
};
