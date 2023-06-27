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
  Edge,
  IO,
  UndirectedEdge,
} from '@/lib/types';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  ArrowUp,
  ArrowUpDown,
  Circle,
  CircleDot,
  GitBranchPlus,
  Inspect,
  Pencil,
  PlayIcon,
  RectangleHorizontal,
} from 'lucide-react';
import { Play } from 'next/font/google';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { DirectedEdgeIcon } from '@/components/icons/DirectedEdge';
import { BinarySearchTreeIcon } from '@/components/icons/BinarySearchTree';
import { GraphIcon } from '@/components/icons/Graph';
import { RedBlackTreeIcon } from '@/components/icons/RedBlackTree';
import { LinkedListIcon } from '@/components/icons/LinkedList';
import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { useShapeUpdateMutation } from '../hooks/useShapeUpdateMutation';
import * as Utils from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
type Props = {
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;
  socketRef: ReturnType<typeof useRef<IO>>;
  notSignedInUserId: string;
};

const CanvasControlBar = ({
  setSelectedControlBarAction,
  socketRef,
  notSignedInUserId,
}: Props) => {
  const dispatch = useAppDispatch();
  const {
    circles,
    creationZoomFactor,
    attachableLines,
    variableInspector: { show },
  } = useAppSelector((store) => store.canvas);

  // const adjacencyList = Graph.getAdjacencyList({
  //   edges: attachableLines,
  //   vertices: circles,
  // });

  // constShape;
  const shapeUpdateMutation = useShapeUpdateMutation();
  const searchParams = useSearchParams();
  const playgroundID = searchParams.get('playground-id');
  const session = useSession();

  const meta = {
    userID: session.data?.user.id ?? notSignedInUserId,
    playgroundID,
  };
  // fix all these hard coded numbers and random spawn points
  // move random spawn points to slight distribution around middle of canvas
  // or when I have time do so you select then click on the screen
  const handleAddUndirectedEdge = () => {
    const [x1, y1] = [Math.random() * 400, Math.random() * 400];
    const newLine: UndirectedEdge = {
      id: crypto.randomUUID(),

      type: 'rect',
      x1,
      y1,
      x2: x1 - 10,
      y2: y1 - 50,
      width: 4 * creationZoomFactor,
      directed: false,
      color: '#ACACAC',
      attachNodeOne: {
        center: [x1, y1],
        radius: 15 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 15 * creationZoomFactor,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node2',
        connectedToId: null,
      },
    };
    shapeUpdateMutation.mutate({
      lines: [...attachableLines, newLine],
      zoomAmount: creationZoomFactor,
    });
    if (playgroundID) {
      Utils.sendCreate(
        {
          roomID: playgroundID,
          type: 'edge',
          state: newLine,
        },
        socketRef
      );
    }
    dispatch(CanvasActions.addLine(newLine, meta));
  };

  // const handleAddDirectedEdge = () => {
  //   const [x1, y1] = [
  //     Math.random() * 400 * creationZoomFactor,
  //     Math.random() * 600 * creationZoomFactor,
  //   ];
  //   const newLine: DirectedEdge = {
  //     id: crypto.randomUUID(),

  //     type: 'rect',
  //     x1,
  //     y1,
  //     x2: x1 - 10,
  //     y2: y1 - 50,
  //     width: 7 * creationZoomFactor,
  //     directed: true,
  //     color: 'white',
  //     attachNodeOne: {
  //       center: [x1, y1],
  //       radius: 10 * creationZoomFactor,
  //       color: '#42506e',
  //       id: crypto.randomUUID(),
  //       type: 'node1',
  //       connectedToId: null,
  //     },
  //     attachNodeTwo: {
  //       center: [x1 - 10, y1 - 50],
  //       radius: 10 * creationZoomFactor,
  //       color: '#42506e',
  //       id: crypto.randomUUID(),
  //       type: 'node2',
  //       connectedToId: null,
  //     },
  //   };

  //   dispatch(CanvasActions.addLine(newLine));
  // };

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
      color: '#262D3F',
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
      color: 'rgb(24, 30, 43, .85)',
      nodeReceiver: newNodeConnector,
    };

    shapeUpdateMutation.mutate({
      circles: [...circles, newCircle],
      zoomAmount: creationZoomFactor,
    });
    if (playgroundID) {
      Utils.sendCreate(
        {
          roomID: playgroundID,
          type: 'circleReciever',
          state: newCircle,
        },
        socketRef
      );
    }

    dispatch(CanvasActions.addCircle(newCircle, meta));
  };
  return (
    <div className="w-full items-center prevent-select overflow-x-scroll overflow-y-hidden  h-14 flex justify-evenly ">
      <Button
        onClick={handleAddUndirectedEdge}
        variant={'outline'}
        className="px-2 mb-0"
      >
        {/* <RectangleHorizontal /> */}
        <svg
          width="53"
          height="13"
          viewBox="0 0 53 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="6.25" cy="6.25" r="5.75" fill="white" stroke="black" />
          <circle cx="46.25" cy="6.25" r="5.75" fill="white" stroke="black" />
          <rect
            x="12.5"
            y="5.5"
            width="28"
            height="2"
            fill="white"
            stroke="black"
          />
        </svg>
      </Button>
      <Button onClick={handleAddCircle} variant={'outline'} className="px-2">
        <CircleDot />
      </Button>
      <Button
        onClick={() =>
          setSelectedControlBarAction((prev) => (prev ? null : 'pencil'))
        }
        variant={'outline'}
        className="px-2"
      >
        <Pencil />
      </Button>
      <Button variant={'outline'} className="px-2 min-w-fit">
        {/* here goes options for specific r/b tree data structure stuff
        // can we do it so the user can bundle code with this to make it its own data structure
        // you define the color, and the logic behind what changes it
        // yes i like that very much
        */}
        {'Red-Black Tree | > more'}
      </Button>
      <Button variant={'outline'} className="px-2 min-w-fit">
        Binary Search Tree
      </Button>
      <Button variant={'outline'} className="px-2 min-w-fit">
        Linked List
      </Button>
    </div>
  );
};

export default CanvasControlBar;
