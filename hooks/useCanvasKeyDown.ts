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
      const idMap = new Map<string, string>();
      circles
        .filter((circle) => copied.includes(circle.id))
        .forEach((circle) => {
          idMap.set(circle.id, crypto.randomUUID());
          idMap.set(circle.nodeReceiver.id, crypto.randomUUID());

          circle.nodeReceiver.attachedIds.forEach((id) =>
            idMap.set(id, crypto.randomUUID())
          );
          // idMap.set(, crypto.randomUUID())
        });

      attachableLines
        .filter((line) => copied.includes(line.id))
        .forEach((line) => {
          idMap.set(line.id, crypto.randomUUID());
          idMap.set(line.attachNodeOne.id, crypto.randomUUID());
          idMap.set(line.attachNodeTwo.id, crypto.randomUUID());
          line.attachNodeOne.connectedToId &&
            idMap.set(line.attachNodeOne.connectedToId, crypto.randomUUID());
          line.attachNodeTwo.connectedToId &&
            idMap.set(line.attachNodeTwo.connectedToId, crypto.randomUUID());
        });

      //  should design this without asserting non null, but for now its fine
      const offset = 20;
      const pasteCircles: CircleReceiver[] = circles
        .filter((circle) => copied.includes(circle.id))
        .map((circle) => ({
          ...circle,
          id: idMap.get(circle.id)!,
          center: [circle.center[0] - offset, circle.center[1] - offset],
          nodeReceiver: {
            ...circle.nodeReceiver,
            id: idMap.get(circle.nodeReceiver.id)!,
            attachedIds: circle.nodeReceiver.attachedIds.map(
              (id) => idMap.get(id)!
            ),
            center: [
              circle.nodeReceiver.center[0] - offset,
              circle.nodeReceiver.center[1] - offset,
            ],
          },
        }));
      const pasteLines: Edge[] = attachableLines
        .filter((line) => copied.includes(line.id))
        .map((line) => ({
          ...line,
          id: idMap.get(line.id)!,
          x1: line.x1 - offset,
          y1: line.y1 - offset,
          x2: line.x2 - offset,
          y2: line.y2 - offset,
          attachNodeOne: {
            ...line.attachNodeOne,
            id: idMap.get(line.attachNodeOne.id)!,
            connectedToId: line.attachNodeOne.connectedToId
              ? idMap.get(line.attachNodeOne.connectedToId)!
              : null,
            center: [
              line.attachNodeOne.center[0] - offset,
              line.attachNodeOne.center[1] - offset,
            ],
          },
          attachNodeTwo: {
            ...line.attachNodeTwo,
            id: idMap.get(line.attachNodeTwo.id)!,
            connectedToId: line.attachNodeTwo.connectedToId
              ? idMap.get(line.attachNodeTwo.connectedToId)!
              : null,
            center: [
              line.attachNodeTwo.center[0] - offset,
              line.attachNodeTwo.center[1] - offset,
            ],
          },
        }));

      dispatch(
        CanvasActions.panMaxPoints({
          pan: [offset, offset],
        })
      );
      dispatch(CanvasActions.mapSelectedIds((id) => idMap.get(id)!));
      dispatch(CanvasActions.setCircles([...circles, ...pasteCircles]));
      dispatch(CanvasActions.setLines([...attachableLines, ...pasteLines]));
    }
  };

  return handleKeyDown;
};
