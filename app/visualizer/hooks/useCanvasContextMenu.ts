import { useAppSelector } from '@/redux/store';
import React, { Dispatch, MouseEvent, SetStateAction } from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import { SelectedGeometryInfo } from '@/lib/types';

type CanvasContextMenuParams = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setSelectedCircleID: Dispatch<SetStateAction<string | null>>;
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
  isContextMenuActiveRef: React.MutableRefObject<boolean>;
};

export const useCanvasContextMenu = ({
  canvasRef,
  setSelectedGeometryInfo,
  setSelectedCircleID,
  isContextMenuActiveRef,
}: CanvasContextMenuParams) => {
  const circles = useAppSelector((store) => store.canvas.circles);
  const handleContextMenu = (
    event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) => {
    isContextMenuActiveRef.current = true;
    const activeCircleId = Canvas.getActiveCircle({
      circles,
      event,
      canvasRef,
    });

    const activeCircle = circles.find((circle) => circle.id === activeCircleId);

    if (!activeCircle) return;
    setSelectedCircleID(activeCircle.id);
    setSelectedGeometryInfo(null);
  };

  return handleContextMenu;
};
