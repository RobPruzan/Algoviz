import { P } from 'ts-pattern';
import {
  Edge,
  CircleConnector,
  CircleReceiver,
  LineNodeTaggedUnion,
  NodeConnector,
  NodeReceiver,
  Rect,
  SelectedAttachableLine,
  SelectBox,
} from './types';
import { RefObject, type MouseEvent } from 'react';
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

export const getMouseDownActiveItem = ({
  circles,
  attachableLines,
  canvasRef,
  event,
  selectBox,
}: {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  canvasRef: RefObject<HTMLCanvasElement>;
  event: MouseEvent<HTMLCanvasElement>;
  selectBox: SelectBox | null;
}) => {
  const activeCircleId = getActiveCircle({
    circles,
    event,
    canvasRef,
  });
  const activeRectID = getActiveRect({
    canvasRef,
    event,
    rects: attachableLines,
  });

  const activeSelectableNodeOneId = getActiveCircle({
    canvasRef,
    event,
    circles: attachableLines.map((line) => line.attachNodeOne),
  });

  const activeSelectableNodeTwoId = getActiveCircle({
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
  const isNodeOneAttached =
    activeSelectNodeOne?.id &&
    circles.some((circle) =>
      circle.nodeReceiver.attachedIds.includes(activeSelectNodeOne.id)
    );
  const isNodeTwoAttached =
    activeSelectNodeTwo?.id &&
    circles.some((circle) =>
      circle.nodeReceiver.attachedIds.includes(activeSelectNodeTwo.id)
    );
  // extra attached check is to not select the node selector when attached
  // need to implement delete for this to work properly (or when you remove the connection this logic won't know)
  const activeItem =
    (activeSelectNodeOne && isNodeOneAttached ? null : activeSelectNodeOne) ||
    (activeSelectNodeTwo && isNodeTwoAttached ? null : activeSelectNodeTwo) ||
    activeCircle ||
    activeRect ||
    selectBox;

  return {
    activeItem,
    activeCircle,
    activeRect,
    activeSelectNodeOne,
    activeSelectNodeTwo,
  };
};

export const getMouseUpActiveItem = ({
  attachableLines,
  circles,
  selectedCircleID,
  selectedAttachableLine,
  selectBox,
}: {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
  selectBox: SelectBox | null;
}) => {
  const activeCircle = circles.find((circle) => circle.id === selectedCircleID);

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
    activeCircle ||
    activeRect ||
    activeAttachNodeOne ||
    activeAttachNodeTwo ||
    selectBox;

  return {
    activeItem,
    activeCircle,
    activeRect,
    activeRectContainerOne,
    activeRectContainerTwo,
    activeAttachNodeOne,
    activeAttachNodeTwo,
  };
};

export const drawNodes = ({
  nodes,
  ctx,
}: {
  nodes: CircleReceiver[];
  ctx: CanvasRenderingContext2D;
}) => {
  nodes.forEach((node) => {
    ctx.beginPath();
    ctx.arc(node.center[0], node.center[1], node.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();
  });
};

export const drawEdges = ({
  ctx,
  edges,
}: {
  edges: Edge[];
  ctx: CanvasRenderingContext2D;
}) => {
  edges.forEach((edge) => {
    ctx.beginPath();
    ctx.moveTo(Math.floor(edge.x1), Math.floor(edge.y1));
    ctx.lineTo(Math.floor(edge.x2), Math.floor(edge.y2));
    ctx.strokeStyle = edge.color;
    ctx.lineWidth = Math.floor(edge.width);
    ctx.stroke();
  });
};

export const drawEdgeConnectors = ({
  ctx,
  edges,
}: {
  edges: Edge[];
  ctx: CanvasRenderingContext2D;
}) => {
  edges
    .map((edge) => edge.attachNodeOne)
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
  edges
    .map((edge) => edge.attachNodeTwo)
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
};

export const drawNodeReceivers = ({
  ctx,
  nodes,
}: {
  nodes: CircleReceiver[];
  ctx: CanvasRenderingContext2D;
}) => {
  nodes.forEach((node) => {
    const nodeReceiver = node.nodeReceiver;
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
    // This will draw the text in the center of the node
    var text = node.value.toString();
    ctx.fillText(text, Math.floor(node.center[0]), Math.floor(node.center[1]));
    ctx.canvas.style.zIndex = '100';
  });
};

export const drawSelectBox = ({
  ctx,
  selectBox,
}: {
  selectBox: SelectBox | null;
  ctx: CanvasRenderingContext2D;
}) => {
  if (selectBox) {
    console.log('draw me');
    // ill want the inside highlighted and other interior selected indicator
    ctx.beginPath();
    //* ---
    // |  |
    // ---
    ctx.moveTo(
      Math.floor(selectBox.originCord[0]),
      Math.floor(selectBox.originCord[1])
    );
    ctx.lineTo(
      Math.floor(selectBox.adjustableCord[0]),
      Math.floor(selectBox.originCord[1])
    );
    // ---*
    // |  |
    // ---

    ctx.lineTo(
      Math.floor(selectBox.adjustableCord[0]),
      Math.floor(selectBox.adjustableCord[1])
    );
    // ---
    // |  |
    // ---*

    ctx.lineTo(
      Math.floor(selectBox.originCord[0]),
      Math.floor(selectBox.adjustableCord[1])
    );
    // ---
    // |  |
    // *---

    ctx.lineTo(
      Math.floor(selectBox.originCord[0]),
      Math.floor(selectBox.originCord[1])
    );
    // *---
    // |  |
    // ---

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;

    ctx.stroke();
  }
};

export const optimizeCanvas = ({
  canvas,
  ctx,
}: {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}) => {
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
};
