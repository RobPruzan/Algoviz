'use client';

import {
  SelectedAttachableLine,
  SelectBox,
  DrawTypes,
  PencilCoordinates,
  SelectedGeometryInfo,
  Percentage,
} from '@/lib/types';
import { isStringAlgorithm } from '../Sort/AlgoComboBox';
import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';
import * as Draw from '@/lib/Canvas/drawUtils';

import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { SideBarContext } from '@/context/SideBarContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { algorithmsInfo, cn } from '@/lib/utils';
import { useCanvasMouseDown } from '../hooks/useCanvasMouseDown';
import { useCanvasContextMenu } from '../hooks/useCanvasContextMenu';
import { useCanvasMouseMove } from '../hooks/useCanvasMouseMove';
import { useHandleMouseUp } from '../hooks/useCanvasHandleMouseUp';
import { useCanvasWheel } from '../hooks/useCanvasWheel';
import { useApplyAlgorithm } from '../hooks/useApplyAlgorithm';
import { useCanvasKeyDown } from '../hooks/useCanvasKeyDown';
import { useFullyConnect } from '../hooks/useFullyConnect';

export type Props = {
  canvasWidth: number | Percentage;
  handleDfs: () => void;
  selectedControlBarAction: DrawTypes | null;
  setSelectedControlBarAction: Dispatch<SetStateAction<DrawTypes | null>>;
};

const CanvasDisplay = ({ selectedControlBarAction, canvasWidth }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectBox, setSelectBox] = useState<SelectBox | null>(null);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);
  const [pencilCoordinates, setPencilCoordinates] = useState<PencilCoordinates>(
    {
      drawingCoordinates: [],
      drawnCoordinates: [],
    }
  );
  const selectedGeometryInfo = useAppSelector(
    (store) => store.canvas.selectedGeometryInfo
  );
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const dispatch = useAppDispatch();
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  const isMouseDownRef = useRef(false);
  const [selectedAttachableLine, setSelectedAttachableLine] =
    useState<SelectedAttachableLine | null>(null);
  const { visualization, visualizationPointer } = useAppSelector(
    (store) => store.codeExec
  );

  const visualizationNodes = visualization.at(visualizationPointer);
  const isContextMenuActiveRef = useRef(false);

  const handleMouseDown = useCanvasMouseDown({
    canvasRef,
    isMouseDownRef,
    selectBox,
    selectedControlBarAction,
    setSelectBox,
    setSelectedAttachableLine,
    setSelectedCircleID,
  });

  const handleContextMenu = useCanvasContextMenu({
    canvasRef,
    setSelectedCircleID,
    isContextMenuActiveRef,
  });

  const handleMouseMove = useCanvasMouseMove({
    isMouseDownRef,
    selectBox,
    selectedAttachableLine,
    selectedCircleID,
    selectedControlBarAction,
    setPencilCoordinates,
    setSelectBox,
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
  });

  useApplyAlgorithm();

  const handleKeyDown = useCanvasKeyDown();

  const handleFullyConnect = useFullyConnect();

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
      dfsVisitedNodes: visualizationNodes ?? [],
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
    pencilCoordinates,
    visualizationNodes,
  ]);

  return (
    <>
      <ContextMenu>
        <ContextMenu>
          <ContextMenuTrigger>
            <canvas
              onMouseLeave={() => {
                isMouseDownRef.current = false;
              }}
              className={`
              outline-none 
              ${
                selectedControlBarAction === 'pencil' ? 'cursor-crosshair' : ''
              }`}
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              tabIndex={-1}
              onContextMenu={handleContextMenu}
              onMouseUp={handleMouseUp}
              width={typeof window !== 'undefined' ? window.innerWidth : 1000}
              onKeyDown={handleKeyDown}
              height={typeof window !== 'undefined' ? window.innerHeight : 1000}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem
              onClick={() => {
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
                <Button className="bg-secondary mt-3 ring-0 hover:bg-primary hover:border-2 hover:border-secondary w-full">
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
