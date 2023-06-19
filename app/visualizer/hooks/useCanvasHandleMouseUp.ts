import { useAppSelector } from '@/redux/store';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import {
  PencilCoordinates,
  SelectBox,
  SelectedAttachableLine,
} from '@/lib/types';
import { match } from 'ts-pattern';

type CanvasMouseUPParams = {
  isMouseDownRef: MutableRefObject<boolean>;
  selectBox: SelectBox | null;
  setSelectBox: Dispatch<SetStateAction<SelectBox | null>>;
  selectedControlBarAction: 'pencil' | null;

  setPencilCoordinates: Dispatch<SetStateAction<PencilCoordinates>>;
  selectedCircleID: string | null;
  selectedAttachableLine: SelectedAttachableLine | null;
  setSelectedCircleID: Dispatch<SetStateAction<string | null>>;
  setSelectedAttachableLine: Dispatch<
    SetStateAction<SelectedAttachableLine | null>
  >;
};

export const useHandleMouseUp = ({
  setSelectedCircleID,
  setSelectedAttachableLine,
  isMouseDownRef,
  selectBox,
  selectedAttachableLine,
  selectedCircleID,
  selectedControlBarAction,
  setPencilCoordinates,
  setSelectBox,
}: CanvasMouseUPParams) => {
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);

  const handleMouseUp = () => {
    const { activeItem } = Canvas.getMouseUpActiveItem({
      attachableLines,
      circles,
      selectedAttachableLine,
      selectedCircleID,
      selectBox,
      selectedControlBarAction,
    });
    isMouseDownRef.current = false;

    match(activeItem)
      .with({ type: 'circle' }, () => {
        setSelectedCircleID(null);
      })
      .with({ type: 'rect' }, () => {
        setSelectedAttachableLine(null);
      })
      .with({ type: 'node1' }, () => {
        setSelectedAttachableLine(null);
      })
      .with({ type: 'pencil' }, () => {
        if (selectedControlBarAction === 'pencil') {
          setPencilCoordinates((prev) => ({
            drawnCoordinates: [
              ...prev.drawnCoordinates,
              prev.drawingCoordinates,
            ],
            drawingCoordinates: [],
          }));
        }
      })
      .otherwise(() => {
        setSelectBox(null);
        setSelectedAttachableLine(null);
      });
  };
  return handleMouseUp;
};
