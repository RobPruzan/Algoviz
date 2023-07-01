import { useAppSelector } from '@/redux/store';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import * as Canvas from '@/lib/Canvas/canvas';
import {
  PencilCoordinates,
  SelectBox,
  SelectedAttachableLine,
  SelectedValidatorLens,
  SelectedValidatorLensResizeCircle,
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
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  setSelectedResizeValidatorLensCircle: React.Dispatch<
    React.SetStateAction<SelectedValidatorLensResizeCircle | null>
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
  setSelectedValidatorLens,
  selectedValidatorLens,
  setSelectedResizeValidatorLensCircle,
}: CanvasMouseUPParams) => {
  const { attachableLines, circles, validatorLensContainer } = useAppSelector(
    (store) => store.canvas
  );

  const handleMouseUp = () => {
    const { activeItem } = Canvas.getMouseUpActiveItem({
      attachableLines,
      circles,
      selectedAttachableLine,
      selectedCircleID,
      selectBox,
      selectedControlBarAction,
      selectedValidatorLens,
      validatorLensContainer,
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
      .with({ type: 'validator-lens' }, (data) => {
        setSelectedValidatorLens(null);
      })
      .otherwise(() => {
        setSelectBox(null);
        setSelectedAttachableLine(null);
        setSelectedResizeValidatorLensCircle(null);
      });
  };
  return handleMouseUp;
};
