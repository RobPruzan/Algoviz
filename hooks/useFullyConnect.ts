import { CircleReceiver, Edge, SelectedGeometryInfo } from "@/lib/types";
import { CanvasActions, Meta } from "@/redux/slices/canvasSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Dispatch, SetStateAction } from "react";
import * as Graph from "@/lib/graph";
import { nanoid } from "nanoid";
export const useFullyConnect = (meta: Meta) => {
  const {
    circles,
    currentZoomFactor: creationZoomFactor,
    attachableLines,
    selectedGeometryInfo,
  } = useAppSelector((store) => store.canvas.present);
  const selectedAttachableLines = attachableLines.filter((line) =>
    selectedGeometryInfo?.selectedIds.includes(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.includes(circle.id)
  );

  const dispatch = useAppDispatch();
  const handleFullyConnect = () => {
    const visited = new Set<string>();
    const adjList = Graph.getAdjacencyList({
      edges: selectedAttachableLines,
      vertices: selectedCircles,
    });
    const are2NodesConnected = (a: CircleReceiver, b: CircleReceiver) =>
      adjList.get(a.id)?.includes(b.id) || adjList.get(b.id)?.includes(a.id);
    for (const circleA of selectedCircles) {
      for (const circleB of selectedCircles) {
        const storeCircleA = circles.find((circle) => circle.id == circleA.id);
        const storeCircleB = circles.find((circle) => circle.id == circleB.id);
        if (!storeCircleA || !storeCircleB) {
          throw new Error("Something is wrong with the store");
        }
        if (
          visited.has(storeCircleA.id + storeCircleB.id) ||
          visited.has(storeCircleB.id + storeCircleA.id) ||
          storeCircleB.id == storeCircleA.id ||
          are2NodesConnected(storeCircleA, storeCircleB)
        ) {
          continue;
        }
        // create new line to connect circles
        // reciever only ends up with one new connector node attached
        const [x1, y1] = storeCircleA.center;
        const [x2, y2] = storeCircleB.center;
        // need to combine this with canvascontrol bar object to create new
        // just make a build new edge func
        const newLine: Edge = {
          x1,
          y1,
          x2,
          y2,
          id: nanoid(),
          type: "rect",
          width: 4 * creationZoomFactor,
          directed: false,
          color: "#8A8A8A",
          attachNodeOne: {
            center: [x1, y1],
            radius: 15 * creationZoomFactor,
            color: "#42506e",
            id: nanoid(),
            type: "node1",
            connectedToId: storeCircleA.nodeReceiver.id,
          },
          attachNodeTwo: {
            center: [x2, y2],
            radius: 15 * creationZoomFactor,
            color: "#42506e",
            id: nanoid(),
            type: "node2",
            connectedToId: storeCircleB.nodeReceiver.id,
          },
        };
        dispatch(
          CanvasActions.attachNodeToReciever(
            {
              circleId: storeCircleA.id,
              attachId: newLine.attachNodeOne.id,
            },
            meta
          )
        );
        dispatch(
          CanvasActions.attachNodeToReciever(
            {
              circleId: storeCircleB.id,
              attachId: newLine.attachNodeTwo.id,
            },
            meta
          )
        );
        dispatch(CanvasActions.addLine(newLine, meta));
        visited.add(storeCircleA.id + storeCircleB.id);
        visited.add(storeCircleB.id + storeCircleA.id);
        dispatch(
          CanvasActions.addSelectedIds([
            newLine.id,
            newLine.attachNodeOne.id,
            newLine.attachNodeTwo.id,
          ])
        );
      }
    }
    dispatch(CanvasActions.nullifySelectedGeometryInfo(undefined));
  };

  return handleFullyConnect;
};
