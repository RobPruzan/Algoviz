import { ImmutableQueue, ImmutableSet, ImmutableStack } from '@/lib/graph';
import { AdjacencyList } from '@/lib/types';
import { DFSActions } from '@/redux/slices/dfsSlice';
import { useAppSelector } from '@/redux/store';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
type DFSParams<T extends string> = {
  startingNode: T;
  adjacencyList: AdjacencyList<T>;
};
export const useDepthFirstSearch = ({
  adjacencyList,
  startingNode,
}: DFSParams<string>) => {
  const stackRef = useRef(new ImmutableStack<string>([]));

  const historyRef = useRef<string[]>();
  const visitedRef = useRef(new ImmutableSet<string>([]));

  const dispatch = useDispatch();

  const dfs = () => {
    // ('starting bfs, the adj list is', adjacencyList);
    // the adjaceny list is broken because the string array represents node connectors on the edges, not other nodes, need to fix this later
    // TODO
    stackRef.current = stackRef.current.push(startingNode);

    while (stackRef.current.size > 0) {
      const { newStack, poppedItem } = stackRef.current.pop();

      stackRef.current = newStack;
      if (!poppedItem) {
        continue;
      }
      historyRef.current?.push(poppedItem);

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
          stackRef.current = stackRef.current.push(neighbor);
        }
      }
    }

    return historyRef;
  };

  const clearState = () => {
    stackRef.current = new ImmutableStack<string>([]);
    historyRef.current = [];
    visitedRef.current = new ImmutableSet<string>([]);
  };

  const handleDfs = () => {
    clearState();
    const state = dfs();
    state.current && dispatch(DFSActions.setVisited(state.current));
  };

  return { handleDfs };
};
