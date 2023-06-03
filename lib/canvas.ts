import { Circle, NodeConnector, Rect } from './types';
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
  circles: (Circle | NodeConnector)[];
}) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const activeCircleIndex = circles.find((circle) =>
    isPointInCircle(x, y, circle.center[0], circle.center[1], circle.radius)
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

export const isPointInRect = ({
  px,
  py,
  x1,
  x2,
  y1,
  y2,
}: {
  px: number;
  py: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) => {
  if (x1 > x2) [x1, x2] = [x2, x1];
  if (y1 > y2) [y1, y2] = [y2, y1];

  // Check if px is between x1 and x2 and py is between y1 and y2
  return px >= x1 && px <= x2 && py >= y1 && py <= y2;
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
    // isPointInRect(x, y, rect.center, rect.width, rect.length)
    isPointInRect({
      px: x,
      py: y,
      x1: rect.x1,
      x2: rect.x2,
      y1: rect.y1,
      y2: rect.y2,
    })
  );

  return activeLineIndex?.id;
};

export const findRectIntersectingCircle = ({
  circles,
  rect,
}: {
  rect: Rect;
  circles: (Circle | NodeConnector)[];
}) => {
  // get corners and check if point is in circle, can do that with width/height and center
  const corners = [
    [rect.x1, rect.y1],
    [rect.x1 + Math.abs(rect.x1 - rect.x2), rect.y2],
    [rect.x2, rect.y2],
    [rect.x2 + Math.abs(rect.x1 - rect.x2), rect.y1],
  ];

  const intersectingCircle = circles.find((circle) =>
    corners.some(([cx, cy]) =>
      isPointInCircle(cx, cy, circle.center[0], circle.center[1], circle.radius)
    )
  );

  return intersectingCircle;
};

export const findConnectorIntersectingConnector = ({
  circle,
  circles,
}: {
  circle: NodeConnector;
  circles: NodeConnector[];
}) =>
  circles.find((c) =>
    isPointInCircle(
      circle.center[0],
      circle.center[1],
      c.center[0],
      c.center[1],
      c.radius
    )
  );
