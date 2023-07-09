import {
  SelectBox,
  SelectedAttachableLine,
  SelectedGeometryInfo,
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
} from '@/lib/types';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import * as Canvas from '@/lib/Canvas/canvas';

import {
  Dispatch,
  MouseEvent,
  MutableRefObject,
  RefObject,
  SetStateAction,
} from 'react';
import { match } from 'ts-pattern';
import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';

type UseCanvasMouseDownParams = {
  isMouseDownRef: MutableRefObject<boolean>;
  canvasRef: RefObject<HTMLCanvasElement>;
  selectBox: SelectBox | null;
  setSelectBox: Dispatch<SetStateAction<SelectBox | null>>;
  selectedControlBarAction: 'pencil' | null;

  setSelectedCircleID: Dispatch<SetStateAction<string | null>>;
  setSelectedAttachableLine: Dispatch<
    SetStateAction<SelectedAttachableLine | null>
  >;
  meta: Meta;
  setSelectedValidatorLens: Dispatch<
    SetStateAction<SelectedValidatorLens | null>
  >;
  setSelectedResizeValidatorLensCircle: React.Dispatch<
    React.SetStateAction<SelectedValidatorLensResizeCircle | null>
  >;
};

export const useCanvasMouseDown = ({
  setSelectedCircleID,
  setSelectedAttachableLine,
  meta,
  isMouseDownRef,
  canvasRef,
  selectBox,
  setSelectBox,
  selectedControlBarAction,
  setSelectedValidatorLens,
  setSelectedResizeValidatorLensCircle,
}: UseCanvasMouseDownParams) => {
  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas);
  const dispatch = useAppDispatch();
  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.length ?? -1) > 0;
  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;

    const activeItemInfo = Canvas.getMouseDownActiveItem({
      attachableLines,
      canvasRef,
      circles,
      event,
      selectBox,
      selectedControlBarAction,
      validatorLensContainer,
    });

    if (
      isSelectBoxSet &&
      !Canvas.isPointInRectangle(
        [event.nativeEvent.offsetX, event.nativeEvent.offsetY],
        selectedGeometryInfo.maxPoints.closestToOrigin,
        selectedGeometryInfo.maxPoints.furthestFromOrigin
      )
    ) {
      dispatch(CanvasActions.nullifySelectedGeometryInfo(undefined, meta));
      return;
    }

    // i hate this why am i doing this

    match(activeItemInfo?.activeItem)
      .with({ type: 'bottom-left' }, ({ lens, type }) => {
        // dispatch(CanvasActions.resizeValidatorLens({
        //   lens,
        //   mousePos
        // }))
        setSelectedResizeValidatorLensCircle({ id: lens.id, type });
      })
      .with({ type: 'bottom-right' }, ({ lens, type }) => {
        setSelectedResizeValidatorLensCircle({ id: lens.id, type });
      })
      .with({ type: 'top-left' }, ({ lens, type }) => {
        setSelectedResizeValidatorLensCircle({ id: lens.id, type });
      })
      .with({ type: 'top-right' }, ({ lens, type }) => {
        setSelectedResizeValidatorLensCircle({ id: lens.id, type });
      })
      .with({ type: 'circle' }, (circle) => {
        setSelectedCircleID(circle.id);
      })
      .with({ type: 'rect' }, (rect) => {
        setSelectedAttachableLine({
          id: rect.id,
          selected: 'line',
        });
      })
      .with({ type: 'node1' }, (nodeOne) => {
        const activeRectContainerOne = attachableLines.find(
          (line) => line.attachNodeOne.id === nodeOne.id
        );
        if (!activeRectContainerOne) return;
        setSelectedAttachableLine({
          id: nodeOne.id,
          selected: 'node1',
        });
      })
      .with({ type: 'node2' }, (nodeTwo) => {
        const activeRectContainerTwo = attachableLines.find(
          (line) => line.attachNodeTwo.id === nodeTwo.id
        );
        if (!activeRectContainerTwo) return;
        setSelectedAttachableLine({
          id: nodeTwo.id,
          selected: 'node2',
        });
      })
      .with({ type: 'pencil' }, () => {})
      .with({ type: 'validator-lens' }, (lens) => {
        setSelectedValidatorLens({
          id: lens.id,
          selected: 'validator-lens',
        });
      })

      .otherwise(() => {
        if (selectedGeometryInfo?.selectedIds.length ?? -1 > 0) return;

        // this is just mouse down, so it begins the render of the select box
        const initialMouseCoordinate: [number, number] = [
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY,
        ];
        setSelectBox({
          p1: initialMouseCoordinate,
          p2: initialMouseCoordinate,
          type: 'selectBox',
        });
      });
  };

  return handleMouseDown;
};
