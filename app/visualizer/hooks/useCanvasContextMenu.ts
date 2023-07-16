import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, { Dispatch, MouseEvent, SetStateAction } from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import { SelectedGeometryInfo } from '@/lib/types';
import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';

type CanvasContextMenuParams = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setSelectedCircleID: Dispatch<SetStateAction<string | null>>;
  meta: Meta;
  isContextMenuActiveRef: React.MutableRefObject<boolean>;
  cameraCoordinate: [number, number];
};

export const useCanvasContextMenu = ({
  canvasRef,
  meta,
  setSelectedCircleID,
  isContextMenuActiveRef,
  cameraCoordinate,
}: CanvasContextMenuParams) => {
  const circles = useAppSelector((store) => store.canvas.circles);
  const dispatch = useAppDispatch();
  const handleContextMenu = (
    event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) => {
    isContextMenuActiveRef.current = true;
    const activeCircleId = Canvas.getActiveCircle({
      circles,
      event,
      canvasRef,
      cameraCoordinate,
    });

    const activeCircle = circles.find((circle) => circle.id === activeCircleId);

    if (!activeCircle) return;
    setSelectedCircleID(activeCircle.id);

    dispatch(CanvasActions.nullifySelectedGeometryInfo(undefined, meta));
  };

  return handleContextMenu;
};
