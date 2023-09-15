import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import * as Draw from '@/lib/Canvas/draw';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AlgoType, DrawTypes, TaggedDrawTypes } from '@/lib/types';
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

type Props = {
  setSelectedControlBarAction: Dispatch<SetStateAction<TaggedDrawTypes | null>>;
  selectedControlBarAction: TaggedDrawTypes | null;
};
const DEFAULT_SELECT_ITEMS_LEFT = 1;
const CanvasControlBar = ({
  setSelectedControlBarAction,
  selectedControlBarAction,
}: Props) => {
  const visualization = useAppSelector((store) => store.codeExec.visualization);
  // const { cameraCoordinate, currentZoomFactor } = useAppSelector(
  //   (store) => store.canvas.present
  // );

  // const canvasRef = useCanvasRef();

  const [itemChecked, setItemChecked] = useState<null | string>(null);
  const dispatch = useAppDispatch();

  const getAlgorithmsQuery = useGetAlgorithmsQuery();

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
                      console.log('fodksjaf', e);
                      setSelectedControlBarAction({
                        tag: 'validator-lens-select',
                        state: algo.algoID,
                      });

                      // const canvas = canvasRef?.current;
                      // if (!canvas) return;
                      // const rect = canvas.getBoundingClientRect();
                      // const x = e.clientX - rect.left - cameraCoordinate[0];
                      // const y = e.clientY - rect.top - cameraCoordinate[1];
                      // console.log('da fook', [x, y]);

                      // const cord = Draw.viewToWorld(
                      //   e,
                      //   canvasRef,
                      //   cameraCoordinate
                      // );

                      // const actualCord: [number, number] = [
                      //   Math.random() * 400 * currentZoomFactor -
                      //     cameraCoordinate[0],
                      //   Math.random() * 400 * currentZoomFactor -
                      //     cameraCoordinate[1],
                      // ];
                      // handleAddValidatorLens(crypto.randomUUID(), actualCord);
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
        show={(visualization?.length ?? 0) > 0}
      />
    </>
  );
};

export default CanvasControlBar;
