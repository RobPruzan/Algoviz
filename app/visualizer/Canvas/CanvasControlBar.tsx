import { Button } from '@/components/ui/button';
import { useBreadthFirstSearch } from '@/hooks/useBreadthFirstSearch';
import { useDepthFirstSearch } from '@/hooks/useDepthFirstSearch';
import * as Graph from '@/lib/graph';
import { CircleReceiver, DirectedEdge, UndirectedEdge } from '@/lib/types';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  ArrowUp,
  ArrowUpDown,
  Circle,
  GitBranchPlus,
  Inspect,
  PlayIcon,
} from 'lucide-react';
import { Play } from 'next/font/google';
import React, { Dispatch, SetStateAction } from 'react';

const CanvasControlBar = () => {
  const dispatch = useAppDispatch();
  const {
    circles,
    attachableLines,
    variableInspector: { show },
  } = useAppSelector((store) => store.canvas);

  const adjacencyList = Graph.getAdjacencyList({
    edges: attachableLines,
    vertices: circles,
  });

  // const { handleBfs } = useBreadthFirstSearch({
  //   adjacencyList,
  //   // temporary until select is implemented
  //   startingNode: [...adjacencyList.keys()].at(0) ?? '',
  // });
  const { handleDfs } = useDepthFirstSearch({
    adjacencyList,
    // temporary until select is implemented
    startingNode: [...adjacencyList.keys()].at(0) ?? '',
  });

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
      width: 7,
      directed: false,
      color: 'white',
      attachNodeOne: {
        center: [x1, y1],
        radius: 10,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 10,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node2',
        connectedToId: null,
      },
    };

    dispatch(CanvasActions.addLine(newLine));
  };
  const handleAddDirectedEdge = () => {
    const [x1, y1] = [Math.random() * 400, Math.random() * 400];
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
      width: 7,
      directed: true,
      color: 'white',
      attachNodeOne: {
        center: [x1, y1],
        radius: 10,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 10,
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
      radius: circleRadius * 0.4,
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
      radius: circleRadius,
      color: '#181e2b',
      nodeReceiver: newNodeConnector,
    };

    dispatch(CanvasActions.addCircle(newCircle));
  };
  return (
    <div className="w-full  h-20 flex items-center justify-evenly">
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleAddCircle}
      >
        <Circle />
      </Button>
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
      </Button>
    </div>
  );
};

export default CanvasControlBar;
