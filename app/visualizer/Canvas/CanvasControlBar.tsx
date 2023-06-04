import { Button } from '@/components/ui/button';
import { useBreadthFirstSearch } from '@/hooks/useBreadthFirstSearch';
import * as Graph from '@/lib/graph';
import { CircleReceiver, Edge } from '@/lib/types';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
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

  const { handleBfs } = useBreadthFirstSearch({
    adjacencyList,
    // temporary until select is implemented
    startingNode: [...adjacencyList.keys()].at(0) ?? '',
  });

  const handleAddRect = () => {
    const [x1, y1] = [Math.random() * 400, Math.random() * 400];
    const newLine: Edge = {
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
        Add Circle
      </Button>
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleAddRect}
      >
        Add Line
      </Button>
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={() => dispatch(CanvasActions.updateInspectorVisibility(!show))}
      >
        Open Variable Inspector
      </Button>
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={() => {
          handleBfs();
        }}
      >
        handleBfs
      </Button>
    </div>
  );
};

export default CanvasControlBar;
