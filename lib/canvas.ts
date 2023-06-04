import { P } from 'ts-pattern';
import {
  Edge,
  CircleConnector,
  CircleReceiver,
  LineNodeTaggedUnion,
  NodeConnector,
  NodeReceiver,
  Rect,
} from './types';
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
  circles: (CircleConnector | CircleReceiver | NodeConnector)[];
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
  width,
}: {
  px: number;
  py: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
}) => {
  let lineLengthSquared = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
  let crossProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
  let factor = crossProduct / lineLengthSquared;

  let closestPoint;

  if (factor < 0) {
    closestPoint = { x: x1, y: y1 };
  } else if (factor > 1) {
    closestPoint = { x: x2, y: y2 };
  } else {
    closestPoint = {
      x: x1 + factor * (x2 - x1),
      y: y1 + factor * (y2 - y1),
    };
  }

  let dx = px - closestPoint.x;
  let dy = py - closestPoint.y;

  let distanceSquared = dx * dx + dy * dy;

  return distanceSquared <= Math.pow(width, 2);
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
      width: rect.width,
    })
  );

  return activeLineIndex?.id;
};

export const findRectIntersectingCircle = ({
  circles,
  rect,
}: {
  rect: Rect;
  circles: (CircleConnector | NodeConnector)[];
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

export const findConnectorIntersectingConnector = <
  T extends NodeConnector | NodeReceiver,
  D extends NodeConnector | NodeReceiver
>({
  circle,
  circles,
}: {
  circle: T;
  circles: D[];
}): D | undefined =>
  circles.find((c) =>
    isPointInCircle(
      circle.center[0],
      circle.center[1],
      c.center[0],
      c.center[1],
      c.radius
    )
  );

export const concatIdUniquely = <TItem extends string>(
  itemId: TItem,
  items: TItem[]
) => {
  const filteredArray = items.filter((i) => i != itemId);
  filteredArray.push(itemId);
  return filteredArray;
};

export const getActiveGeometry = ({
  selectedCircleID,
  selectedAttachableLine,
}: {
  selectedCircleID: string | null;
  selectedAttachableLine: {
    id: string;
    selected: 'line' | 'node1' | 'node2';
  } | null;
}) => {
  if (selectedCircleID !== null) {
    return 'circle';
  }
  return selectedAttachableLine?.selected;
};

export const getLineAttachedToNodeReciever = <T extends 'one' | 'two'>({
  activeCircle,
  attachableLines,
  nodeConnectedSide,
}: {
  attachableLines: Edge[];
  activeCircle: CircleReceiver;
  nodeConnectedSide: T;
}): (Edge & { nodeConnectedSide: T }) | undefined => {
  switch (nodeConnectedSide) {
    case 'one':
      const connectedToNodeOneContainer = attachableLines.find((line) =>
        activeCircle.nodeReceiver.attachedIds.some(
          (id) => id === line.attachNodeOne.id
        )
      );
      if (connectedToNodeOneContainer) {
        return {
          nodeConnectedSide,
          ...connectedToNodeOneContainer,
        };
      }

      break;
    case 'two':
      const connectedToNodeTwoContainer = attachableLines.find((line) =>
        activeCircle.nodeReceiver.attachedIds.some(
          (id) => id === line.attachNodeTwo.id
        )
      );
      if (connectedToNodeTwoContainer) {
        return {
          nodeConnectedSide,
          ...connectedToNodeTwoContainer,
        };
      }

      break;
  }
};

export const builtUpdatedAttachedLine = ({
  circleReciever,
  currentLine,
  nodeRecieverType,
}: {
  currentLine: Edge;
  circleReciever: CircleReceiver;
  nodeRecieverType: 'one' | 'two';
}): Edge => {
  if (nodeRecieverType === 'one') {
    return {
      ...currentLine,
      x1: circleReciever.center[0],
      y1: circleReciever.center[1],
      attachNodeOne: {
        ...currentLine.attachNodeOne,
        center: circleReciever.center,
      },
    };
  } else {
    return {
      ...currentLine,
      x2: circleReciever.center[0],
      y2: circleReciever.center[1],
      attachNodeTwo: {
        ...currentLine.attachNodeTwo,
        center: circleReciever.center,
      },
    };
  }
};
