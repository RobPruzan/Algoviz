import {
  SelectBox,
  SelectedAttachableLine,
  SelectedGeometryInfo,
} from '@/lib/types';
import { useAppSelector } from '@/redux/store';
import * as Canvas from '@/lib/Canvas/canvas';

import {
  Dispatch,
  MouseEvent,
  MutableRefObject,
  RefObject,
  SetStateAction,
} from 'react';
import { match } from 'ts-pattern';

type UseCanvasMouseDownParams = {
  isMouseDownRef: MutableRefObject<boolean>;
  canvasRef: RefObject<HTMLCanvasElement>;
  selectBox: SelectBox | null;
  setSelectBox: Dispatch<SetStateAction<SelectBox | null>>;
  selectedControlBarAction: 'pencil' | null;
  selectedGeometryInfo: SelectedGeometryInfo | null;
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
  setSelectedCircleID: Dispatch<SetStateAction<string | null>>;
  setSelectedAttachableLine: Dispatch<
    SetStateAction<SelectedAttachableLine | null>
  >;
};

export const useCanvasMouseDown = ({
  setSelectedCircleID,
  setSelectedAttachableLine,
  setSelectedGeometryInfo,
  isMouseDownRef,
  canvasRef,
  selectBox,
  setSelectBox,
  selectedControlBarAction,
  selectedGeometryInfo,
}: UseCanvasMouseDownParams) => {
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  const isSelectBoxSet =
    selectBox === null &&
    selectedGeometryInfo &&
    (selectedGeometryInfo?.selectedIds.size ?? -1) > 0;
  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    const activeItemInfo = Canvas.getMouseDownActiveItem({
      attachableLines,
      canvasRef,
      circles,
      event,
      selectBox,
      selectedControlBarAction,
    });

    if (
      isSelectBoxSet &&
      !Canvas.isPointInRectangle(
        [event.nativeEvent.offsetX, event.nativeEvent.offsetY],
        selectedGeometryInfo.maxPoints.closestToOrigin,
        selectedGeometryInfo.maxPoints.furthestFromOrigin
      )
    ) {
      setSelectedGeometryInfo(null);
      return;
    }

    match(activeItemInfo?.activeItem)
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

      .otherwise(() => {
        if (selectedGeometryInfo?.selectedIds.size ?? -1 > 0) return;

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
