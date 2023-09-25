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
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { ChevronDown, CircleDot, RedoIcon, Trash, Undo } from 'lucide-react';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { DirectedEdgeIcon } from '@/components/icons/DirectedEdge';
import { UndirectedEdgeIcon } from '@/components/icons/UndirectedEdge';
import { BINARY_SEARCH_TREE } from '@/lib/presets/binary-search-tree';
import { ActionCreators } from 'redux-undo';
import AlgoHistorySlider from '../Sort/AlgoHistorySlider';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';
import { useAddGeometry } from '@/hooks/useAddGeomotry';
import { CanvasContext } from '@/context/CanvasContext';
import { useCanvasRef } from '@/hooks/useCanvasRef';
import { run, twCond } from '@/lib/utils';
import { useGetPresets } from '@/hooks/useGetPresets';
import { useMeta } from '@/hooks/useMeta';

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
        <Toggle
          pressed={selectedControlBarAction?.tag === 'undirected-edge-toggle'}
          // onClick={handleAddUndirectedEdge}
          onPressedChange={(pressed) => {
            if (pressed) {
              setSelectedControlBarAction({ tag: 'undirected-edge-toggle' });
            } else {
              setSelectedControlBarAction(null);
            }
          }}
          variant={'outline'}
          className="px-2 mb-0"
        >
          {/* <RectangleHorizontal /> */}
          <UndirectedEdgeIcon />
        </Toggle>

        <Toggle
          // onClick={handleAddDirectedEdge}
          onPressedChange={(pressed) => {
            if (pressed) {
              setSelectedControlBarAction({ tag: 'directed-edge-toggle' });
            } else {
              setSelectedControlBarAction(null);
            }
          }}
          pressed={selectedControlBarAction?.tag === 'directed-edge-toggle'}
          variant={'outline'}
          className="px-2 min-w-fit"
        >
          <DirectedEdgeIcon />
        </Toggle>
        <Toggle
          // onClick={() => {
          //   setSelectedControlBarAction('circle-toggle');
          //   // handleAddCircle();

          // }}
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
        </Toggle>

        <div className="border-r  h-full"></div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={twCond({
              cases: [
                {
                  cond:
                    selectedControlBarAction?.tag === 'validator-lens-select',
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
          <DropdownMenuTrigger className="border-2 w-32 flex items-center justify-evenly font-bold rounded-md text-sm p-2">
            Presets
            <ChevronDown size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {getPresetsQuery.data?.presets.map((preset) => (
              <div
                key={preset.type}
                className="flex items-center justify-end p-0 "
              >
                <DropdownMenuItem
                  className="w-full"
                  onClick={() => {
                    const offset = String(Date.now());
                    const newZoom = preset.zoomAmount * currentZoomFactor;
                    // need to do a mouse centered zoom on the coordinates for that to work
                    // everything also needs to be integrated to the selected item flow, get the mouse pos, mouse center zoom every single item and then place, no other odd scaling. Works for the circle, doesn't work for the line since before we just hardcoded it
                    dispatch(
                      CanvasActions.addPreset(
                        {
                          type: preset.type,
                          // offset mapping is necessary to allow multiple presets to be made in the same playground
                          attachableLines: (preset.lines as Edge[]).map(
                            (line) => ({
                              ...line,
                              id: line.id + offset,
                              // x1: line.x1 * newZoom,
                              // x2: line.x2 * newZoom,
                              // y1: line.y1 * newZoom,
                              // y2: line.y2 * newZoom,
                              width: line.width * newZoom,
                              attachNodeOne: {
                                ...line.attachNodeOne,
                                // center: [
                                //   line.attachNodeOne.center[0] * newZoom,
                                //   line.attachNodeOne.center[1] * newZoom,
                                // ],
                                id: line.attachNodeOne.id + offset,
                                radius: line.attachNodeOne.radius * newZoom,
                                connectedToId:
                                  line.attachNodeOne.connectedToId + offset,
                              },
                              attachNodeTwo: {
                                ...line.attachNodeTwo,
                                // center: [
                                //   line.attachNodeTwo.center[0] * newZoom,
                                //   line.attachNodeTwo.center[1] * newZoom,
                                // ],
                                radius: line.attachNodeTwo.radius * newZoom,
                                id: line.attachNodeTwo.id + offset,
                                connectedToId:
                                  line.attachNodeTwo.connectedToId + offset,
                              },
                            })
                          ),
                          circles: (preset.circles as CircleReceiver[]).map(
                            (circle) => ({
                              ...circle,
                              id: circle.id + offset,

                              radius: circle.radius * newZoom,
                              nodeReceiver: {
                                ...circle.nodeReceiver,
                                radius: circle.nodeReceiver.radius * newZoom,
                                id: circle.nodeReceiver.id + offset,
                                attachedIds:
                                  circle.nodeReceiver.attachedIds.map(
                                    (nrID: string) => nrID + offset
                                  ),
                              },
                            })
                          ),
                        },
                        meta
                      )
                    );
                  }}
                >
                  {preset.name}
                </DropdownMenuItem>
              </div>
            ))}
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
