import { ImmutableQueue, ImmutableSet } from '@/lib/graph';
import { useAppSelector } from '@/redux/store';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { start } from 'repl';

type AdjacencyList<T extends string> = Map<string, string[]>;
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
  const { circles } = useAppSelector((store) => store.canvas);
  const bfs = () => {
    // console.log('starting bfs, the adj list is', adjacencyList);
    // the adjaceny list is broken because the string array represents node connectors on the edges, not other nodes, need to fix this later
    // TODO
    queueRef.current = queueRef.current.enqueue(startingNode);

    while (queueRef.current.size() > 0) {
      const { poppedItem, newQueue } = queueRef.current.dequeue();
      // console.log('popped', poppedItem?.toString());
      queueRef.current = newQueue;
      const neighbors = poppedItem ? adjacencyList.get(poppedItem) : undefined;
      // console.log('the neighbors', neighbors);
      if (!neighbors || neighbors.length <= 0) {
        continue;
      }
      for (const neighbor of neighbors) {
        // console.log('iterating over neighbor', neighbor);
        if (!visitedRef.current.has(neighbor)) {
          visitedRef.current = visitedRef.current.add(neighbor);
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
    const state = bfs();
    clearState();
  };
  return { handleBfs };
};
