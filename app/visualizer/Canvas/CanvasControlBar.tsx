import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

import {
  AlgoType,
  CanvasControlBarActions,
  CircleReceiver,
  DirectedEdge,
  DrawTypes,
  IO,
  UndirectedEdge,
} from '@/lib/types';
import { CanvasActions, ValidatorLensInfo } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  ArrowDown,
  ArrowDown10Icon,
  ArrowDownWideNarrow,
  ArrowRight,
  CarrotIcon,
  ChevronDown,
  CircleDot,
  Eraser,
  Pencil,
  Square,
  SquareIcon,
  XCircle,
} from 'lucide-react';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useShapeUpdateMutation } from '../hooks/useShapeUpdateMutation';
import * as Utils from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useGetAlgorithmsQuery } from '../hooks/useGetAlgorithmsQuery';
import { CodeExecActions } from '@/redux/slices/codeExecSlice';
import { DirectedEdgeIcon } from '@/components/icons/DirectedEdge';
import { UndirectedEdgeIcon } from '@/components/icons/UndirectedEdge';
type Props = {
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;

  notSignedInUserId: string;
};

const CanvasControlBar = ({
  setSelectedControlBarAction,

  notSignedInUserId,
}: Props) => {
  const dispatch = useAppDispatch();
  const { circles, creationZoomFactor, attachableLines } = useAppSelector(
    (store) => store.canvas
  );
  const [itemChecked, setItemChecked] = useState<null | string>(null);
  const searchParams = useSearchParams();

  const shapeUpdateMutation = useShapeUpdateMutation();
  const validShapeUpdateMutation = (
    ...args: Parameters<typeof shapeUpdateMutation.mutate>
  ) => searchParams.get('playground-id') && shapeUpdateMutation.mutate(...args);
  const playgroundID = searchParams.get('playground-id');
  const session = useSession();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  const selectedValidator: null | string = null;

  const meta = {
    userID: session.data?.user.id ?? notSignedInUserId,
    playgroundID,
  };
  // fix all these hard coded numbers and random spawn points
  // move random spawn points to slight distribution around middle of canvas
  // or when I have time do so you select then click on the screen
  const handleAddUndirectedEdge = () => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.UndirectedEdge,
          type: 'canvas-action',
        },
        meta
      )
    );
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
    validShapeUpdateMutation({
      lines: [...attachableLines, newLine],
      zoomAmount: creationZoomFactor,
    });
    // if (playgroundID) {
    //   Utils.sendCreate(
    //     {
    //       roomID: playgroundID,
    //       type: 'edge',
    //       state: newLine,
    //     },
    //     socketRef
    //   );
    // }
    dispatch(CanvasActions.addLine(newLine, meta));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };

  const handleAddDirectedEdge = () => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.DirectedEdge,
          type: 'canvas-action',
        },
        meta
      )
    );
    const [x1, y1] = [
      Math.random() * 400 * creationZoomFactor,
      Math.random() * 600 * creationZoomFactor,
    ];
    const newLine: DirectedEdge = {
      // gotta change this iz so weird
      id: crypto.randomUUID(),
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
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };

  const handleAddCircle = () => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.Node,
          type: 'canvas-action',
        },
        meta
      )
    );
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

    validShapeUpdateMutation({
      circles: [...circles, newCircle],
      zoomAmount: creationZoomFactor,
    });

    dispatch(CanvasActions.addCircle(newCircle, meta));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };

  const handleAddValidatorLens = (id: string) => {
    dispatch(
      CanvasActions.setSelectedAction(
        {
          actionType: CanvasControlBarActions.Validators,
          type: 'canvas-action',
        },
        meta
      )
    );
    const newValidatorLens: ValidatorLensInfo = {
      id: crypto.randomUUID(),
      algoId: id,
      result: null,
      code: null,
      rect: {
        bottomRight: [Math.random() * 400, Math.random() * 400],
        topLeft: [Math.random() * 400, Math.random() * 400],
      },
      selectedIds: [],
      type: 'validator-lens',
    };
    dispatch(CanvasActions.addValidatorLens(newValidatorLens));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };
  return (
    <div className="w-full items-center prevent-select overflow-x-scroll overflow-y-hidden  h-14 flex justify-evenly ">
      <Button
        onClick={() => dispatch(CanvasActions.resetState(undefined))}
        variant={'outline'}
        className="px-2 mb-0"
      >
        <XCircle className="fill-red-500" />
      </Button>
      <Button
        onClick={() => {
          dispatch(
            CanvasActions.setSelectedAction(
              {
                actionType: CanvasControlBarActions.Pencil,
                type: 'canvas-action',
              },
              meta
            )
          );
          // setSelectedControlBarAction((prev) => (prev ? null : 'pencil'))
        }}
        variant={'outline'}
        className="px-2"
      >
        <Pencil />
      </Button>

      <Button variant={'outline'} className="px-2">
        <Eraser />
      </Button>
      <Button
        onClick={handleAddUndirectedEdge}
        variant={'outline'}
        className="px-2 mb-0"
      >
        {/* <RectangleHorizontal /> */}
        <UndirectedEdgeIcon />
      </Button>

      <Button
        onClick={handleAddDirectedEdge}
        variant={'outline'}
        className="px-2 min-w-fit"
      >
        <DirectedEdgeIcon />
      </Button>
      <Button onClick={handleAddCircle} variant={'outline'} className="px-2">
        <CircleDot />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="border-2 w-32 flex items-center justify-evenly font-bold rounded-md text-sm p-2">
          {getAlgorithmsQuery.data?.find(
            (algoInfo) => algoInfo.id === itemChecked
          )?.title ?? 'Validators'}
          <ChevronDown size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {getAlgorithmsQuery.data?.map((algo) =>
            algo.type === AlgoType.Validator ? (
              <div key={algo.id} className="flex items-center justify-end p-0 ">
                <DropdownMenuItem
                  className="w-full"
                  onClick={() => {
                    handleAddValidatorLens(algo.id);
                  }}
                  // textValue={algo.id}
                  // onClick={e => e.}
                >
                  {algo.title}
                  {/* <DropdownMenuCheckboxItem
                    className="w-fit p-0 mx-2"
                    checked={itemChecked === algo.id}
                  /> */}
                </DropdownMenuItem>
              </div>
            ) : null
          )}
          {/* <DropdownMenuItem onClick={handleAddValidatorLens}>
            Red Black Tree
          </DropdownMenuItem>

          <DropdownMenuItem>Binary Search Tree</DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CanvasControlBar;
