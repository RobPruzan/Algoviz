import { Vertex } from '@/components/icons/Vertex';
import { UndirectedEdgeIcon } from '@/components/icons/UndirectedEdge';

import { Button } from '@/components/ui/button';
import { useBreadthFirstSearch } from '@/hooks/useBreadthFirstSearch';
import { useDepthFirstSearch } from '@/hooks/useDepthFirstSearch';
import * as Graph from '@/lib/graph';
import {
  CircleReceiver,
  DirectedEdge,
  DrawTypes,
  UndirectedEdge,
} from '@/lib/types';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  ArrowUp,
  ArrowUpDown,
  Circle,
  GitBranchPlus,
  Inspect,
  Pencil,
  PlayIcon,
} from 'lucide-react';
import { Play } from 'next/font/google';
import React, { Dispatch, SetStateAction } from 'react';
import { DirectedEdgeIcon } from '@/components/icons/DirectedEdge';
import { BinarySearchTreeIcon } from '@/components/icons/BinarySearchTree';
import { GraphIcon } from '@/components/icons/Graph';
import { RedBlackTreeIcon } from '@/components/icons/RedBlackTree';
import { LinkedListIcon } from '@/components/icons/LinkedList';

type Props = {
  handleDfs: () => void;
  selectedControlBarAction: DrawTypes | null;
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;
};

const CanvasControlBar = ({
  handleDfs,
  selectedControlBarAction,
  setSelectedControlBarAction,
}: Props) => {
  const dispatch = useAppDispatch();
  const {
    circles,
    creationZoomFactor,
    attachableLines,
    variableInspector: { show },
  } = useAppSelector((store) => store.canvas);

  const adjacencyList = Graph.getAdjacencyList({
    edges: attachableLines,
    vertices: circles,
  });

  // fix all these hard coded numbers and random spawn points
  // move random spawn points to slight distribution around middle of canvas
  // or when I have time do so you select then click on the screen
  const handleAddUndirectedEdge = () => {
    const [x1, y1] = [Math.random() * 400, Math.random() * 400];
    const newLine: UndirectedEdge = {
      id: crypto.randomUUID(),
      algorithmMetadata: {
        active: false,
      },
      type: 'rect',
      x1,
      y1,
      x2: x1 - 10,
      y2: y1 - 50,
      width: 7 * creationZoomFactor,
      directed: false,
      color: 'white',
      attachNodeOne: {
        center: [x1, y1],
        radius: 10 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 10 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node2',
        connectedToId: null,
      },
    };

    dispatch(CanvasActions.addLine(newLine));
  };

  const handleAddDirectedEdge = () => {
    const [x1, y1] = [
      Math.random() * 400 * creationZoomFactor,
      Math.random() * 600 * creationZoomFactor,
    ];
    const newLine: DirectedEdge = {
      id: crypto.randomUUID(),
      algorithmMetadata: {
        active: false,
      },
      type: 'rect',
      x1,
      y1,
      x2: x1 - 10,
      y2: y1 - 50,
      width: 7 * creationZoomFactor,
      directed: true,
      color: 'white',
      attachNodeOne: {
        center: [x1, y1],
        radius: 10 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 10 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node2',
        connectedToId: null,
      },
    };

    dispatch(CanvasActions.addLine(newLine));
  };

  const handleAddCircle = () => {
    const circleCenter: [number, number] = [
      Math.random() * 400,
      Math.random() * 400,
    ];
    const circleRadius = 50;
    const newNodeConnector: CircleReceiver['nodeReceiver'] = {
      id: crypto.randomUUID(),
      center: circleCenter,
      radius: circleRadius * 0.4 * creationZoomFactor,
      color: '#42506e',
      type: 'circle',
      attachedIds: [],
    };
    const newCircle: CircleReceiver = {
      id: crypto.randomUUID(),
      algorithmMetadata: {
        active: false,
      },
      value: Math.floor(Math.random() * 100),
      type: 'circle',
      center: circleCenter,
      radius: circleRadius * creationZoomFactor,
      color: '#181e2b',
      nodeReceiver: newNodeConnector,
    };

    dispatch(CanvasActions.addCircle(newCircle));
  };
  return (
    <div className="w-full  h-[5rem] flex items-start ">
      <div className="flex flex-col h-full ">
        <div className="h-1/2 flex">
          <Button
            onClick={handleAddUndirectedEdge}
            className="bg-secondary  hover:bg-primary w-24 rounded-sm rounded-b-none rounded-r-none h-full border border-foreground"
          >
            <UndirectedEdgeIcon />
          </Button>
          <Button
            onClick={handleAddCircle}
            className="bg-secondary hover:bg-primary w-16 border border-foreground rounded-none h-full"
          >
            <Vertex />
          </Button>
        </div>
        <div className="h-1/2 flex">
          <Button
            onClick={handleAddDirectedEdge}
            className="bg-secondary hover:bg-primary w-24  border border-foreground rounded-none h-full"
          >
            <DirectedEdgeIcon />
          </Button>
          <Button
            onClick={() =>
              setSelectedControlBarAction((prev) => (prev ? null : 'pencil'))
            }
            className={`${
              selectedControlBarAction === 'pencil'
                ? 'bg-muted-foreground'
                : 'bg-secondary'
            } hover:bg-primary  w-16 border border-foreground rounded-none h-full`}
          >
            <Pencil />
          </Button>
        </div>
      </div>
      <Button className="bg-secondary hover:bg-primary  w-24  border border-foreground rounded-none h-full">
        <BinarySearchTreeIcon />
      </Button>
      <Button className="bg-secondary hover:bg-primary w-24  border border-foreground rounded-none h-full">
        <GraphIcon />
      </Button>
      <Button className="bg-secondary hover:bg-primary w-24  border border-foreground rounded-none h-full">
        <RedBlackTreeIcon />
      </Button>
      <Button className="bg-secondary hover:bg-primary w-24  border border-foreground rounded-none h-full">
        <LinkedListIcon />
      </Button>
      {/* <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleAddCircle}
      >
        <Circle />
      </Button> */}
      {/* 
      
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleAddUndirectedEdge}
      >
        <ArrowUpDown />
      </Button>
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleAddDirectedEdge}
      >
        <ArrowUp />
      </Button>
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={() => dispatch(CanvasActions.updateInspectorVisibility(!show))}
      >
        <Inspect />
      </Button>
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleDfs}
      >
        <GitBranchPlus />
      </Button> */}
    </div>
  );
};

export default CanvasControlBar;
