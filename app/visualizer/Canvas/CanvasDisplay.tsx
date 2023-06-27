'use client';

import {
  SelectedAttachableLine,
  SelectBox,
  DrawTypes,
  PencilCoordinates,
  CircleReceiver,
  Edge,
  IO,
  UntypedData,
} from '@/lib/types';
import { isStringAlgorithm } from '../Sort/AlgoComboBox';
import React, { useRef, useState, useEffect, useContext } from 'react';
import * as Draw from '@/lib/Canvas/drawUtils';

import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';
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
import useDebounce from '@/hooks/useDebounce';
import { useShapeUpdateMutation } from '../hooks/useShapeUpdateMutation';
import { useServerUpdateShapes } from '../hooks/useServerUpdateShapes';
import { useClearCanvasState } from '../hooks/useClearCanvasState';
import { useTheme } from 'next-themes';
import { io } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SocketAction } from '@/lib/types';
export type Props = {
  selectedControlBarAction: DrawTypes | null;
  socketRef: ReturnType<typeof useRef<IO>>;
  notSignedInUserId: string;
  canvasWidth: number | `${string}%`;
};

const CanvasDisplay = ({
  selectedControlBarAction,
  socketRef,
  notSignedInUserId,
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
  const selectedGeometryInfo = useAppSelector(
    (store) => store.canvas.selectedGeometryInfo
  );
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const dispatch = useAppDispatch();
  const { attachableLines, circles, creationZoomFactor } = useAppSelector(
    (store) => store.canvas
  );
  const isMouseDownRef = useRef(false);
  const [selectedAttachableLine, setSelectedAttachableLine] =
    useState<SelectedAttachableLine | null>(null);
  const { visualization, visualizationPointer } = useAppSelector(
    (store) => store.codeExec
  );
  const isContextMenuActiveRef = useRef(false);

  const visualizationNodes = visualization.at(visualizationPointer);
  const searchParams = useSearchParams();
  const session = useSession();
  const playgroundID = searchParams.get('playground-id');
  const userID = session.data?.user.id ?? notSignedInUserId;

  const meta: Meta = { playgroundID, userID };

  useEffect(() => {
    // connects to playground socket room
    dispatch({
      type: 'socket/connect',
      meta,
    });
  }, []);
  // useEffect(() => {
  //   const joinPlayground = () => {
  //     if (!playgroundID) {
  //       return;
  //     }
  //     socketRef.current?.emit('join playground', playgroundID);
  //   };
  //   // why cant i use the env var here????????? its the same thing
  //   socketRef.current = io('http://localhost:8080');

  //   socketRef.current.on('connect', () => {
  //     console.log('connected to playground', playgroundID);
  //     joinPlayground();
  //   });
  //   socketRef.current.on('update', (data: UntypedData) => {
  //     switch (data.type) {
  //       case 'circleReciever':
  //         if (
  //           data.senderID !== session.data?.user.id &&
  //           data.senderID !== notSignedInUserIdRef.current
  //         ) {
  //           // console.log('dispatching update');
  //           dispatch(CanvasActions.replaceCircle(data.state));
  //         }
  //       case 'edge':
  //         dispatch(CanvasActions.replaceAttachableLine(data.state));
  //     }
  //     // dispatch
  //   });

  //   socketRef.current.on('create', (data: UntypedData) => {
  //     switch (data.type) {
  //       case 'circleReciever':
  //         if (
  //           data.senderID !== session.data?.user.id &&
  //           data.senderID !== notSignedInUserIdRef.current
  //         ) {
  //           console.log();
  //           dispatch(CanvasActions.addCircle(data.state));
  //         }

  //       case 'edge':
  //         console.log('edge create data', data);
  //       // dispatch(CanvasActions.addLine(data.state));
  //     }
  //   });
  // }, [playgroundID]);

  // useEffect(() => {
  //   if (playgroundID) {
  //     sendUpdate({
  //       room: playgroundID,
  //       type: 'circleReciever',
  //       state: circles,
  //     });
  //   }
  // }, [circles]);
  // useEffect(() => {
  //   if (playgroundID) {
  //     sendUpdate({ room: playgroundID, type: 'edge', state: attachableLines });
  //   }
  // }, [attachableLines]);

  useClearCanvasState(meta);

  useServerUpdateShapes();

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
    socketRef,
    meta,
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
    meta,
  });

  useApplyAlgorithm();

  const handleKeyDown = useCanvasKeyDown();

  const handleFullyConnect = useFullyConnect(meta);
  const themeInfo = useTheme();
  // dont mutate anything or query/disable them if the playground is is undefined (unless they are joining a playground)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;
    ctx.globalAlpha = 0.5; // Set the transparency
    Draw.optimizeCanvas({
      ctx,
      canvas,
    });
    // this is so hacky and i need to fix this
    const thresholdForMultipleItemsSelected = 3;
    if (
      selectedGeometryInfo?.maxPoints &&
      selectedGeometryInfo.selectedIds.length >
        thresholdForMultipleItemsSelected
    ) {
      console.log(
        'the selected geomotry info',
        selectedGeometryInfo.selectedIds
      );
      Draw.drawBox({
        ctx,
        box: {
          p1: selectedGeometryInfo?.maxPoints.closestToOrigin,
          p2: selectedGeometryInfo?.maxPoints.furthestFromOrigin,
        },
        theme: themeInfo.theme ?? 'dark',
      });
    }
    Draw.drawEdges({
      ctx,
      edges: attachableLines,
      selectedIds: selectedGeometryInfo?.selectedIds,
      selectedAttachableLine,
    });
    // first written, first rendered
    // meaning items written later will layer over the previous

    Draw.drawNodes({
      ctx,
      nodes: circles,
      selectedCircleID,
      selectedIds: selectedGeometryInfo?.selectedIds,
      dfsVisitedNodes: visualizationNodes ?? [],
      theme: themeInfo.theme ?? 'dark',
    });

    if (selectBox) {
      Draw.drawBox({
        ctx,
        box: selectBox,
        fill: true,
        theme: themeInfo.theme ?? 'dark',
      });
    }

    Draw.drawEdgeConnectors({
      ctx,
      edges: attachableLines,
    });

    Draw.drawNodeReceivers({
      ctx,
      nodes: circles,
      theme: themeInfo.theme ?? 'dark',
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
    themeInfo.theme,
    // need to add the canvasheight to redraw on for the resizeable
    canvasWidth,
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
                  if (playgroundID) {
                    dispatch(
                      CanvasActions.deleteCircle(selectedCircleID, {
                        playgroundID,
                        userID,
                      })
                    );
                  } else {
                    dispatch(CanvasActions.deleteCircle(selectedCircleID));
                  }

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
                <Button className="bg-secondary mt-3 ring-0 hover: hover:border-2 hover:border-secondary w-full">
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
