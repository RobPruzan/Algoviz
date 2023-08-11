import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, {
  Dispatch,
  MouseEvent,
  RefObject,
  SetStateAction,
  useContext,
  useRef,
} from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import { SelectedGeometryInfo } from '@/lib/types';
import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';
import { CanvasContext } from '@/context/CanvasContext';
import { useCanvasRef } from './useCanvasRef';

type CanvasContextMenuParams = {
  setSelectedCircleID: Dispatch<SetStateAction<string | null>>;
  meta: Meta;
  isContextMenuActiveRef: React.MutableRefObject<boolean>;
  cameraCoordinate: [number, number];
};

export const useCanvasContextMenu = ({
  meta,
  setSelectedCircleID,
  isContextMenuActiveRef,
  cameraCoordinate,
}: CanvasContextMenuParams) => {
  const canvasRef = useCanvasRef();
  const test = useRef<string | null>('fdsf');

  const circles = useAppSelector((store) => store.canvas.present.circles);
  const dispatch = useAppDispatch();
  const handleContextMenu = (
    event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) => {
    if (!canvasRef.current) return;

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
