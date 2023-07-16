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
  Edge,
  NodeReceiver,
  PencilCoordinates,
  SelectBox,
  SelectedAttachableLine,
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
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
  selectedControlBarAction: 'pencil' | null;

  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
  meta: Meta;
  selectedValidatorLens: SelectedValidatorLens | null;
  selectedResizeValidatorLensCircle: SelectedValidatorLensResizeCircle | null;
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
}: UseCanvasMouseMoveProps) => {
  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas);

  const previousMousePositionRef = useRef<[number, number]>();
  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.length ?? -1) > 0;
  const dispatch = useAppDispatch();

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const mousePositionX = event.nativeEvent.offsetX;
    const mousePositionY = event.nativeEvent.offsetY;
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
      .with('pencil', () => {
        if (isMouseDownRef.current) {
          dispatch(
            CanvasActions.setPencilDrawingCoordinates([
              mousePositionX,
              mousePositionY,
            ])
          );
        }
      })
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
          prevPos[0] - event.nativeEvent.offsetX,
          prevPos[1] - event.nativeEvent.offsetY,
        ];
        // this should be a case obviously just doing this for quick measures
        if (isSelectBoxSet && isMouseDownRef.current) {
          dispatch(
            CanvasActions.shiftCircles(
              {
                selectedGeometryInfo,
                shift,
              },
              meta
            )
          );
          dispatch(CanvasActions.shiftLines({ shift }, meta));
          dispatch(CanvasActions.shiftSelectBox({ shift }, meta));
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

            break;
          case 'circle':
            selectedCircleID &&
              dispatch(
                CanvasActions.handleMoveCircle(
                  { shift, selectedCircleID },
                  meta
                )
              );

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
          default:
            if (selectBox) {
              const adjustableCord: [number, number] = [
                event.nativeEvent.offsetX,
                event.nativeEvent.offsetY,
              ];

              // simple check to make sure we have a select box first
              setSelectBox((prev) => {
                const selectedGeometryInfo = Canvas.getSelectedGeometry({
                  edges: attachableLines,
                  vertices: circles,
                  selectBox: prev?.p1 ? { ...prev, p2: adjustableCord } : null,
                });

                dispatch(
                  CanvasActions.setSelectedGeometryInfo(
                    selectedGeometryInfo,
                    meta
                  )
                );
                return prev?.p1 ? { ...prev, p2: adjustableCord } : null;
              });
            }
            break;
        }
        previousMousePositionRef.current = [
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY,
        ];
        dispatch(CanvasActions.staticLensSetValidatorLensIds(undefined, meta));
      });
  };

  return handleMouseMove;
};
