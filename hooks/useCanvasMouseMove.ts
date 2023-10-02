import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, {
  Dispatch,
  MouseEvent,
  MutableRefObject,
  SetStateAction,
  useRef,
} from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import {
  CircleReceiver,
  DrawTypes,
  Edge,
  NodeReceiver,
  PencilCoordinates,
  SelectBox,
  SelectedAttachableLine,
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
  TaggedDrawTypes,
} from '@/lib/types';
import { match } from 'ts-pattern';
import {
  CanvasActions,
  Meta,
  ValidatorLensInfo,
} from '@/redux/slices/canvasSlice';
import { CollaborationActions } from '@/redux/slices/colloborationSlice';
type UseCanvasMouseMoveProps = {
  isMouseDownRef: MutableRefObject<boolean>;
  selectBox: SelectBox | null;
  setSelectBox: Dispatch<SetStateAction<SelectBox | null>>;
  selectedControlBarAction: TaggedDrawTypes | null;

  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
  meta: Meta;
  selectedValidatorLens: SelectedValidatorLens | null;
  selectedResizeValidatorLensCircle: SelectedValidatorLensResizeCircle | null;
  cameraCoordinate: [number, number];
  previousMousePositionRef: React.MutableRefObject<
    [number, number] | undefined
  >;
  setSelectedControlBarAction: Dispatch<SetStateAction<TaggedDrawTypes | null>>;
  lastMouseDownTime: React.MutableRefObject<number>;
};

export const useCanvasMouseMove = ({
  isMouseDownRef,
  selectBox,
  selectedControlBarAction,
  setSelectBox,
  selectedCircleID,
  selectedAttachableLine,
  meta,
  selectedValidatorLens,
  selectedResizeValidatorLensCircle,
  cameraCoordinate,
  previousMousePositionRef,
  setSelectedControlBarAction,
  lastMouseDownTime,
}: UseCanvasMouseMoveProps) => {
  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas.present);

  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.length ?? -1) > 0;
  const dispatch = useAppDispatch();

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const mousePositionX = event.nativeEvent.offsetX - cameraCoordinate[0];
    const mousePositionY = event.nativeEvent.offsetY - cameraCoordinate[1];

    dispatch(
      CollaborationActions.setUserMousePosition(
        {
          mousePosition: [mousePositionX, mousePositionY],
          user: {
            id: meta.userID,
          },
        },
        meta
      )
    );

    // if (selectedControlBarAction === 'pencil')
    match(selectedControlBarAction)
      // fix pencil oopsies
      // .with('pencil', () => {
      //   if (isMouseDownRef.current) {
      //     dispatch(
      //       CanvasActions.setPencilDrawingCoordinates([
      //         mousePositionX,
      //         mousePositionY,
      //       ])
      //     );
      //   }
      // })
      .otherwise(() => {
        const activeTask = Canvas.getActiveGeometry({
          selectedCircleID,
          selectedAttachableLine,
          selectedGeometryInfo,
          selectedValidatorLens,
          selectedResizeValidatorLensCircle,
        });
        const prevPos = previousMousePositionRef.current ?? [
          mousePositionX,
          mousePositionY,
        ];

        const shift: [number, number] = [
          prevPos[0] - mousePositionX,
          prevPos[1] - mousePositionY,
        ];

        if (
          isMouseDownRef.current &&
          Date.now() - lastMouseDownTime.current > 200
        ) {
          setSelectedControlBarAction(null);
        }
        // this should be a case obviously just doing this for quick measures
        if (isSelectBoxSet && isMouseDownRef.current) {
          // dispatch(CanvasActions.update());

          dispatch(
            CanvasActions.shiftCircles(
              {
                selectedGeometryInfo,
                shift,
              },
              meta
            )
          );
          // console.log('wohoo');

          // setSelectBox((prev) => {
          //   const mousePositionX =
          //     event.nativeEvent.offsetX - cameraCoordinate[0];
          //   const mousePositionY =
          //     event.nativeEvent.offsetY - cameraCoordinate[1];
          //   const adjustableCord: [number, number] = [
          //     mousePositionX,
          //     mousePositionY,
          //   ];
          //   const selectedGeo = Canvas.getSelectedGeometry({
          //     edges: attachableLines,
          //     vertices: circles,
          //     selectBox: prev?.p1 ? { ...prev, p2: adjustableCord } : null,
          //   });
          //   // return prev?.p1 ? { ...prev, p2: adjustableCord } : null;
          //   console.log('very much running', selectedGeo);
          //   return selectedGeo
          //     ? {
          //         p1: selectedGeo?.maxPoints.closestToOrigin,
          //         p2: selectedGeo?.maxPoints.furthestFromOrigin,
          //         type: 'selectBox',
          //       }
          //     : prev;
          // });
          dispatch(CanvasActions.shiftLines({ shift }, meta));
          dispatch(CanvasActions.shiftSelectBox({ shift }));
          dispatch(CanvasActions.update());
          previousMousePositionRef.current = [mousePositionX, mousePositionY];
          return;
        }

        switch (activeTask) {
          case 'bottom-left':
          case 'bottom-right':
          case 'top-left':
          case 'top-right':
            const lens = validatorLensContainer.find(
              (lens) => selectedResizeValidatorLensCircle?.id === lens.id
            );
            if (!lens) return;
            dispatch(
              CanvasActions.resizeValidatorLens({
                lens,
                mousePos: [mousePositionX, mousePositionY],
                side: activeTask,
              })
            );

            dispatch(
              CanvasActions.setValidatorLensSelectedIds(
                { validatorLensId: lens.id },
                meta
              )
            );
            dispatch(CanvasActions.update());
          case 'validator-lens':
            const activeLens = validatorLensContainer.find(
              (lens) => lens.id === selectedValidatorLens?.id
            );
            if (!activeLens) return;
            dispatch(
              CanvasActions.shiftValidatorLens(
                { shift, id: activeLens.id },
                meta
              )
            );
            dispatch(
              CanvasActions.setValidatorLensSelectedIds(
                { validatorLensId: activeLens.id },
                meta
              )
            );
            dispatch(CanvasActions.update());
            break;
          case 'circle':
            selectedCircleID &&
              dispatch(
                CanvasActions.handleMoveCircle(
                  { shift, selectedCircleID },
                  meta
                )
              );
            dispatch(CanvasActions.update());
            break;
          case 'line':
            selectedAttachableLine?.id &&
              dispatch(
                CanvasActions.handleMoveLine(
                  {
                    shift,
                    selectedAttachableLineID: selectedAttachableLine.id,
                  },
                  meta
                )
              );
            dispatch(CanvasActions.update());
            break;
          case 'node1':
            selectedAttachableLine?.id &&
              dispatch(
                CanvasActions.handleMoveNodeOne(
                  {
                    shift,
                    selectedAttachableLineID: selectedAttachableLine.id,
                    mousePos: [mousePositionX, mousePositionY],
                  },
                  meta
                )
              );
            dispatch(CanvasActions.update());
            break;
          case 'node2':
            selectedAttachableLine?.id &&
              dispatch(
                CanvasActions.handleMoveNodeTwo(
                  {
                    shift,
                    selectedAttachableLineID: selectedAttachableLine.id,
                    mousePos: [mousePositionX, mousePositionY],
                  },
                  meta
                )
              );
            dispatch(CanvasActions.update());
            break;
          default:
            if (selectBox) {
              const adjustableCord: [number, number] = [
                mousePositionX,
                mousePositionY,
              ];

              // simple check to make sure we have a select box first
              setSelectBox((prev) => {
                const selectedGeometryInfo = Canvas.getSelectedGeometry({
                  edges: attachableLines,
                  vertices: circles,
                  selectBox: prev?.p1 ? { ...prev, p2: adjustableCord } : null,
                });
                // console.log('moving', selectedGeometryInfo);
                dispatch(
                  CanvasActions.setSelectedGeometryInfo(selectedGeometryInfo)
                );
                // dispatch(CanvasActions.update());
                return prev?.p1 ? { ...prev, p2: adjustableCord } : null;
              });
            }
            break;
        }

        previousMousePositionRef.current = [mousePositionX, mousePositionY];
        dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
        dispatch(CanvasActions.update());
      });
  };

  return handleMouseMove;
};
