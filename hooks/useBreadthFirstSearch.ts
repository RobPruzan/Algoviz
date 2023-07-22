import { ImmutableQueue, ImmutableSet } from '@/lib/graph';
import { AdjacencyList } from '@/lib/types';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { DFSActions } from '@/redux/slices/dfsSlice';
import { useAppSelector } from '@/redux/store';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { start } from 'repl';

type BFSParams<T extends string> = {
  startingNode: T;
  adjacencyList: AdjacencyList<T>;
};
export const useBreadthFirstSearch = ({
  adjacencyList,
  startingNode,
}: BFSParams<string>) => {
  const queueRef = useRef(new ImmutableQueue<string>([]));

  const historyRef = useRef<ImmutableQueue<string>[]>();
  const visitedRef = useRef(new ImmutableSet<string>([]));

  const dispatch = useDispatch();
  const { circles } = useAppSelector((store) => store.canvas.present);
  const bfs = () => {
    // ('starting bfs, the adj list is', adjacencyList);
    // the adjaceny list is broken because the string array represents node connectors on the edges, not other nodes, need to fix this later
    // TODO
    queueRef.current = queueRef.current.enqueue(startingNode);

    while (queueRef.current.size > 0) {
      const { poppedItem, newQueue } = queueRef.current.dequeue();
      if (!poppedItem) {
        continue;
      }

      queueRef.current = newQueue;
      const neighbors = adjacencyList.get(poppedItem);
      // ('the neighbors', neighbors);
      if (!neighbors || neighbors.length <= 0) {
        continue;
      }
      for (const neighbor of neighbors) {
        // ('iterating over neighbor', neighbor);
        // ('visited', visitedRef.current.toString());
        if (!visitedRef.current.has(neighbor)) {
          visitedRef.current = visitedRef.current.add(poppedItem);
          queueRef.current = queueRef.current.enqueue(neighbor);
          historyRef.current = [
            ...(historyRef.current ?? []),
            queueRef.current,
          ];
        }
      }
    }

    return {
      queueRef,
      historyRef,
      visitedRef,
    };
  };

  const clearState = () => {
    queueRef.current = new ImmutableQueue<string>([]);
    visitedRef.current = new ImmutableSet<string>([]);
    historyRef.current = [];
  };

  const handleBfs = () => {
    clearState();
    const state = bfs();

    historyRef.current = [];

    // dispatch(
    //   CanvasActions.updateVariableInspectorQueue(state.historyRef.current)
    // );
  };
  return { handleBfs };
};
