'use client';

import {
  SelectedAttachableLine,
  SelectBox,
  DrawTypes,
  FirstParameter,
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
  TaggedDrawTypes,
  RealMessedUpAlgoType,
} from '@/lib/types';
import React, {
  useRef,
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
  useMemo,
} from 'react';
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

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { getCode, getSelectedItems, run } from '@/lib/utils';

import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CollaborationActions } from '@/redux/slices/colloborationSlice';
import { match } from 'ts-pattern';
import { CodeExecActions } from '@/redux/slices/codeExecSlice';
import { socketManager } from '@/lib/socket/socket-utils';
import { useMeta } from '@/hooks/useMeta';
import { useInterval } from '@/hooks/useInterval';
import { useApplyAlgorithm } from '@/hooks/useApplyAlgorithm';
import { useCanvasContextMenu } from '@/hooks/useCanvasContextMenu';
import { useHandleMouseUp } from '@/hooks/useCanvasHandleMouseUp';
import { useCanvasKeyDown } from '@/hooks/useCanvasKeyDown';
import { useCanvasMouseDown } from '@/hooks/useCanvasMouseDown';
import { useCanvasMouseMove } from '@/hooks/useCanvasMouseMove';
import { useCanvasWheel } from '@/hooks/useCanvasWheel';
import { useClearCanvasState } from '@/hooks/useClearCanvasState';
import { useFullyConnect } from '@/hooks/useFullyConnect';
import { useGetAlgorithmsQuery } from '@/hooks/useGetAlgorithmsQuery';
import { useServerUpdateShapes } from '@/hooks/useServerUpdateShapes';
import { useAddGeometry } from '@/hooks/useAddGeomotry';
import { useCanvasRef } from '@/hooks/useCanvasRef';
import { Algorithm } from '@prisma/client';
import { useIsGodMode } from '@/hooks/isGodMode';
import {
  PresetType,
  useSaveAsPresetMutation,
} from '@/hooks/useSaveAsPresetMutation';
import { useGetSelectedItems } from '@/hooks/useGetSelectedItems';
import { useGetPresets } from '@/hooks/useGetPresets';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
export type Props = {
  selectedControlBarAction: TaggedDrawTypes | null;
  setSelectedControlBarAction: Dispatch<SetStateAction<TaggedDrawTypes | null>>;
  canvasWrapperRef: React.RefObject<HTMLDivElement>;

  canvasWidth: number;
  canvasHeight: number;
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  setUserAlgorithm: React.Dispatch<React.SetStateAction<RealMessedUpAlgoType>>;
  userAlgorithm: RealMessedUpAlgoType;
  selectedValidatorLens: SelectedValidatorLens | null;
};

const CanvasDisplay = ({
  selectedControlBarAction,
  setSelectedControlBarAction,
  canvasWrapperRef,
  userAlgorithm,
  selectedValidatorLens,
  canvasHeight,
  canvasWidth,
  setUserAlgorithm,
  setSelectedValidatorLens,
}: Props) => {
  const canvasRef = useCanvasRef();
  const notSignedInUserID = useAppSelector(
    (store) => store.canvas.present.notSignedInUserID
  );
  const [selectBox, setSelectBox] = useState<SelectBox | null>(null);
  const [selectedCircleID, setSelectedCircleID] = useState<string | null>(null);
  const previousMousePositionRef = useRef<[number, number]>();

  const lastMouseDownTime = useRef(0);
  const [presetName, setPresetName] = useState('');
  const selectedGeometryInfo = useAppSelector(
    (store) => store.canvas.present.selectedGeometryInfo
  );
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
  // const startNode = useAppSelector((store) => store.canvas.present.startNode);
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
  const saveAsPresetMutation = useSaveAsPresetMutation();
  const selectedValues = useGetSelectedItems();
  const isGodMode = useIsGodMode();
  const [tempCircleValue, setTempCircleValue] = useState('');
  const currentCircleValue = useMemo(() => {
    return circles.find((c) => c.id === selectedCircleID)?.value;
  }, [circles, selectedCircleID]);
  useEffect(() => {
    setTempCircleValue(currentCircleValue ? String(currentCircleValue) : '');
  }, [currentCircleValue]);
  const baseMeta = useMeta();
  const meta: Meta = {
    ...baseMeta,
    realCoordinateCenter: [
      cameraCoordinate[0] + canvasWidth / 2,
      cameraCoordinate[1] + canvasHeight / 2,
    ],
  };
  const { toast } = useToast();
  // const isGod = session.data?.user.email === process.env.NEXT_PUBLIC_GOD_MODE;

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
    if (session.status === 'loading' || !userID) return;
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

  const getPresetsQuery = useGetPresets();
  const presetCode = useAppSelector((store) => store.canvas.present.presetCode);

  const algos = useGetAlgorithmsQuery();

  useEffect(
    () => () => {
      dispatch(CodeExecActions.cleanUp());
    },
    [dispatch]
  );

  useClearCanvasState(meta);

  useServerUpdateShapes();

  const handleMouseDown = useCanvasMouseDown({
    isMouseDownRef,
    selectBox,
    selectedControlBarAction,
    setSelectBox,
    setSelectedAttachableLine,
    setSelectedCircleID,
    setSelectedValidatorLens,
    setSelectedResizeValidatorLensCircle,
    lastMouseDownTime,
    meta,
  });

  const handleContextMenu = useCanvasContextMenu({
    meta,

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
    previousMousePositionRef,
    setSelectedControlBarAction,
    lastMouseDownTime,
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

  const {
    handleAddCircle,
    handleAddValidatorLens,
    handleAddDirectedEdge,
    handleAddUndirectedEdge,
  } = useAddGeometry();

  useEffect(() => {
    setSelectBox(null);
  }, []);

  useCanvasWheel();

  useApplyAlgorithm();

  const handleKeyDown = useCanvasKeyDown(setSelectedControlBarAction, meta);

  const handleFullyConnect = useFullyConnect(meta);
  const themeInfo = useTheme();
  // don't mutate anything or query/disable them if the playground is is undefined (unless they are joining a playground)
  useEffect(() => {
    const visualizationNodes = visualization?.at(visualizationPointer);

    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (!canvas) return;
    Draw.updateCanvasEnvironment({
      ctx,
      canvas,
      cameraPosition: cameraCoordinate,
    });

    Draw.drawBackground({
      camera: cameraCoordinate,
      canvas,
      ctx,
      mousePos: previousMousePositionRef.current ?? [0, 0],
      zoom: currentZoomFactor,
    });

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
    currentZoomFactor,
    canvasRef,
  ]);
  console.log('ul', canvasWidth);
  const lol = 'left-';
  return (
    <>
      <ContextMenu>
        <ContextMenu>
          <ContextMenuTrigger>
            <canvas
              onClick={(event) => {
                const mousePositionX =
                  event.nativeEvent.offsetX - cameraCoordinate[0];
                const mousePositionY =
                  event.nativeEvent.offsetY - cameraCoordinate[1];

                match(selectedControlBarAction)
                  .with({ tag: 'circle-toggle' }, () => {
                    handleAddCircle([mousePositionX, mousePositionY]);
                  })
                  .with({ tag: 'directed-edge-toggle' }, () => {
                    handleAddDirectedEdge([mousePositionX, mousePositionY]);
                  })
                  .with({ tag: 'undirected-edge-toggle' }, () => {
                    handleAddUndirectedEdge([mousePositionX, mousePositionY]);
                  })
                  .with({ tag: 'validator-lens-select' }, ({ state: id }) => {
                    // we cant just trivially pass the crypto random, we need the uuid of what we just added
                    if (!id) {
                      throw new Error('something went wrong pal');
                    }
                    handleAddValidatorLens(id, [
                      mousePositionX,
                      mousePositionY,
                    ]);
                    setSelectedControlBarAction(null);
                  })
                  // // remeber to add validator lens oops
                  .otherwise((action) => {
                    //  #TODO
                  });
              }}
              style={{
                width: canvasWidth,
                height: canvasHeight,
              }}
              onMouseLeave={() => {
                isMouseDownRef.current = false;
              }}
              className={`
              outline-none   z-50
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

            <div
              style={{
                // 12 is resize bar size - 4, should just export (4 is because the gnome requires a 4 shmeckle toll to let the code compile)) :p
                left: canvasWidth - 96 + 12 - 4,
              }}
              className=" absolute text-sm   w-28 text-md bg-primary font-bold text-foreground flex items-center justify-center h-12 -translate-y-12 border-l-2 border-t-2   rounded-r-none rounded-t-md border-secondary"
            >
              ({(cameraCoordinate[0] / 10).toFixed(0)},
              {(cameraCoordinate[1] / 10).toFixed(0)})
            </div>
            <div className="absolute w-16 text-md bg-primary font-bold text-foreground flex items-center justify-center h-12 -translate-y-12 border-r-2 border-t-2  rounded-r-md rounded-l-none rounded-t-md border-secondary">
              {(currentZoomFactor * 100).toFixed(0)}%
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64 ">
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
                    CodeExecActions.setSelectedAlgorithm(validatorLens.algoID)
                  );
                  const targetAlgo = algos.data?.find(
                    (algo) => algo.algoID === validatorLens.algoID
                  );

                  targetAlgo &&
                    run(() => {
                      setUserAlgorithm(targetAlgo);

                      setSelectedValidatorLens(null);
                    });
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
            {/* keep this for now if i think of a better way to introduce this since it does work */}
            {/* <ContextMenuItem
              onClick={() => {
                if (selectedCircleID) {
                  dispatch(CanvasActions.setEndNode(selectedCircleID));
                  setSelectedCircleID(null);
                }
              }}
              inset
            >
              Set as ending node
            </ContextMenuItem> */}
            {selectedCircleID && (
              <ContextMenuSub>
                <ContextMenuSubTrigger inset>
                  Edit Node Value
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className=" ">
                  <Input
                    // type="number"
                    // asserting because of selectedCircleId check above
                    value={tempCircleValue}
                    onChange={(e) => {
                      setTempCircleValue(e.target.value);

                      // const selectedNode = selectedCircleID
                      // setPresetName(e.target.value);
                    }}
                  />

                  <Button
                    onClick={() => {
                      if (Number(tempCircleValue) > 9999) {
                        toast({
                          variant: 'destructive',
                          title: 'Little bit lower',
                          description:
                            "Id prefer the UI doesn't break too much, enter a number below 10000",
                        });
                        return;
                      }
                      dispatch(
                        CanvasActions.editNodeValue({
                          value:
                            tempCircleValue === ''
                              ? 0
                              : Number(tempCircleValue),
                          nodeID: selectedCircleID,
                        })
                      );
                    }}
                    className="bg-secondary mt-3 ring-0 hover: hover:border-2 hover:border-secondary w-full"
                  >
                    Update
                    {/* {saveAsPresetMutation.isLoading
                      ? 'Saving ...'
                      : 'Save Preset'} */}
                  </Button>
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}

            {isGodMode && (
              <ContextMenuSub>
                <ContextMenuSubTrigger inset>Save Preset</ContextMenuSubTrigger>
                <ContextMenuSubContent className=" ">
                  <Input
                    value={presetName}
                    onChange={(e) => {
                      setPresetName(e.target.value);
                    }}
                  />

                  <Button
                    onClick={() => {
                      saveAsPresetMutation.mutate({
                        name: presetName,
                        shapes: {
                          circles: selectedValues.selectedCircles,
                          lines: selectedValues.selectedAttachableLines,
                          zoomAmount: currentZoomFactor,
                        },
                        code: getCode(userAlgorithm, presetCode),
                        typeData: {
                          type: PresetType.DataStructure,
                        },
                        startNode: startNode ?? undefined,
                      });
                      getPresetsQuery.refetch();
                    }}
                    className="bg-secondary mt-3 ring-0 hover: hover:border-2 hover:border-secondary w-full"
                  >
                    {saveAsPresetMutation.isLoading
                      ? 'Saving ...'
                      : 'Save Preset'}
                  </Button>
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {/* <ContextMenuTrigger></ContextMenuTrigger> */}
      </ContextMenu>
    </>
  );
};

export default CanvasDisplay;
