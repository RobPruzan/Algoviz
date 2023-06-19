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
import { CanvasActions } from '@/redux/slices/canvasSlice';

type UseCanvasKeyDownParams = {
  selectedGeometryInfo: SelectedGeometryInfo | null;
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
};

export const useCanvasKeyDown = ({
  selectedGeometryInfo,

  setSelectedGeometryInfo,
}: UseCanvasKeyDownParams) => {
  const dispatch = useAppDispatch();
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const { attachableLines, circles, creationZoomFactor } = useAppSelector(
    (store) => store.canvas
  );
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key === 'Backspace') {
      if (selectedGeometryInfo) {
        dispatch(
          CanvasActions.deleteCircles([
            ...selectedGeometryInfo.selectedIds.keys(),
          ])
        );
        dispatch(
          CanvasActions.deleteLines([
            ...selectedGeometryInfo.selectedIds.keys(),
          ])
        );
      }
      setSelectedGeometryInfo(null);
    }
    if (e.key === 'Escape') {
      setSelectedGeometryInfo(null);
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
        .filter((circle) => copied.has(circle.id))
        .forEach((circle) => {
          idMap.set(circle.id, crypto.randomUUID());
          idMap.set(circle.nodeReceiver.id, crypto.randomUUID());
          circle.nodeReceiver.attachedIds.forEach((id) =>
            idMap.set(id, crypto.randomUUID())
          );
          // idMap.set(, crypto.randomUUID())
        });

      attachableLines
        .filter((line) => copied.has(line.id))
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
        .filter((circle) => copied.has(circle.id))
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
        .filter((line) => copied.has(line.id))
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

      setSelectedGeometryInfo((geo) =>
        geo
          ? {
              ...geo,

              selectedIds: new Set<string>(
                [...geo.selectedIds.keys()].map((id) => idMap.get(id)!)
              ),
              // still need to update selected box
              maxPoints: {
                closestToOrigin: [
                  geo.maxPoints.closestToOrigin[0] - offset,
                  geo.maxPoints.closestToOrigin[1] - offset,
                ],
                furthestFromOrigin: [
                  geo.maxPoints.furthestFromOrigin[0] - offset,
                  geo.maxPoints.furthestFromOrigin[1] - offset,
                ],
              },
            }
          : null
      );

      dispatch(CanvasActions.setCircles([...circles, ...pasteCircles]));
      dispatch(CanvasActions.setLines([...attachableLines, ...pasteLines]));
    }
  };

  return handleKeyDown;
};
