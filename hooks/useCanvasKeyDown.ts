import {
  CircleReceiver,
  Edge,
  SelectBox,
  SelectedAttachableLine,
  SelectedGeometryInfo,
} from '@/lib/types';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import * as Canvas from '@/lib/Canvas/canvas';

import {
  Dispatch,
  MouseEvent,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useState,
} from 'react';
import { match } from 'ts-pattern';
import { CanvasActions, Meta } from '@/redux/slices/canvasSlice';

export const useCanvasKeyDown = (meta: Meta) => {
  const dispatch = useAppDispatch();
  const [copied, setCopied] = useState<Array<string>>([]);
  const {
    attachableLines,
    circles,
    currentZoomFactor: creationZoomFactor,
    selectedGeometryInfo,
  } = useAppSelector((store) => store.canvas.present);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    // e.preventDefault();
    if (e.key === 'Backspace') {
      if (selectedGeometryInfo) {
        dispatch(CanvasActions.deleteCircles(selectedGeometryInfo.selectedIds));
        dispatch(CanvasActions.deleteLines(selectedGeometryInfo.selectedIds));
      }
      dispatch(CanvasActions.nullifySelectedGeometryInfo(undefined, meta));
    }
    if (e.key === 'Escape') {
      dispatch(CanvasActions.nullifySelectedGeometryInfo(undefined, meta));
    }
    e;
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedGeometryInfo) {
      setCopied(selectedGeometryInfo.selectedIds);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // can refactor cause this is pretty heavy
      // should build helper functions for updating, since I'm doing this so much, but it may be an over abstraction
      const idOffset = String(Date.now());
      //  should design this without asserting non null, but for now its fine
      const offset = 20;
      const pasteCircles: CircleReceiver[] = circles

        .filter((circle) => copied.includes(circle.id))
        .map((circle) => ({
          ...circle,
          id: idOffset + circle.id,
          center: [circle.center[0] - offset, circle.center[1] - offset],
          nodeReceiver: {
            ...circle.nodeReceiver,
            id: idOffset + circle.nodeReceiver.id,
            attachedIds: circle.nodeReceiver.attachedIds.map(
              (id) => idOffset + id
            ),
            center: [
              circle.nodeReceiver.center[0] - offset,
              circle.nodeReceiver.center[1] - offset,
            ],
          },
        }));

      const pasteLines: Edge[] = attachableLines
        .filter((line) => copied.includes(line.id))
        .map((line) => {
          // problem is  if the lines ends are connected to something that's not selected
          // if so don't shift it or update its id

          // either it has no connection or the connection is copied
          const shouldFullCopyOne =
            !line.attachNodeOne.connectedToId ||
            Boolean(copied.includes(line.attachNodeOne.connectedToId));
          const shouldFullCopyTwo =
            !line.attachNodeTwo.connectedToId ||
            Boolean(copied.includes(line.attachNodeTwo.connectedToId));

          return {
            ...line,
            id: idOffset + line.id,
            x1: shouldFullCopyOne ? line.x1 - offset : line.x1,
            y1: shouldFullCopyOne ? line.y1 - offset : line.y1,
            x2: shouldFullCopyTwo ? line.x2 - offset : line.x2,
            y2: shouldFullCopyTwo ? line.y2 - offset : line.y2,
            attachNodeOne: {
              ...line.attachNodeOne,
              id: shouldFullCopyOne
                ? idOffset + line.attachNodeOne.id
                : line.attachNodeOne.id,
              connectedToId: shouldFullCopyOne
                ? idOffset + line.attachNodeOne.connectedToId
                : line.attachNodeOne.connectedToId,
              center: shouldFullCopyOne
                ? [
                    line.attachNodeOne.center[0] - offset,
                    line.attachNodeOne.center[1] - offset,
                  ]
                : line.attachNodeOne.center,
            },
            attachNodeTwo: {
              ...line.attachNodeTwo,
              id: shouldFullCopyTwo
                ? idOffset + line.attachNodeTwo.id
                : line.attachNodeTwo.id,
              connectedToId: shouldFullCopyTwo
                ? idOffset + line.attachNodeTwo.connectedToId
                : line.attachNodeTwo.connectedToId,
              center: shouldFullCopyTwo
                ? [
                    line.attachNodeTwo.center[0] - offset,
                    line.attachNodeTwo.center[1] - offset,
                  ]
                : line.attachNodeTwo.center,
            },
          };
        });

      dispatch(
        CanvasActions.panMaxPoints({
          pan: [offset, offset],
        })
      );
      dispatch(CanvasActions.mapSelectedIds((id) => idOffset + id));
      dispatch(CanvasActions.setCircles([...circles, ...pasteCircles]));
      dispatch(CanvasActions.setLines([...attachableLines, ...pasteLines]));
    }
  };

  return handleKeyDown;
};
