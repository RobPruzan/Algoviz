'use client';

import {
  SelectedAttachableLine,
  SelectBox,
  DrawTypes,
  PencilCoordinates,
  IO,
  FirstParameter,
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
} from '@/lib/types';
import { isStringAlgorithm } from '../Sort/AlgoComboBox';
import React, { useRef, useState, useEffect, useContext } from 'react';
import * as Draw from '@/lib/Canvas/draw';
import * as Graph from '@/lib/graph';

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
import {
  algorithmsInfo,
  cn,
  getSelectedItems,
  getValidatorLensSelectedIds,
} from '@/lib/utils';
import { useCanvasMouseDown } from '../hooks/useCanvasMouseDown';
import { useCanvasContextMenu } from '../hooks/useCanvasContextMenu';
import { useCanvasMouseMove } from '../hooks/useCanvasMouseMove';
import { useHandleMouseUp } from '../hooks/useCanvasHandleMouseUp';
import { useCanvasWheel } from '../hooks/useCanvasWheel';
import { useApplyAlgorithm } from '../hooks/useApplyAlgorithm';
import { useCanvasKeyDown } from '../hooks/useCanvasKeyDown';
import { useFullyConnect } from '../hooks/useFullyConnect';
import { useServerUpdateShapes } from '../hooks/useServerUpdateShapes';
import { useClearCanvasState } from '../hooks/useClearCanvasState';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CollaborationActions } from '@/redux/slices/colloborationSlice';
import { match } from 'ts-pattern';
import { CodeExecActions } from '@/redux/slices/codeExecSlice';
import { useGetAlgorithmsQuery } from '../hooks/useGetAlgorithmsQuery';
import { socket } from '@/lib/socket/socket-utils';
export type Props = {
  selectedControlBarAction: DrawTypes | null;
  canvasWrapperRef: React.RefObject<HTMLDivElement>;
  notSignedInUserId: string;
  canvasWidth: number | `${string}%`;
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
};

const CanvasDisplay = ({
  selectedControlBarAction,
  canvasWrapperRef,
  selectedValidatorLens,
  notSignedInUserId,
  canvasWidth,
  setSelectedValidatorLens,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectBox, setSelectBox] = useState<SelectBox | null>(null);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);
  const selectedGeometryInfo = useAppSelector(
    (store) => store.canvas.selectedGeometryInfo
  );
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const dispatch = useAppDispatch();
  const {
    attachableLines,
    circles,
    validatorLensContainer,
    pencilCoordinates,
    creationZoomFactor, // need to make this updated on load of playground
    endNode,
    startNode,
    cameraCoordinate,
  } = useAppSelector((store) => store.canvas);
  const { collabInfos } = useAppSelector((store) => store.collaborationState);
  const isMouseDownRef = useRef(false);
  const [selectedAttachableLine, setSelectedAttachableLine] =
    useState<SelectedAttachableLine | null>(null);

  const { visualization, visualizationPointer, error } = useAppSelector(
    (store) => store.codeExec
  );

  if (error) {
    console.error('error', error);
  }
  const isContextMenuActiveRef = useRef(false);

  const visualizationNodes = visualization.at(visualizationPointer);
  const searchParams = useSearchParams();
  const session = useSession();
  session.data?.user;
  const playgroundID = searchParams.get('playground-id');
  const userID = session.data?.user.id ?? notSignedInUserId;
  const selectedAlgorithm = useAppSelector(
    (store) => store.codeExec.selectedAlgorithm
  );
  const meta: Meta = {
    playgroundID,
    userID,
    user: session.data?.user || { id: userID },
  };
  const cursorImgRef = useRef<HTMLImageElement | null>(null);

  const [
    selectedResizeValidatorLensCircle,
    setSelectedResizeValidatorLensCircle,
  ] = useState<SelectedValidatorLensResizeCircle | null>(null);

  useEffect(() => {
    if (!playgroundID) return;
    dispatch({
      type: 'socket/connect',
      meta,
    });
    // need to understand the problem with waiting for the session to load :/
    return () => {
      dispatch({
        type: 'socket/disconnect',
        meta,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundID]);

  useEffect(() => {
    const img = new Image(20, 20);
    img.src = 'joint-cursor.png';

    // if (!cursorImgRef.current) return;
    img.onload = function () {
      // console.log('LOADINGIGIG');
      cursorImgRef.current = img;
    };
  }, []);

  useEffect(() => {
    if (session.status === 'loading') return;
    const item: FirstParameter<typeof CollaborationActions.addCollabInfo> = {
      user: {
        ...session.data?.user,
        id: userID,
      },
      mousePosition: [0, 0],
    };
    dispatch(CollaborationActions.addCollabInfo(item, meta));

    return () => {
      dispatch(CollaborationActions.cleanupCollabInfo());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.user, userID, session.status, dispatch]);

  useEffect(() => {
    if (playgroundID) {
      socket.getConnectedUsers(playgroundID).then((users) => {
        users.forEach((user) =>
          dispatch(CollaborationActions.addUser(user, meta))
        );
      });
    }
    return () => {
      dispatch(CollaborationActions.cleanupCollabInfo());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, playgroundID, session.status]);

  const { selectedAttachableLines, selectedCircles } = getSelectedItems({
    attachableLines,
    circles,
    selectedGeometryInfo,
  });

  const adjacencyList: Record<string, string[]> = [
    ...Graph.getAdjacencyList({
      edges: selectedAttachableLines,
      vertices: selectedCircles,
    }).entries(),
  ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
    return { ...prev, [id]: neighbors };
  }, {});

  const algos = useGetAlgorithmsQuery();

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
    setSelectedValidatorLens,
    setSelectedResizeValidatorLensCircle,
    meta,
  });

  const handleContextMenu = useCanvasContextMenu({
    meta,
    canvasRef,
    setSelectedCircleID,
    isContextMenuActiveRef,
    cameraCoordinate,
  });

  const handleMouseMove = useCanvasMouseMove({
    isMouseDownRef,
    selectBox,
    selectedAttachableLine,
    selectedCircleID,
    selectedControlBarAction,

    setSelectBox,
    meta,
    selectedValidatorLens,
    selectedResizeValidatorLensCircle,
  });

  const handleMouseUp = useHandleMouseUp({
    isMouseDownRef,
    selectBox,
    selectedAttachableLine,
    selectedCircleID,
    selectedControlBarAction,
    meta,
    setSelectBox,
    setSelectedAttachableLine,
    setSelectedCircleID,
    setSelectedValidatorLens,
    selectedValidatorLens,
    setSelectedResizeValidatorLensCircle,
  });

  useCanvasWheel({
    canvasRef,
    meta,
  });

  useApplyAlgorithm();

  const handleKeyDown = useCanvasKeyDown(meta);

  const handleFullyConnect = useFullyConnect(meta);
  const themeInfo = useTheme();
  // don't mutate anything or query/disable them if the playground is is undefined (unless they are joining a playground)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;

    // 1. Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 3. Apply the translation
    ctx.translate(cameraCoordinate[0], cameraCoordinate[1]);

    Draw.optimizeCanvas({
      ctx,
      canvas,
    });

    const dpr = window.devicePixelRatio;
    ctx.scale(dpr, dpr);

    // 1. Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 3. Apply the translation
    ctx.translate(cameraCoordinate[0], cameraCoordinate[1]);
    const selectedIds = getValidatorLensSelectedIds({
      attachableLines,
      circles,
      validatorLensContainer,
    });
    const val = cursorImgRef.current;
    val &&
      collabInfos.forEach((info) => {
        if (info.user.id !== userID) {
          ctx.drawImage(
            val,
            info.mousePosition[0],
            info.mousePosition[1],
            20,
            20
          );
        }
      });

    // ctx.crea;

    // this is so hacky and i need to fix thsi
    // because multiple ids of an obj can be selected, we can only say multiple items are selected if its greater than 3 ids, this can change if new geome try is added
    const thresholdForMultipleItemsSelected = 3;
    if (
      selectedGeometryInfo?.maxPoints &&
      selectedGeometryInfo.selectedIds.length >
        thresholdForMultipleItemsSelected
    ) {
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
      selectedIds,
      visualizationNodes: visualizationNodes ?? [],
      theme: themeInfo.theme ?? 'dark',
      // validationNodes: validation,
      validatorLensContainer,
      endNode,
      startNode,
    });
    Draw.drawValidatorLens({
      ctx,
      selectedIds: selectedGeometryInfo?.selectedIds,
      theme: themeInfo.theme ?? 'dark',
      validatorLensContainer,
      selectedValidatorLens,
      algos: algos.data ?? [],
    });

    // bug, not intrinsic to this procedure, is im setting some ctx state and really caring about implications for future draws
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

    Draw.drawTriangle({ ctx, edges: attachableLines });
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
    collabInfos,
    canvasWidth,
    userID,
    algos.data,
    validatorLensContainer,
    selectedValidatorLens,
    endNode,
    startNode,
    cameraCoordinate,
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
              
              ${selectedControlBarAction === 'pencil' ? 'cursor-crosshair' : ''}
         
                `}
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              tabIndex={-1}
              onContextMenu={handleContextMenu}
              onMouseUp={handleMouseUp}
              onKeyDown={handleKeyDown}
              width={1000}
              height={1000}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem
              onClick={() => {
                if (selectedCircleID) {
                  if (playgroundID) {
                    dispatch(
                      CanvasActions.deleteCircle(selectedCircleID, meta)
                    );
                  } else {
                    dispatch(CanvasActions.deleteCircle(selectedCircleID));
                  }

                  setSelectedCircleID(null);
                }

                if (selectedAttachableLine) {
                  if (playgroundID) {
                    dispatch(
                      CanvasActions.deleteAttachableLine(
                        selectedAttachableLine,
                        meta
                      )
                    );
                  } else {
                    dispatch(
                      CanvasActions.deleteAttachableLine(selectedAttachableLine)
                    );
                  }

                  setSelectedAttachableLine(null);
                }

                if (selectedValidatorLens) {
                  if (playgroundID) {
                    dispatch(
                      CanvasActions.deleteValidatorLens(
                        { validatorLensId: selectedValidatorLens.id },
                        meta
                      )
                    );
                  } else {
                    dispatch(
                      CanvasActions.deleteValidatorLens({
                        validatorLensId: selectedValidatorLens.id,
                      })
                    );
                  }

                  setSelectedValidatorLens(null);
                }
              }}
              inset
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem onClick={handleFullyConnect} inset>
              Fully Connect Nodes
            </ContextMenuItem>
            {selectedValidatorLens && (
              <ContextMenuItem
                onClick={() => {
                  const validatorLens = validatorLensContainer.find(
                    (validatorLens) =>
                      validatorLens.id === selectedValidatorLens.id
                  );
                  if (!validatorLens) return;
                  dispatch(
                    CodeExecActions.setSelectedAlgorithm(validatorLens.algoId)
                  );
                  setSelectedValidatorLens(null);
                }}
                inset
              >
                Show code
              </ContextMenuItem>
            )}

            <ContextMenuItem
              onClick={() => {
                if (selectedCircleID) {
                  dispatch(CanvasActions.setStartNode(selectedCircleID));
                  setSelectedCircleID(null);
                }
              }}
              inset
            >
              Set as starting node
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                if (selectedCircleID) {
                  dispatch(CanvasActions.setEndNode(selectedCircleID));
                  setSelectedCircleID(null);
                }
              }}
              inset
            >
              Set as ending node
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
