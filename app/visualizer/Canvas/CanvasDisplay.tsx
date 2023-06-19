'use client';

import {
  Edge,
  CircleConnector,
  CircleReceiver,
  NodeReceiver,
  SelectedAttachableLine,
  SelectBox,
  MaxPoints,
  ALGORITHMS,
  DrawTypes,
  PencilCoordinates,
  SelectedGeometryInfo,
} from '@/lib/types';
import { AlgoComboBox, isStringAlgorithm } from '../Sort/AlgoComboBox';
import React, {
  useRef,
  useState,
  useEffect,
  MouseEvent,
  useCallback,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import * as Draw from '@/lib/Canvas/drawUtils';

import * as Graph from '@/lib/Canvas/canvas';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { P, match } from 'ts-pattern';
import { Button } from '@/components/ui/button';
import { Check, Minus, Plus } from 'lucide-react';
import { SideBarContext } from '@/context/SideBarContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { algorithmsInfo, cn } from '@/lib/utils';
import { DFSActions } from '@/redux/slices/dfsSlice';
import { useCanvasMouseDown } from '../hooks/useCanvasMouseDown';
import { useCanvasContextMenu } from '../hooks/useCanvasContextMenu';
import { useCanvasMouseMove } from '../hooks/useCanvasMouseMove';
import { useHandleMouseUp } from '../hooks/useCanvasHandleMouseUp';
import { useCanvasWheel } from '../hooks/useCanvasWheel';
import { usePlayAlgorithm } from '../hooks/usePlayAAlgorithm';
import { useCanvasKeyDown } from '../hooks/useCanvasKeyDown';
import { useFullyConnect } from '../hooks/useFullyConnect';

export type Props = {
  selectedGeometryInfo: SelectedGeometryInfo | null;
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
  canvasWidth: number | '60%';
  handleDfs: () => void;
  selectedControlBarAction: DrawTypes | null;
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;
};

const CanvasDisplay = ({
  selectedGeometryInfo,
  setSelectedGeometryInfo,
  // handleDfs,
  selectedControlBarAction,
  // setSelectedControlBarAction,
  canvasWidth,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectBox, setSelectBox] = useState<SelectBox | null>(null);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);
  const [pencilCoordinates, setPencilCoordinates] = useState<PencilCoordinates>(
    {
      drawingCoordinates: [],
      drawnCoordinates: [],
    }
  );
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const dispatch = useAppDispatch();
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  const isMouseDownRef = useRef(false);
  const [selectedAttachableLine, setSelectedAttachableLine] =
    useState<SelectedAttachableLine | null>(null);
  const { visited: dfsVisited, visitedPointer } = useAppSelector(
    (store) => store.dfs
  );
  const dfsVisitedNodes = dfsVisited.slice(0, visitedPointer);
  const isContextMenuActiveRef = useRef(false);

  const handleMouseDown = useCanvasMouseDown({
    canvasRef,
    isMouseDownRef,
    selectBox,
    selectedControlBarAction,
    selectedGeometryInfo,
    setSelectBox,
    setSelectedAttachableLine,
    setSelectedCircleID,
    setSelectedGeometryInfo,
  });

  const handleContextMenu = useCanvasContextMenu({
    canvasRef,
    setSelectedCircleID,
    setSelectedGeometryInfo,
    isContextMenuActiveRef,
  });

  const handleMouseMove = useCanvasMouseMove({
    isMouseDownRef,
    selectBox,
    selectedAttachableLine,
    selectedCircleID,
    selectedControlBarAction,
    selectedGeometryInfo,
    setPencilCoordinates,
    setSelectBox,
    setSelectedGeometryInfo,
  });

  const handleMouseUp = useHandleMouseUp({
    isMouseDownRef,
    selectBox,
    selectedAttachableLine,
    selectedCircleID,
    selectedControlBarAction,
    setPencilCoordinates,
    setSelectBox,
    setSelectedAttachableLine,
    setSelectedCircleID,
  });

  useCanvasWheel({
    canvasRef,
    setPencilCoordinates,
    setSelectedGeometryInfo,
  });

  usePlayAlgorithm();

  const handleKeyDown = useCanvasKeyDown({
    selectedGeometryInfo,
    setSelectedGeometryInfo,
  });

  const handleFullyConnect = useFullyConnect({
    selectedGeometryInfo,
    setSelectedGeometryInfo,
  });
  // const intervalId = useRef<null | NodeJS.Timer>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;

    Draw.optimizeCanvas({
      ctx,
      canvas,
    });

    if (selectedGeometryInfo?.maxPoints) {
      Draw.drawBox({
        ctx,
        box: {
          p1: selectedGeometryInfo?.maxPoints.closestToOrigin,
          p2: selectedGeometryInfo?.maxPoints.furthestFromOrigin,
        },
      });
    }
    // first written, first rendered
    // meaning items written later will layer over the previous

    Draw.drawNodes({
      ctx,
      nodes: circles,
      selectedCircleID,
      selectedIds: selectedGeometryInfo?.selectedIds,
      dfsVisitedNodes,
    });

    if (selectBox) {
      Draw.drawBox({
        ctx,
        box: selectBox,
        fill: true,
      });
    }

    Draw.drawEdges({
      ctx,
      edges: attachableLines,
      selectedIds: selectedGeometryInfo?.selectedIds,
      selectedAttachableLine,
    });

    Draw.drawEdgeConnectors({
      ctx,
      edges: attachableLines,
    });

    Draw.drawNodeReceivers({
      ctx,
      nodes: circles,
    });

    if (pencilCoordinates) {
      Draw.drawPencil({
        ctx,
        pencilCoordinates,
      });
    }
  }, [
    circles,
    attachableLines,
    selectBox,
    selectedCircleID,
    selectedAttachableLine,
    selectedGeometryInfo?.selectedIds,
    selectedGeometryInfo?.maxPoints,
    dfsVisitedNodes,
    pencilCoordinates,
  ]);

  return (
    <>
      <ContextMenu>
        <ContextMenu>
          <ContextMenuTrigger>
            <canvas
              className={`
              ${selectedControlBarAction === 'pencil' ? 'cursor-crosshair' : ''}
               bg-fancy `}
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              tabIndex={-1}
              onContextMenu={handleContextMenu}
              onMouseUp={handleMouseUp}
              width={window.innerWidth}
              onKeyDown={handleKeyDown}
              height={window.innerHeight}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem
              onClick={(e) => {
                if (selectedCircleID) {
                  dispatch(CanvasActions.deleteCircle(selectedCircleID));

                  setSelectedCircleID(null);
                }
              }}
              inset
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem onClick={handleFullyConnect} inset>
              Fully Connect Nodes
            </ContextMenuItem>

            <ContextMenuSub>
              <ContextMenuSubTrigger inset>Algorithms</ContextMenuSubTrigger>
              <ContextMenuSubContent className=" ">
                <Command>
                  <CommandInput placeholder="Search Sorting Algorithm..." />
                  <CommandEmpty>No algorithm found.</CommandEmpty>
                  <CommandGroup>
                    {algorithmsInfo.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        onSelect={(currentValue) => {
                          if (!isStringAlgorithm(currentValue)) return;
                          setSideBarState((prev) => ({
                            ...prev,
                            algorithm: currentValue,
                          }));
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            sideBarState.algorithm === framework.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
                <Button className="bg-secondary mt-3 ring-0 hover:bg-primary hover:border hover:border-secondary w-full">
                  Apply algorithm
                </Button>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>

        <ContextMenuTrigger></ContextMenuTrigger>
      </ContextMenu>
    </>
  );
};

export default CanvasDisplay;
