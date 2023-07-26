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
  Percentage,
} from '@/lib/types';
import { isStringAlgorithm } from '../Sort/AlgoComboBox';
import React, { useRef, useState, useEffect, useContext } from 'react';
import * as Draw from '@/lib/Canvas/draw';
import * as Graph from '@/lib/graph';

import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CanvasActions, Meta, ObjectState } from '@/redux/slices/canvasSlice';
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
import { socketManager } from '@/lib/socket/socket-utils';
import { useMeta } from '@/hooks/useMeta';
import { useInterval } from '@/hooks/useInterval';
export type Props = {
  selectedControlBarAction: DrawTypes | null;
  canvasWrapperRef: React.RefObject<HTMLDivElement>;

  canvasWidth: number;
  canvasHeight: number;
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
};

const CanvasDisplay = ({
  selectedControlBarAction,
  canvasWrapperRef,
  selectedValidatorLens,
  canvasHeight,
  canvasWidth,
  setSelectedValidatorLens,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notSignedInUserID = useAppSelector(
    (store) => store.canvas.present.notSignedInUserID
  );
  const [selectBox, setSelectBox] = useState<SelectBox | null>(null);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);
  const selectedGeometryInfo = useAppSelector(
    (store) => store.canvas.present.selectedGeometryInfo
  );
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const dispatch = useAppDispatch();
  const {
    attachableLines,
    circles,
    validatorLensContainer,
    pencilCoordinates,
    currentZoomFactor, // need to make this updated on load of playground
    endNode,
    startNode,
    cameraCoordinate,
  } = useAppSelector((store) => store.canvas.present);
  const { collabInfos, ownerID } = useAppSelector(
    (store) => store.collaborationState
  );

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

  const searchParams = useSearchParams();
  const session = useSession();
  session.data?.user;
  const playgroundID = searchParams.get('playground-id');

  const userID = session.data?.user.id ?? notSignedInUserID;
  const selectedAlgorithm = useAppSelector(
    (store) => store.codeExec.selectedAlgorithm
  );

  const isInitialized = !!playgroundID && session.status !== 'loading';

  const baseMeta = useMeta();
  const meta: Meta = {
    ...baseMeta,
    realCoordinateCenter: [
      cameraCoordinate[0] + canvasWidth / 2,
      cameraCoordinate[1] + canvasHeight / 2,
    ],
  };

  const cursorImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    // putting a condition here of session.status === 'loading' still breaks even with the updated cleanup logic

    if (!playgroundID) return;

    dispatch({
      type: 'socket/connect',
      meta,
    });
    // need to understand the problem with waiting for the session to load :/
    return () => {
      if (!playgroundID) return;
      console.log('disconeccting');
      dispatch({
        type: 'socket/disconnect',
        meta,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundID]);
  const objects: ObjectState = {
    circles,
    attachableLines,
    validatorLensContainer,
    pencilCoordinates,
  };

  const [
    selectedResizeValidatorLensCircle,
    setSelectedResizeValidatorLensCircle,
  ] = useState<SelectedValidatorLensResizeCircle | null>(null);

  useEffect(() => {
    const img = new Image(20, 20);
    img.src = 'joint-cursor.png';

    // if (!cursorImgRef.current) return;
    img.onload = function () {
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

    // return () => {
    //   dispatch(CollaborationActions.cleanupCollabInfo());
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.user, userID, session.status, dispatch]);

  useInterval(() => {
    if (ownerID !== userID || !playgroundID) return;
    socketManager.emitSynchronizeObjectState(
      objects,
      cameraCoordinate,
      currentZoomFactor,
      playgroundID
    );
  }, 5000);

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
    cameraCoordinate,
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
  });

  useApplyAlgorithm();

  const handleKeyDown = useCanvasKeyDown(meta);

  const handleFullyConnect = useFullyConnect(meta);
  const themeInfo = useTheme();
  // don't mutate anything or query/disable them if the playground is is undefined (unless they are joining a playground)
  useEffect(() => {
    const visualizationNodes = visualization?.at(visualizationPointer);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;

    // 1. Clear the canvas
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // // 2. Reset the transformation matrix
    // ctx.setTransform(1, 0, 0, 1, 0, 0);

    // // 3. Apply the translation
    // ctx.translate(cameraCoordinate[0], cameraCoordinate[1]);

    Draw.updateCanvasEnvironment({
      ctx,
      canvas,
      cameraPosition: {
        x: cameraCoordinate[0],
        y: cameraCoordinate[1],
      },
    });

    // const dpr = window.devicePixelRatio;
    // ctx.scale(dpr, dpr);

    // // 1. Clear the canvas
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // // 2. Reset the transformation matrix
    // ctx.setTransform(1, 0, 0, 1, 0, 0);

    // // 3. Apply the translation
    // ctx.translate(cameraCoordinate[0], cameraCoordinate[1]);

    const selectedIDs = Object.keys(
      [
        ...Graph.getAdjacencyList({
          edges: selectedAttachableLines,
          vertices: selectedCircles,
        }).entries(),
      ].reduce<Record<string, string[]>>((prev, [id, neighbors]) => {
        return { ...prev, [id]: neighbors };
      }, {})
    );
    const val = cursorImgRef.current;
    val &&
      collabInfos.forEach((info) => {
        if (info.user.id !== userID) {
          // ctx.drawImage(
          //   val,
          //   info.mousePosition[0],
          //   info.mousePosition[1],
          //   20,
          //   20
          // );
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
      selectedIDs,
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
    canvasHeight,
    selectedAttachableLines,
    selectedCircles,
    visualization,
    visualizationPointer,
  ]);

  return (
    <>
      <ContextMenu>
        <ContextMenu>
          <ContextMenuTrigger>
            <canvas
              style={{
                width: canvasWidth,
                height: canvasHeight,
              }}
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
              width={canvasWidth}
              height={canvasHeight}
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
