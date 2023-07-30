import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

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
import React, {
  Dispatch,
  ElementRef,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import * as Utils from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CodeExecActions } from '@/redux/slices/codeExecSlice';
import { DirectedEdgeIcon } from '@/components/icons/DirectedEdge';
import { UndirectedEdgeIcon } from '@/components/icons/UndirectedEdge';
import { BINARY_SEARCH_TREE } from '@/lib/presets/binary-search-tree';
import { ActionCreators } from 'redux-undo';
import AlgoHistorySlider from '../Sort/AlgoHistorySlider';
import { useShapeUpdateMutation } from '@/hooks/useShapeUpdateMutation';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';
import { useAddGeometry } from '@/hooks/useAddGeomotry';
type Props = {
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;
};

const CanvasControlBar = ({ setSelectedControlBarAction }: Props) => {
  const [showAlgoHistorySlider, setShowAlgoHistorySlider] = useState(false);
  const [itemChecked, setItemChecked] = useState<null | string>(null);
  const notSignedInUserID = useAppSelector(
    (store) => store.canvas.present.notSignedInUserID
  );

  const visualization = useAppSelector((store) => store.codeExec.visualization);
  // const canvasPicked = useAppSelector((store) => ({
  //   attachableLines: store.canvas.present.attachableLines,
  //   circles: store.canvas.present.circles,
  // }));

  const dispatch = useAppDispatch();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

  // fix all these hard coded numbers and random spawn points
  // move random spawn points to slight distribution around middle of canvas
  // or when I have time do so you select then click on the screen
  const {
    handleAddCircle,
    handleAddDirectedEdge,
    handleAddUndirectedEdge,
    handleAddValidatorLens,
  } = useAddGeometry();
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
        <Toggle
          onClick={handleAddUndirectedEdge}
          variant={'outline'}
          className="px-2 mb-0"
        >
          {/* <RectangleHorizontal /> */}
          <UndirectedEdgeIcon />
        </Toggle>

        <Toggle
          onClick={handleAddDirectedEdge}
          variant={'outline'}
          className="px-2 min-w-fit"
        >
          <DirectedEdgeIcon />
        </Toggle>
        <Toggle
          onClick={() => {
            setSelectedControlBarAction('circle-toggle');
            handleAddCircle();
          }}
          variant={'outline'}
          className="px-2"
        >
          <CircleDot />
        </Toggle>

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
