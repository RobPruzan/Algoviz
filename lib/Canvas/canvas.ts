import { P } from 'ts-pattern';
import {
  Edge,
  CircleConnector,
  CircleReceiver,
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
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
  TaggedDrawTypes,
} from '../types';
import * as Utils from '@/lib/utils';
import { RefObject, type MouseEvent } from 'react';
import { ValidatorLensInfo } from '@/redux/slices/canvasSlice';
export const replaceCanvasElement = <T extends { id: string }>({
  oldArray,
  newElement,
}: {
  oldArray: T[];
  newElement: T;
}) => {
  const newId = newElement.id;
  const newArray = oldArray.filter((elem) => elem.id !== newId);
  newArray.push(newElement);
  return newArray;
};

const getActiveLensResizeCircle = ({
  canvasRef,
  event,
  validatorLensContainer,
  cameraCoordinate,
}: {
  event: MouseEvent<HTMLCanvasElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  validatorLensContainer: ValidatorLensInfo[];
  cameraCoordinate: [number, number];
}) => {
  // getValidatorLensResizeCirclesCenter
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();

  const x = event.clientX - rect.left - cameraCoordinate[0];
  const y = event.clientY - rect.top - cameraCoordinate[1];
  // // validatorLensContainer.find((lens) => {
  // const { bottomLeft, bottomRight, topLeft, topRight, RESIZE_CIRCLE_RADIUS } =
  //   Utils.getValidatorLensResizeCirclesCenter(lens);
  // return (
  //   isPointInCircle(
  //     x,
  //     y,
  //     bottomLeft[0],
  //     bottomLeft[1],
  //     RESIZE_CIRCLE_RADIUS
  //   ) ||
  // isPointInCircle(
  //   x,
  //   y,
  //   bottomRight[0],
  //   bottomRight[1],
  //   RESIZE_CIRCLE_RADIUS
  // ) ||
  //   isPointInCircle(x, y, topLeft[0], topLeft[1], RESIZE_CIRCLE_RADIUS) ||
  //   isPointInCircle(x, y, topRight[0], topRight[1], RESIZE_CIRCLE_RADIUS)
  // );
  // // });

  // const flatCenters =
  return validatorLensContainer
    .map((lens) => {
      const {
        bottomLeft,
        bottomRight,
        topLeft,
        topRight,
        RESIZE_CIRCLE_RADIUS,
      } = Utils.getValidatorLensResizeCirclesCenter(lens);

      if (
        isPointInCircle(
          x,
          y,
          bottomLeft[0],
          bottomLeft[1],
          RESIZE_CIRCLE_RADIUS
        )
      ) {
        return {
          lens,
          type: 'bottom-left' as const,
        };
      }

      if (
        isPointInCircle(
          x,
          y,
          bottomRight[0],
          bottomRight[1],
          RESIZE_CIRCLE_RADIUS
        )
      ) {
        return {
          lens,
          type: 'bottom-right' as const,
        };
      }

      if (isPointInCircle(x, y, topLeft[0], topLeft[1], RESIZE_CIRCLE_RADIUS)) {
        return {
          lens,
          type: 'top-left' as const,
        };
      }

      if (
        isPointInCircle(x, y, topRight[0], topRight[1], RESIZE_CIRCLE_RADIUS)
      ) {
        return {
          lens,
          type: 'top-right' as const,
        };
      }

      return null;
    })
    .find((res) => res !== null);
};

export const getActiveCircle = ({
  event,
  canvasRef,
  circles,
  cameraCoordinate,
}: {
  event: MouseEvent<HTMLCanvasElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  circles: (CircleConnector | CircleReceiver | NodeConnector)[];
  cameraCoordinate: [number, number];
}) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - cameraCoordinate[0];
  const y = event.clientY - rect.top - cameraCoordinate[1];
  // too tired to figure this out but just need a simpel translation somewhere

  const activeCircle = circles.find((circle) =>
    isPointInCircle(x, y, circle.center[0], circle.center[1], circle.radius)
  );

  return activeCircle?.id;
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
type TempLineCleanMeUp = { x1: number; y1: number; x2: number; y2: number };

type Point = {
  x: number;
  y: number;
};

// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
const onSegment = (p: Point, q: Point, r: Point): boolean => {
  if (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  )
    return true;

  return false;
};

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
const orientation = (p: Point, q: Point, r: Point): number => {
  // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
  // for details of below formula.
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (val == 0) return 0; // collinear

  return val > 0 ? 1 : 2; // clock or counterclockwise
};

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
const doIntersect = (p1: Point, q1: Point, p2: Point, q2: Point): boolean => {
  // Find the four orientations needed for general and
  // special cases
  let o1 = orientation(p1, q1, p2);
  let o2 = orientation(p1, q1, q2);
  let o3 = orientation(p2, q2, p1);
  let o4 = orientation(p2, q2, q1);

  // should find 8 total

  // General case
  if (o1 != o2 && o3 != o4) return true;

  // Special Cases
  // p1, q1 and p2 are collinear and p2 lies on segment p1q1
  if (o1 == 0 && onSegment(p1, p2, q1)) return true;

  // p1, q1 and q2 are collinear and q2 lies on segment p1q1
  if (o2 == 0 && onSegment(p1, q2, q1)) return true;

  // p2, q2 and p1 are collinear and p1 lies on segment p2q2
  if (o3 == 0 && onSegment(p2, p1, q2)) return true;

  // p2, q2 and q1 are collinear and q1 lies on segment p2q2
  if (o4 == 0 && onSegment(p2, q1, q2)) return true;

  return false; // Doesn't fall in any of the above cases
};

type Line = {
  p: Point;
  q: Point;
  width: number;
};

type RectCorner = { x: number; y: number };
const doesLineIntersectRect = ({
  rectTopLeft,
  rectBottomRight,
  line,
}: {
  rectTopLeft: RectCorner;
  rectBottomRight: RectCorner;
  line: TempLineCleanMeUp;
}) => {
  const rectTopRight = { x: rectBottomRight.x, y: rectTopLeft.y };
  const rectBottomLeft = { x: rectTopLeft.x, y: rectBottomRight.y };

  const rectSides = [
    {
      x1: rectTopLeft.x,
      y1: rectTopLeft.y,
      x2: rectTopRight.x,
      y2: rectTopRight.y,
    }, // Top edge
    {
      x1: rectTopRight.x,
      y1: rectTopRight.y,
      x2: rectBottomRight.x,
      y2: rectBottomRight.y,
    }, // Right edge
    {
      x1: rectBottomRight.x,
      y1: rectBottomRight.y,
      x2: rectBottomLeft.x,
      y2: rectBottomLeft.y,
    }, // Bottom edge
    {
      x1: rectBottomLeft.x,
      y1: rectBottomLeft.y,
      x2: rectTopLeft.x,
      y2: rectTopLeft.y,
    }, // Left edge
  ];

  for (const rectSide of rectSides) {
    const res = doIntersect(
      { x: line.x1, y: line.y1 },
      { x: line.x2, y: line.y2 },
      { x: rectSide.x1, y: rectSide.y1 },
      { x: rectSide.x2, y: rectSide.y2 }
    );

    if (res) {
      return true;
    }
  }
  return false;
};

export const getActiveValidatorLens = ({
  canvasRef,
  event,
  validatorLensContainer,
  cameraCoordinate,
}: {
  event: MouseEvent<HTMLCanvasElement>;
  cameraCoordinate: [number, number];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  validatorLensContainer: ValidatorLensInfo[];
}) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - cameraCoordinate[0];
  const y = event.clientY - rect.top - cameraCoordinate[1];
  // taking the reverse because we want the most recently added rectangle to be ontop  (so the last item in the list)
  // but alose be the first ite selected (top of thel ist when searching)
  const activeLineIndex = validatorLensContainer.findLastIndex((lens) =>
    isPointInRectangle([x, y], lens.rect.bottomRight, lens.rect.topLeft)
  );

  return activeLineIndex !== -1
    ? validatorLensContainer[activeLineIndex].id
    : null;
};
// isPointInRectangle
export const getActiveLine = ({
  event,
  canvasRef,
  lines,
  cameraCoordinate,
}: {
  event: MouseEvent<HTMLCanvasElement>;
  cameraCoordinate: [number, number];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  lines: Rect[];
}) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - cameraCoordinate[0];
  const y = event.clientY - rect.top - cameraCoordinate[1];

  const activeLine = lines.find((line) =>
    // isPointInline(x, y, line.center, line.width, line.length)
    isPointInLine({
      px: x,
      py: y,
      x1: line.x1,
      x2: line.x2,
      y1: line.y1,
      y2: line.y2,
      width: line.width,
    })
  );

  return activeLine?.id;
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

  const intersectingCircle = circles.findLast((circle) =>
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
  selectedValidatorLens,
  selectedResizeValidatorLensCircle,
}: {
  selectedCircleID: string | null;
  selectedAttachableLine: {
    id: string;
    selected: 'line' | 'node1' | 'node2';
  } | null;
  selectedValidatorLens: SelectedValidatorLens | null;
  selectedResizeValidatorLensCircle: SelectedValidatorLensResizeCircle | null;
  selectedGeometryInfo: {
    selectedIds: Array<string>;
    maxPoints: MaxPoints;
  } | null;
}) => {
  if (selectedResizeValidatorLensCircle != null) {
    return selectedResizeValidatorLensCircle.type;
  }
  if (selectedValidatorLens != null) {
    return selectedValidatorLens.selected;
  }
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
}): (Edge & { nodeConnectedSide: 'one' | 'two' }) | undefined => {
  switch (nodeConnectedSide) {
    case 'one':
      // #TODO findLast breaks it, why?
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
  validatorLensContainer,
  cameraCoordinate,
}: {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  canvasRef: RefObject<HTMLCanvasElement>;
  event: MouseEvent<HTMLCanvasElement>;
  selectBox: SelectBox | null;
  selectedControlBarAction: TaggedDrawTypes | null;
  validatorLensContainer: ValidatorLensInfo[];
  cameraCoordinate: [number, number];
}) => {
  const activeCircleId = getActiveCircle({
    circles,
    event,
    canvasRef,
    cameraCoordinate,
  });
  const activeRectID = getActiveLine({
    canvasRef,
    event,
    lines: attachableLines,
    cameraCoordinate,
  });

  const activeValidatorLensId = getActiveValidatorLens({
    canvasRef,
    event,
    validatorLensContainer,
    cameraCoordinate,
  });

  const activeValidatorLensResizeCircle = getActiveLensResizeCircle({
    canvasRef,
    event,
    validatorLensContainer,
    cameraCoordinate,
  });

  const activeSelectableNodeOneId = getActiveCircle({
    canvasRef,
    event,
    circles: attachableLines.map((line) => line.attachNodeOne),
    cameraCoordinate,
  });

  const activeSelectableNodeTwoId = getActiveCircle({
    canvasRef,
    event,
    circles: attachableLines.map((line) => line.attachNodeTwo),
    cameraCoordinate,
  });

  if (
    !activeValidatorLensResizeCircle &&
    !activeCircleId &&
    !activeRectID &&
    !activeSelectableNodeOneId &&
    !activeSelectableNodeTwoId &&
    !activeValidatorLensId
  ) {
    return;
  }
  const activeValidatorLens = validatorLensContainer.find(
    (lens) => lens.id === activeValidatorLensId
  );

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
    // ^?
    selectedControlBarAction != null
      ? //    ^?
        { type: selectedControlBarAction }
      : null ||
        // why does this have to be guarded by the selected control bar action?
        activeValidatorLensResizeCircle ||
        (activeSelectNodeOne && isNodeOneAttached
          ? null
          : activeSelectNodeOne) ||
        (activeSelectNodeTwo && isNodeTwoAttached
          ? null
          : activeSelectNodeTwo) ||
        activeCircle ||
        activeRect ||
        selectBox ||
        activeValidatorLens;

  // (activeValidatorLensResizeCircle)
  //     ^?

  return {
    activeItem,
    activeCircle,
    activeRect,
    activeSelectNodeOne,
    activeSelectNodeTwo,
    activeValidatorLens,
    activeValidatorLensResizeCircle,
  };
};

export const getMouseUpActiveItem = ({
  attachableLines,
  circles,
  selectedCircleID,
  selectedAttachableLine,
  selectBox,
  selectedControlBarAction,
  selectedValidatorLens,
  validatorLensContainer,
}: {
  circles: CircleReceiver[];
  attachableLines: Edge[];
  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
  selectBox: SelectBox | null;
  selectedControlBarAction: TaggedDrawTypes | null;
  selectedValidatorLens: SelectedValidatorLens | null;
  validatorLensContainer: ValidatorLensInfo[];
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

  const activeValidatorLens =
    validatorLensContainer.find(
      (lens) => lens.id === selectedValidatorLens?.id
    ) ?? null;

  const activeItem =
    (selectedControlBarAction && { type: selectedControlBarAction.state }) ||
    activeCircle ||
    activeRect ||
    activeAttachNodeOne ||
    activeAttachNodeTwo ||
    activeValidatorLens ||
    selectBox;
  // this is simply a discriminated union encapsulated in acriveItem, and allows you to extract the intermediates early without matching
  return {
    activeItem,
    activeCircle,
    activeRect,
    activeRectContainerOne,
    activeRectContainerTwo,
    activeAttachNodeOne,
    activeAttachNodeTwo,
    activeValidatorLens,
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

  const filteredEdges = edges.filter((edge) => {
    const oneIsInside = vertices.find((vertex) =>
      vertex.nodeReceiver.attachedIds.includes(
        edge.attachNodeTwo.connectedToId ?? 'nope'
      )
    );
    const twoIsInside = vertices.find((vertex) =>
      vertex.nodeReceiver.attachedIds.includes(
        edge.attachNodeTwo.connectedToId ?? 'nope'
      )
    );
    let shouldKeep = true;
    if (edge.attachNodeOne.connectedToId !== null && !oneIsInside) {
      shouldKeep = false;
    }

    if (edge.attachNodeTwo.connectedToId !== null && !twoIsInside) {
      shouldKeep = false;
    }

    return shouldKeep;
  });

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
  filteredEdges.forEach((edge) => {
    const topLeft: [number, number] = selectBox.p1;
    const bottomRight: [number, number] = selectBox.p2;

    const intersecting = doesLineIntersectRect({
      rectTopLeft: {
        x: topLeft[0],
        y: topLeft[1],
      },
      rectBottomRight: {
        x: bottomRight[0],
        y: bottomRight[1],
      },
      line: edge,
    });

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
    // you could say the corner of the select boxes are the point
    // just check if a point (a corner of the select box) is inside the select box
    // that solves one problem
    if (intersecting || doesNodeTwoIntersect || doesNodeOneIntersect) {
      // should be a direct line drawing for edge or else it will be a box:/
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
    // const calcRectangle: CalcRectangle = {
    //   p1: [

    //   ]
    // }
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
// duplicated code clean it up plsssssssssssssssssssssssssssssss :)
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

// this is the offender btw ^
export const shiftValidatorLens = ({
  validatorLens,
  shift,
}: {
  validatorLens: ValidatorLensInfo;
  shift: [number, number];
}): ValidatorLensInfo => ({
  ...validatorLens,
  rect: {
    bottomRight: [
      validatorLens.rect.bottomRight[0] - shift[0],
      validatorLens.rect.bottomRight[1] - shift[1],
    ],
    topLeft: [
      validatorLens.rect.topLeft[0] - shift[0],
      validatorLens.rect.topLeft[1] - shift[1],
    ],
  },
});

export const mouseToCord = ({
  camera,
  canvasDim,
  mouse,
  zoomFactor,
}: {
  mouse: [number, number];
  camera: [number, number];
  zoomFactor: number;
  canvasDim: [number, number];
}) => {
  const [width, height] = canvasDim;
  const [originX, originY] = camera;
  // needs to be some percentage based/ transform based on the zoom factor
  // we should get a box and work with that
  //   If i have the mouse -> coordinate correctly translated, it should work correctly
  //   when im zoomed in, i should have a less distance moved mouse coordinate
  //   this means moving 1 unit should be a smaller unit in the actual coordinate space, but the item should still track the mouse
  //   it will track the mouse cause then a smaller move will be represented in coordiante space, but it will look equivelent since we’re zoomed in

  // how big is his window
  // in terms of percentages, where is he on his window
  // by default not moving anything everything is as it is (no op)

  // real window and virtual window
  // virtual == real at first

  // zooming makes virtual window smaller, but how do you know where you are in the virtual window
  // i guess camera can give you an indication of that
};
