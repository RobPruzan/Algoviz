import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import * as Draw from '@/lib/Canvas/draw';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  AlgoType,
  CircleReceiver,
  DrawTypes,
  Edge,
  TaggedDrawTypes,
} from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  ChevronDown,
  CircleDot,
  Loader,
  RedoIcon,
  Trash,
  Undo,
} from 'lucide-react';
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DirectedEdgeIcon } from '@/components/icons/DirectedEdge';
import { UndirectedEdgeIcon } from '@/components/icons/UndirectedEdge';
import { BINARY_SEARCH_TREE } from '@/lib/presets/binary-search-tree';
import { ActionCreators } from 'redux-undo';
import AlgoHistorySlider from '../Sort/AlgoHistorySlider';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';
import { useAddGeometry } from '@/hooks/useAddGeomotry';
import { CanvasContext } from '@/context/CanvasContext';
import { useCanvasRef } from '@/hooks/useCanvasRef';
import { dispatchPreset as dispatchPreset, run, twCond } from '@/lib/utils';
import { useGetPresets } from '@/hooks/useGetPresets';
import { useMeta } from '@/hooks/useMeta';
import { useSearchParams } from 'next/navigation';

type Props = {
  setSelectedControlBarAction: Dispatch<SetStateAction<TaggedDrawTypes | null>>;
  selectedControlBarAction: TaggedDrawTypes | null;
};

const CanvasControlBar = ({
  setSelectedControlBarAction,
  selectedControlBarAction,
}: Props) => {
  const visualization = useAppSelector((store) => store.codeExec.visualization);
  const getPresetsQuery = useGetPresets();

  const [itemChecked, setItemChecked] = useState<null | string>(null);
  const dispatch = useAppDispatch();
  const currentZoomFactor = useAppSelector(
    (store) => store.canvas.present.currentZoomFactor
  );
  const getAlgorithmsQuery = useGetAlgorithmsQuery();
  const meta = useMeta();
  const { handleAddValidatorLens } = useAddGeometry();

  const searchParams = useSearchParams();

  const hasSetRef = useRef(false);
  useEffect(() => {
    const currentPresetName = searchParams.get('preset');

    if (!hasSetRef.current && currentPresetName) {
      const preset = getPresetsQuery.data?.presets.find(
        (p) => p.name === currentPresetName
      );
      if (!preset) {
        return;
      }

      dispatchPreset({
        currentZoomFactor,

        preset,
        // cause next sux
        dispatcher: (data: unknown) =>
          dispatch(CanvasActions.addPreset(data as any, meta)),
      });
      hasSetRef.current = true;
    }
  }, [
    currentZoomFactor,
    dispatch,
    getPresetsQuery.data?.presets,
    meta,
    searchParams,
  ]);
  return (
    <>
      <div className="w-full items-center overflow-x-scroll overflow-y-hidden  h-14 flex justify-evenly ">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger className="ml-2" asChild>
              <Button
                onClick={() => dispatch(CanvasActions.resetState(undefined))}
                variant={'outline'}
                className="px-2 mb-0"
              >
                <Trash />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p>Delete everything</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger className="ml-2" asChild>
              <Button
                onClick={() => {
                  dispatch(ActionCreators.undo());
                }}
                variant={'outline'}
              >
                <Undo />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger className="ml-2" asChild>
              <Button
                onClick={() => {
                  dispatch(ActionCreators.redo());
                }}
                variant={'outline'}
              >
                <RedoIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="border-r  h-full"></div>
        <Toggle
          pressed={selectedControlBarAction?.tag === 'undirected-edge-toggle'}
          // onClick={handleAddUndirectedEdge}
          onPressedChange={(pressed) => {
            if (pressed) {
              setSelectedControlBarAction({
                tag: 'undirected-edge-toggle',
              });
            } else {
              setSelectedControlBarAction(null);
            }
          }}
          variant={'outline'}
          className="px-2 mb-0"
        >
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild>
                {/* <RectangleHorizontal /> */}
                <UndirectedEdgeIcon />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Toggle undirected edge</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Toggle>
        <Toggle
          // onClick={handleAddDirectedEdge}
          onPressedChange={(pressed) => {
            if (pressed) {
              setSelectedControlBarAction({
                tag: 'directed-edge-toggle',
              });
            } else {
              setSelectedControlBarAction(null);
            }
          }}
          pressed={selectedControlBarAction?.tag === 'directed-edge-toggle'}
          variant={'outline'}
          className="px-2 min-w-fit"
        >
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild>
                <DirectedEdgeIcon />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Toggle directed edge</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Toggle>

        <Toggle
          onPressedChange={(pressed) => {
            if (pressed) {
              setSelectedControlBarAction({ tag: 'circle-toggle' });
            } else {
              setSelectedControlBarAction(null);
            }
          }}
          pressed={selectedControlBarAction?.tag === 'circle-toggle'}
          variant={'outline'}
          className="px-2"
        >
          <CircleDot />

          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild></TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Toggle node</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Toggle>
        <div className="border-r  h-full"></div>

        <DropdownMenu>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild>
                <DropdownMenuTrigger
                  className={twCond({
                    cases: [
                      {
                        cond:
                          selectedControlBarAction?.tag ===
                          'validator-lens-select',
                        className: 'bg-secondary',
                      },
                    ],
                    base: 'border-2 w-32 flex items-center justify-evenly font-bold rounded-md text-sm p-2',
                  })}
                >
                  {getAlgorithmsQuery.data?.find(
                    (algoInfo) => algoInfo.id === itemChecked
                  )?.title ?? 'Validators'}
                  <ChevronDown size={20} />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Select validator lens</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuContent>
            {getAlgorithmsQuery.data?.map((algo) =>
              algo.type === AlgoType.Validator ? (
                <div
                  key={algo.algoID}
                  className="flex items-center justify-end p-0 "
                >
                  <DropdownMenuItem
                    className="w-full"
                    onClick={(e) => {
                      setItemChecked(algo.algoID);
                      setSelectedControlBarAction({
                        tag: 'validator-lens-select',
                        state: algo.algoID,
                      });
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
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="ml-2" asChild>
                <DropdownMenuTrigger className="border-2 w-32 flex items-center justify-evenly font-bold rounded-md text-sm p-2">
                  Presets
                  <ChevronDown size={20} />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Select pre-made data-structure</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuContent>
            {getPresetsQuery.data?.presets.map((preset) => (
              <div
                key={preset.type}
                className="flex items-center justify-end p-0 "
              >
                <DropdownMenuItem
                  className="w-full"
                  onClick={() => {
                    dispatchPreset({
                      currentZoomFactor,

                      preset,
                      // cause next sux
                      dispatcher: (data: unknown) =>
                        dispatch(CanvasActions.addPreset(data as any, meta)),
                    });
                  }}
                >
                  {preset.name}
                </DropdownMenuItem>
              </div>
            ))}

            {getPresetsQuery.isLoading && <Loader className="animate-spin" />}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlgoHistorySlider
        // or true for debug remove this
        show={(visualization?.length ?? 0) > 0}
      />
    </>
  );
};

export default CanvasControlBar;
