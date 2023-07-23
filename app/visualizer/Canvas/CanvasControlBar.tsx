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
import {
  CanvasActions,
  Meta,
  ValidatorLensInfo,
} from '@/redux/slices/canvasSlice';
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
  RedoIcon,
  Square,
  SquareIcon,
  Trash,
  Undo,
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
import { BINARY_SEARCH_TREE } from '@/lib/presets/binary-search-tree';
import { ActionCreators } from 'redux-undo';
import AlgoHistorySlider from '../Sort/AlgoHistorySlider';
type Props = {
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;
};

const CanvasControlBar = ({ setSelectedControlBarAction }: Props) => {
  const dispatch = useAppDispatch();
  const {
    circles,

    currentZoomFactor: creationZoomFactor,
    attachableLines,
    cameraCoordinate,
  } = useAppSelector((store) => store.canvas.present);
  const [showAlgoHistorySlider, setShowAlgoHistorySlider] = useState(false);
  const [itemChecked, setItemChecked] = useState<null | string>(null);
  const searchParams = useSearchParams();
  const notSignedInUserID = useAppSelector(
    (store) => store.canvas.present.notSignedInUserID
  );

  const visualization = useAppSelector((store) => store.codeExec.visualization);
  // const canvasPicked = useAppSelector((store) => ({
  //   attachableLines: store.canvas.present.attachableLines,
  //   circles: store.canvas.present.circles,
  // }));

  const shapeUpdateMutation = useShapeUpdateMutation();
  const validShapeUpdateMutation = (
    ...args: Parameters<typeof shapeUpdateMutation.mutate>
  ) => searchParams.get('playground-id') && shapeUpdateMutation.mutate(...args);
  const playgroundID = searchParams.get('playground-id');
  const session = useSession();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  const selectedValidator: null | string = null;

  const meta: Meta = {
    userID: session.data?.user.id ?? notSignedInUserID,
    playgroundID,
    user: {
      id: session.data?.user.id ?? notSignedInUserID,
    },
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
    const [x1, y1] = [
      creationZoomFactor * Math.random() * 400 - cameraCoordinate[0],
      creationZoomFactor * Math.random() * 400 - cameraCoordinate[1],
    ];
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
      Math.random() * 400 * creationZoomFactor - cameraCoordinate[0],
      Math.random() * 600 * creationZoomFactor - cameraCoordinate[1],
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

    dispatch(CanvasActions.addLine(newLine, meta));
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
      Math.random() * 400 * creationZoomFactor - cameraCoordinate[0],
      Math.random() * 400 * creationZoomFactor - cameraCoordinate[1],
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
        bottomRight: [
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[0],
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[1],
        ],
        topLeft: [
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[0],
          creationZoomFactor * Math.random() * 400 - cameraCoordinate[1],
        ],
      },
      selectedIds: [],
      type: 'validator-lens',
    };
    dispatch(CanvasActions.addValidatorLens(newValidatorLens));
    dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
  };
  return (
    <>
      <div className="w-full items-center prevent-select overflow-x-scroll overflow-y-hidden  h-14 flex justify-evenly ">
        <Button
          onClick={() => dispatch(CanvasActions.resetState(undefined))}
          variant={'outline'}
          className="px-2 mb-0"
        >
          <Trash />
        </Button>
        <Button
          onClick={() => {
            dispatch(ActionCreators.undo());
          }}
          variant={'outline'}
        >
          <Undo />
        </Button>
        <Button
          onClick={() => {
            dispatch(ActionCreators.redo());
          }}
          variant={'outline'}
        >
          <RedoIcon />
        </Button>
        <div className="border-r  h-full"></div>
        {/* <Button
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
    </Button> */}
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
        <div className="border-r  h-full"></div>

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
                <div
                  key={algo.id}
                  className="flex items-center justify-end p-0 "
                >
                  <DropdownMenuItem
                    className="w-full"
                    onClick={() => {
                      handleAddValidatorLens(algo.id);
                    }}
                  >
                    {algo.title}
                  </DropdownMenuItem>
                </div>
              ) : null
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="border-2 w-32 flex items-center justify-evenly font-bold rounded-md text-sm p-2">
            Presets
            <ChevronDown size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[BINARY_SEARCH_TREE].map((preset) => (
              <div
                key={preset.type}
                className="flex items-center justify-end p-0 "
              >
                <DropdownMenuItem
                  className="w-full"
                  onClick={() => {
                    // add meta later
                    dispatch(CanvasActions.addPreset(preset));
                  }}
                >
                  {preset.type}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlgoHistorySlider
        // or true for debug remove this
        show={(visualization?.length ?? 0) > 0 || showAlgoHistorySlider}
      />
    </>
  );
};

export default CanvasControlBar;
