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
  GeoCircle,
  MaxPoints,
  DrawTypes,
  PencilCoordinates,
  SelectedGeometryInfo,
} from '../types';
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

export const isPointInRectangle = (
  point: [number, number],
  corner1: [number, number],
  corner2: [number, number]
): boolean => {
  const minX = Math.min(corner1[0], corner2[0]);
  const maxX = Math.max(corner1[0], corner2[0]);
  const minY = Math.min(corner1[1], corner2[1]);
  const maxY = Math.max(corner1[1], corner2[1]);

  return (
    point[0] >= minX && point[0] <= maxX && point[1] >= minY && point[1] <= maxY
  );
};
export const isPointInLine = ({
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
    isPointInLine({
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
  selectedGeometryInfo,
}: {
  selectedCircleID: string | null;
  selectedAttachableLine: {
    id: string;
    selected: 'line' | 'node1' | 'node2';
  } | null;
  selectedGeometryInfo: {
    selectedIds: Array<string>;
    maxPoints: MaxPoints;
  } | null;
}) => {
  if (
    selectedGeometryInfo != null &&
    selectedGeometryInfo.selectedIds.length != 0
  ) {
    return 'selectBox';
  }
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
  selectedControlBarAction,
}: {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  canvasRef: RefObject<HTMLCanvasElement>;
  event: MouseEvent<HTMLCanvasElement>;
  selectBox: SelectBox | null;
  selectedControlBarAction: 'pencil' | null;
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
  // need to implement delete for this to work properly (or when you remove the connection this logic won';';;'t know)
  const activeItem =
    selectedControlBarAction != null
      ? { type: selectedControlBarAction }
      : null ||
        (activeSelectNodeOne && isNodeOneAttached
          ? null
          : activeSelectNodeOne) ||
        (activeSelectNodeTwo && isNodeTwoAttached
          ? null
          : activeSelectNodeTwo) ||
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
  selectedControlBarAction,
}: {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
  selectBox: SelectBox | null;
  selectedControlBarAction: DrawTypes | null;
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
    (selectedControlBarAction && { type: selectedControlBarAction }) ||
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

type CalcRectangle = {
  p1: [number, number];
  p2: [number, number];
};

const doRectanglesIntersect = (
  r1: CalcRectangle,
  r2: CalcRectangle
): boolean => {
  // Determine the min and max points for each rectangle
  const r1Min = {
    x: Math.min(r1.p1[0], r1.p2[0]),
    y: Math.min(r1.p1[1], r1.p2[1]),
  };
  const r1Max = {
    x: Math.max(r1.p1[0], r1.p2[0]),
    y: Math.max(r1.p1[1], r1.p2[1]),
  };
  const r2Min = {
    x: Math.min(r2.p1[0], r2.p2[0]),
    y: Math.min(r2.p1[1], r2.p2[1]),
  };
  const r2Max = {
    x: Math.max(r2.p1[0], r2.p2[0]),
    y: Math.max(r2.p1[1], r2.p2[1]),
  };

  // Now check if the rectangles intersect
  return !(
    r2Min.x > r1Max.x ||
    r2Max.x < r1Min.x ||
    r2Min.y > r1Max.y ||
    r2Max.y < r1Min.y
  );
};

const generateCircleSelectBox = (circle: GeoCircle): CalcRectangle => ({
  p1: [circle.center[0] - circle.radius, circle.center[1] - circle.radius],
  p2: [circle.center[0] + circle.radius, circle.center[1] + circle.radius],
});

export const getSelectedGeometry = ({
  edges,
  vertices,
  selectBox,
}: {
  edges: Edge[];
  vertices: CircleReceiver[];
  selectBox: SelectBox | null;
}) => {
  if (!selectBox) return null;
  // the circles will have hit boxes for select
  // these will be rendered when selected
  // we will need geo math for if 2 rects intersect
  // we can reuse those 2 pieces of logic for everything
  // don't calculate for inner node
  const selectBoxRect: CalcRectangle = {
    p1: selectBox.p1,
    p2: selectBox.p2,
  };

  // let minX, minY = [0, 0]
  let minX = +Infinity;
  let minY = +Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const selectedIds: string[] = [];
  // if edge node is selected, so is attach node
  edges.forEach((edge) => {
    const doesEdgeIntersect = doRectanglesIntersect(
      {
        p1: [edge.x1, edge.y1],
        p2: [edge.x2, edge.y2],
      },
      selectBoxRect
    );
    const nodeOnwBox = generateCircleSelectBox(edge.attachNodeOne);
    const nodeTwoBox = generateCircleSelectBox(edge.attachNodeTwo);

    const doesNodeTwoIntersect = doRectanglesIntersect(
      nodeTwoBox,
      selectBoxRect
    );
    const doesNodeOneIntersect = doRectanglesIntersect(
      nodeOnwBox,
      selectBoxRect
    );

    if (doesEdgeIntersect || doesNodeTwoIntersect || doesNodeOneIntersect) {
      selectedIds.push(edge.id);
      selectedIds.push(edge.attachNodeOne.id);
      selectedIds.push(edge.attachNodeTwo.id);

      // this sucks but how can i do better
      minX = Math.min(edge.x1, minX);
      minY = Math.min(edge.y1, minY);
      minX = Math.min(edge.x2, minX);
      minY = Math.min(edge.y2, minY);

      maxX = Math.max(edge.x1, maxX);
      maxY = Math.max(edge.y1, maxY);
      maxX = Math.max(edge.x2, maxX);
      maxY = Math.max(edge.y2, maxY);

      minX = Math.min(nodeTwoBox.p1[0], minX);
      minX = Math.min(nodeTwoBox.p2[0], minX);
      minY = Math.min(nodeTwoBox.p1[1], minY);
      minY = Math.min(nodeTwoBox.p2[1], minY);

      maxX = Math.max(nodeOnwBox.p1[0], maxX);
      maxX = Math.max(nodeOnwBox.p2[0], maxX);
      maxY = Math.max(nodeOnwBox.p1[1], maxY);
      maxY = Math.max(nodeOnwBox.p2[1], maxY);
    }
  });

  vertices.forEach((vertex) => {
    const circleBox = generateCircleSelectBox(vertex);
    if (doRectanglesIntersect(circleBox, selectBoxRect)) {
      selectedIds.push(vertex.id);
      selectedIds.push(vertex.nodeReceiver.id);
      minX = Math.min(circleBox.p1[0], minX);
      minY = Math.min(circleBox.p1[1], minY);

      minX = Math.min(circleBox.p2[0], minX);
      minY = Math.min(circleBox.p2[1], minY);

      maxX = Math.max(circleBox.p1[0], maxX);
      maxY = Math.max(circleBox.p1[1], maxY);

      maxX = Math.max(circleBox.p2[0], maxX);
      maxY = Math.max(circleBox.p2[1], maxY);
    }
  });

  const maxPoints: MaxPoints = {
    closestToOrigin: [minX, minY],
    furthestFromOrigin: [maxX, maxY],
  };

  return {
    selectedIds,
    maxPoints: maxPoints,
  };
};

export const shiftCircle = ({
  circle,
  shift,
}: {
  circle: CircleReceiver;
  shift: [number, number];
}): CircleReceiver => {
  return {
    ...circle,
    center: [circle.center[0] - shift[0], circle.center[1] - shift[1]],
    nodeReceiver: {
      ...circle.nodeReceiver,
      center: [
        circle.nodeReceiver.center[0] - shift[0],
        circle.nodeReceiver.center[1] - shift[1],
      ],
    },
  };
};
{
}

export const shiftLine = ({
  line,
  shift,
}: {
  line: Edge;
  shift: [number, number];
}): Edge => {
  return {
    ...line,
    x1: line.x1 - shift[0],
    y1: line.y1 - shift[1],
    x2: line.x2 - shift[0],
    y2: line.y2 - shift[1],
    attachNodeOne: {
      ...line.attachNodeOne,
      center: [
        line.attachNodeOne.center[0] - shift[0],
        line.attachNodeOne.center[1] - shift[1],
      ],
    },
    attachNodeTwo: {
      ...line.attachNodeTwo,
      center: [
        line.attachNodeTwo.center[0] - shift[0],
        line.attachNodeTwo.center[1] - shift[1],
      ],
    },
  };
};

export const shiftSelectBox = <T extends SelectedGeometryInfo>({
  selectedGeometryInfo,
  shift,
}: {
  selectedGeometryInfo: T;
  shift: [number, number];
}): T => ({
  ...selectedGeometryInfo,
  maxPoints: {
    closestToOrigin: [
      selectedGeometryInfo.maxPoints.closestToOrigin[0] - shift[0],
      selectedGeometryInfo.maxPoints.closestToOrigin[1] - shift[1],
    ],
    furthestFromOrigin: [
      selectedGeometryInfo.maxPoints.furthestFromOrigin[0] - shift[0],
      selectedGeometryInfo.maxPoints.furthestFromOrigin[1] - shift[1],
    ],
  },
});
