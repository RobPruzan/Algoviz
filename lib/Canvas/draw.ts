import { RefObject } from 'react';
import {
  CircleReceiver,
  Edge,
  SelectedAttachableLine,
  SelectBox,
  PencilCoordinates,
  SelectedValidatorLens,
} from '../types';
import { NodeValidation } from '@/redux/slices/codeExecSlice';
import { ValidatorLensInfo } from '@/redux/slices/canvasSlice';
import { RESIZE_CIRCLE_RADIUS } from '../utils';
import { match } from 'ts-pattern';
import { useGetAlgorithmsQuery } from '@/app/visualizer/hooks/useGetAlgorithmsQuery';

export const drawNodes = ({
  nodes,
  ctx,
  selectedCircleID,
  selectedIDs: selectedIDs,
  visualizationNodes,
  theme,
  endNode,
  startNode,
  validatorLensContainer,
}: {
  nodes: CircleReceiver[];
  ctx: CanvasRenderingContext2D;
  selectedCircleID: string | null;
  selectedIDs: Array<string> | undefined;
  visualizationNodes: string[];
  validatorLensContainer: ValidatorLensInfo[];
  endNode: string | null;
  startNode: string | null;
  theme: string;
}) => {
  ctx.save();

  nodes.forEach((node) => {
    ctx.beginPath();
    ctx.arc(node.center[0], node.center[1], node.radius, 0, 2 * Math.PI, false);

    ctx.fillStyle =
      theme === 'dark'
        ? node.color
        : theme === 'light'
        ? '#DADADA'
        : node.color;

    if (visualizationNodes.includes(node.id)) {
      ctx.fillStyle = 'green';
    }

    if (node.id === startNode) {
      ctx.fillStyle = 'blue';
    }

    if (node.id === endNode) {
      ctx.fillStyle = 'red';
    }

    const currentLens = validatorLensContainer.find((lens) =>
      lens.selectedIds.includes(node.id)
    );
    if (selectedIDs?.includes(node.id)) {
      switch (typeof currentLens?.result) {
        case 'boolean':
          if (!currentLens.result) {
            ctx.fillStyle = 'red';
          } else {
            ctx.fillStyle = 'green';
            ctx.fillText(
              'valid',
              node.center[0] - 10,
              node.center[1] - node.radius - 10
            );
          }
          break;
        case 'object':
          if (currentLens.result && currentLens.result.length > 0) {
            if (
              currentLens.result.find((vNode) => vNode.id === node.id)?.valid
            ) {
              ctx.fillStyle = 'green';
            } else {
              ctx.fillStyle === 'red';
            }
          }
          break;
        default:
          break;
      }
    }

    ctx.fill();
    if (selectedCircleID === node.id || selectedIDs?.includes(node.id)) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }
  });
  ctx.restore();
};

export const drawEdges = ({
  ctx,
  edges,
  selectedIds,
  selectedAttachableLine,
}: {
  edges: Edge[];
  ctx: CanvasRenderingContext2D;
  selectedIds: Array<string> | undefined;
  selectedAttachableLine: SelectedAttachableLine | null;
}) => {
  edges.forEach((edge) => {
    if (
      selectedAttachableLine?.id === edge.id ||
      selectedIds?.includes(edge.id)
    ) {
      ctx.beginPath();

      ctx.moveTo(Math.floor(edge.x1), Math.floor(edge.y1));
      ctx.lineTo(Math.floor(edge.x2), Math.floor(edge.y2));
      ctx.strokeStyle = '#23ddff';

      ctx.lineWidth = Math.floor(edge.width * 1.6);
      ctx.stroke();
    }
    ctx.beginPath();

    ctx.moveTo(Math.floor(edge.x1), Math.floor(edge.y1));
    ctx.lineTo(Math.floor(edge.x2), Math.floor(edge.y2));
    ctx.strokeStyle = '#D8DAE1';

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
    .map((edge) => ({ ...edge.attachNodeOne, directed: edge.directed }))
    .forEach((circle) => {
      ctx.beginPath();
      ctx.arc(
        Math.floor(circle.center[0]),
        Math.floor(circle.center[1]),
        Math.floor(circle.directed ? circle.radius / 3 : circle.radius),
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = circle.directed ? '#D8DAE1' : circle.color;
      ctx.fill();
    });
  edges.forEach((edge) => {
    ctx.beginPath();
    ctx.arc(
      Math.floor(edge.attachNodeTwo.center[0]),
      Math.floor(edge.attachNodeTwo.center[1]),
      edge.attachNodeTwo.radius,
      0,
      2 * Math.PI,
      false
    );
    // this sucks will change the directed edges logic completely
    // if (edge.directed) {
    //   ctx.fillStyle = 'green';
    // } else {
    //   edge.attachNodeTwo.color;
    // }
    // just going to remove this entirely and control the nodes color and other stuff based on state/ the decisions made here
    edge.attachNodeTwo.color;

    ctx.fill();
  });
};

export const drawNodeReceivers = ({
  ctx,
  nodes,
  theme,
}: {
  nodes: CircleReceiver[];
  ctx: CanvasRenderingContext2D;
  theme: string;
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
    // ctx.fillStyle = nodeReceiver.color;
    ctx.fillStyle =
      theme === 'dark' ? '#45506C' : theme === 'light' ? 'white' : '#45506C';
    ctx.fill();

    if (nodeReceiver.attachedIds.length > 0) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }
    // set the text style
    ctx.font = `${node.radius / 2}px Arial`; // change to whatever font style you want
    ctx.fillStyle =
      theme === 'dark' ? 'white' : theme === 'light' ? 'black' : 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the text
    // This will draw the text in the center of the node
    var text = node.value.toString();
    ctx.fillText(text, Math.floor(node.center[0]), Math.floor(node.center[1]));
    ctx.canvas.style.zIndex = '100';
  });
};
export const drawValidatorLens = ({
  ctx,
  theme,
  validatorLensContainer,
  selectedIds,
  selectedValidatorLens,
  algos,
}: {
  validatorLensContainer: ValidatorLensInfo[];
  ctx: CanvasRenderingContext2D;
  theme: string;
  selectedIds: string[] | undefined;
  selectedValidatorLens: SelectedValidatorLens | null;

  algos: ReturnType<typeof useGetAlgorithmsQuery>['data'];
}) => {
  validatorLensContainer.forEach((lens, index) => {
    const [leftX, topY] = lens.rect.topLeft;
    const [rightX, bottomY] = lens.rect.bottomRight;

    // ill want the inside highlighted and other interior selected indicator

    // ctx.beginPath();
    // // ----

    // //-\--
    // // |- |
    // // ----

    ctx.beginPath();

    // ----
    //* ---
    // |  |
    // ---
    ctx.moveTo(Math.floor(leftX), Math.floor(topY));
    ctx.lineTo(Math.floor(rightX), Math.floor(topY));
    // ---*
    // |  |
    // ---

    ctx.lineTo(Math.floor(rightX), Math.floor(bottomY));
    // ---
    // |  |
    // ---*

    ctx.lineTo(Math.floor(leftX), Math.floor(bottomY));
    // ---
    // |  |
    // *---

    ctx.lineTo(Math.floor(leftX), Math.floor(topY));
    // *---
    // |  |
    // ---

    // // text above the top y, middle x rect is in the form of topleft, bottom right
    // ctx.font = '20px Arial';

    // // Define your rectangle corners
    // let topLeft = lens.rect.topLeft;
    // let bottomRight = lens.rect.bottomRight;

    // // Calculate middle X of the rectangle
    // let middleX = (topLeft[0] + bottomRight[0]) / 2;

    // // Measure the text width
    // let textWidth = ctx.measureText(text).width;

    // // Calculate the position where the text should be drawn to be centered above the rectangle
    // let textX = middleX - textWidth / 2;

    // // Choose an appropriate offset to position the text above the rectangle,
    // // here we arbitrarily chose 10 units above the top of the rectangle
    // let textY = topLeft[1] - 10;

    // // Draw the text
    // ctx.fillText(text, textX, textY);

    ctx.font = '20px Arial';

    const text =
      algos?.find((algo) => algo.id === lens.algoId)?.title || 'unknown';

    // Assume we have the rectangle's corners as rect.lens.topLeft and rect.lens.bottomRight
    const topLeft = lens.rect.topLeft;
    const bottomRight = lens.rect.bottomRight;

    // Calculate middle X of the rectangle
    const middleX = (topLeft[0] + bottomRight[0]) / 2;

    // Calculate top Y of the rectangle
    const maxY = Math.min(topLeft[1], bottomRight[1]);

    // Measure the text width
    const textWidth = ctx.measureText(text).width;

    // Calculate the position where the text should be drawn to be centered above the rectangle
    const textX = middleX - textWidth / 2;

    // Choose an appropriate offset to position the text above the rectangle,
    // here we arbitrarily chose 10 units above the top of the rectangle
    const textY = maxY - 10;

    ctx.fillStyle =
      theme === 'dark' ? 'white' : theme === 'light' ? 'black' : 'white';

    ctx.fillText(text, textX, textY);
    ctx.lineWidth = 1;
    // text color black

    ctx.strokeStyle =
      theme === 'light' ? '#ADD8E6' : theme === 'dark' ? 'white' : 'white';

    if (selectedValidatorLens?.id === lens.id) {
      ctx.fillStyle = 'white';
    } else {
      ctx.fillStyle = '#F1EDED';
    }
    ctx.globalAlpha = 0.05;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.closePath(); // This ensures the path is closed and can be filled
    ctx.stroke();

    // Set the fill colo

    ctx.beginPath();
    ctx.moveTo(Math.floor(leftX), Math.floor(topY));
    ctx.arc(
      Math.floor(leftX),
      Math.floor(topY),
      Math.floor(RESIZE_CIRCLE_RADIUS),
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = '#c5c5c5';
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(
      Math.floor(rightX),
      Math.floor(topY),
      Math.floor(RESIZE_CIRCLE_RADIUS),
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = '#c5c5c5';
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(
      Math.floor(rightX),
      Math.floor(bottomY),
      Math.floor(RESIZE_CIRCLE_RADIUS),
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = '#c5c5c5';
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(
      Math.floor(leftX),
      Math.floor(bottomY),
      Math.floor(RESIZE_CIRCLE_RADIUS),
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = '#c5c5c5';
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(
      Math.floor(leftX),
      Math.floor(topY),
      Math.floor(RESIZE_CIRCLE_RADIUS),
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = '#c5c5c5';
    ctx.fill();
    ctx.closePath();
  });
};

export const drawBox = ({
  ctx,
  box,
  fill,
  theme,
}: {
  box: Omit<SelectBox, 'type'>;
  ctx: CanvasRenderingContext2D;
  fill?: boolean;
  theme: string;
}) => {
  // ill want the inside highlighted and other interior selected indicator
  ctx.beginPath();
  //* ---
  // |  |
  // ---
  ctx.moveTo(Math.floor(box.p1[0]), Math.floor(box.p1[1]));
  ctx.lineTo(Math.floor(box.p2[0]), Math.floor(box.p1[1]));
  // ---*
  // |  |
  // ---

  ctx.lineTo(Math.floor(box.p2[0]), Math.floor(box.p2[1]));
  // ---
  // |  |
  // ---*

  ctx.lineTo(Math.floor(box.p1[0]), Math.floor(box.p2[1]));
  // ---
  // |  |
  // *---

  ctx.lineTo(Math.floor(box.p1[0]), Math.floor(box.p1[1]));
  // *---
  // |  |
  // ---

  ctx.strokeStyle =
    theme === 'light' ? '#ADD8E6' : theme === 'dark' ? 'white' : 'white';
  ctx.lineWidth = 1;

  ctx.closePath(); // This ensures the path is closed and can be filled

  // Set the fill color
  if (fill) {
    const darkTheme = 'rgba(173, 216, 230, 0.15)';
    const lightTheme = 'rgba(173, 216, 230, 0.15)';
    // ctx.fillStyle = 'rgba(173, 216, 230, 0.15)';
    ctx.fillStyle =
      theme === 'dark' ? darkTheme : theme === 'light' ? lightTheme : darkTheme;

    // Fill the square
    ctx.fill();
  }

  ctx.stroke();
};

// export const optimizeCanvas = ({
//   canvas,
//   ctx,
// }: {
//   canvas: HTMLCanvasElement;
//   ctx: CanvasRenderingContext2D;
// }) => {
//   const dpr = window.devicePixelRatio;
//   const rect = canvas.getBoundingClientRect();

//   // Set the "actual" size of the canvas
//   canvas.width = rect.width * dpr;
//   canvas.height = rect.height * dpr;

//   // Scale the context to ensure correct drawing operations
//   ctx.scale(dpr, dpr);

//   // Set the "drawn" size of the canvas
//   canvas.style.width = `${rect.width}px`;
//   canvas.style.height = `${rect.height}px`;
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
// };
export const updateCanvasEnvironment = ({
  canvas,
  ctx,
  cameraPosition,
}: {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cameraPosition: { x: number; y: number };
}) => {
  const dpr = window.devicePixelRatio;
  const rect = canvas.getBoundingClientRect();

  // Set the "actual" size of the canvas
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale the context to ensure correct drawing operations
  ctx.scale(dpr, dpr);

  // Translate the origin to the camera position
  ctx.translate(cameraPosition.x, cameraPosition.y);

  // Set the "drawn" size of the canvas
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  // Clear the canvas, taking into account the new origin
  ctx.clearRect(-cameraPosition.x, -cameraPosition.y, rect.width, rect.height);
};

export const drawPencil = ({
  ctx,
  pencilCoordinates,
}: {
  ctx: CanvasRenderingContext2D;
  pencilCoordinates: PencilCoordinates;
}) => {
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  // ctx.save();
  pencilCoordinates.drawingCoordinates.reduce<[number, number] | null>(
    (prev, curr) => {
      if (prev !== null) {
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(curr[0], curr[1]);
        ctx.stroke();
      }

      return curr;
    },
    null
  );
  // this weirdly causes the node reciever to spawn with a ring
  // ctx.lineWidth = 2;
  // ctx.strokeStyle = 'white';

  pencilCoordinates.drawnCoordinates.forEach((continuousCords) => {
    continuousCords.reduce<[number, number] | null>((prev, curr) => {
      if (prev !== null) {
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(curr[0], curr[1]);
        ctx.stroke();
      }
      return curr;
    }, null);
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = 'white';

    // ctx.restore();
  });
};

export function zoomCircle(
  center: [number, number],
  radius: number,
  target: [number, number],
  zoomFactor: number
): [[number, number], number] {
  // Translate to origin
  let translatedCenter: [number, number] = [
    center[0] - target[0],
    center[1] - target[1],
  ];

  // Scale
  let scaledCenter: [number, number] = [
    translatedCenter[0] * zoomFactor,
    translatedCenter[1] * zoomFactor,
  ];
  let scaledRadius: number = radius * zoomFactor;

  // Translate back
  let newCenter: [number, number] = [
    scaledCenter[0] + target[0],
    scaledCenter[1] + target[1],
  ];

  return [newCenter, scaledRadius];
}

export function mouseCenteredZoom(
  center: [number, number],
  target: [number, number],
  zoomFactor: number
): [number, number] {
  // Translate to origin
  let translatedCenter: [number, number] = [
    center[0] - target[0],
    center[1] - target[1],
  ];

  // Scale
  let scaledCenter: [number, number] = [
    translatedCenter[0] * zoomFactor,
    translatedCenter[1] * zoomFactor,
  ];

  // Translate back
  let newCenter: [number, number] = [
    scaledCenter[0] + target[0],
    scaledCenter[1] + target[1],
  ];

  return newCenter;
}

export function getCursorPosition(
  event: WheelEvent,
  canvasRef: RefObject<HTMLCanvasElement>,
  cameraCord: [number, number]
): [number, number] {
  const canvas = canvasRef.current;
  if (!canvas) return [0, 0];
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - cameraCord[0];
  const y = event.clientY - rect.top - cameraCord[1];
  return [x, y];
}

export const drawTriangle = ({
  ctx,
  edges,
}: {
  ctx: CanvasRenderingContext2D;
  edges: Edge[];
}) => {
  // dummy data
  const directedEdges = edges.filter((edge) => edge.directed);
  directedEdges.forEach((edge) => {
    const triangleBaseCenterPointCord = [edge.x1, edge.y1];
    const triangleBaseLength = edge.width * 2.5;
    const opposingSideCenterPointCord = [edge.x2, edge.y2];

    let direction = [
      opposingSideCenterPointCord[0] - triangleBaseCenterPointCord[0],
      opposingSideCenterPointCord[1] - triangleBaseCenterPointCord[1],
    ];

    let length = Math.sqrt(
      direction[0] * direction[0] + direction[1] * direction[1]
    );
    direction = [direction[0] / length, direction[1] / length];

    // rotates the direction vector 90 degrees
    let perpendicular = [-direction[1], direction[0]];

    let halfBase = [
      (perpendicular[0] * triangleBaseLength) / 2,
      (perpendicular[1] * triangleBaseLength) / 2,
    ];

    let base1 = [
      triangleBaseCenterPointCord[0] - halfBase[0],
      triangleBaseCenterPointCord[1] - halfBase[1],
    ];
    let base2 = [
      triangleBaseCenterPointCord[0] + halfBase[0],
      triangleBaseCenterPointCord[1] + halfBase[1],
    ];

    let tip = [
      triangleBaseCenterPointCord[0] - direction[0] * triangleBaseLength,
      triangleBaseCenterPointCord[1] - direction[1] * triangleBaseLength,
    ];

    ctx.beginPath();
    ctx.moveTo(base1[0], base1[1]);
    ctx.lineTo(base2[0], base2[1]);
    ctx.lineTo(tip[0], tip[1]);
    ctx.closePath();
    ctx.fillStyle = '#D8DAE1';
    ctx.fill();
    ctx.stroke();
  });
};
