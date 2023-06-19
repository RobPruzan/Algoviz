import { useAppDispatch, useAppSelector } from '@/redux/store';
import { useEffect, useState } from 'react';
import { DFSActions } from '@/redux/slices/dfsSlice';

export const usePlayAlgorithm = () => {
  const [playingAlgorithm, setPlayingAlgorithm] = useState(false);
  const { visited: dfsVisited, visitedPointer } = useAppSelector(
    (store) => store.dfs
  );
  const dfsStore = useAppSelector((store) => store.dfs);
  const dispatch = useAppDispatch();
  useEffect(() => {
    console.log('applying');
    let intervalId: NodeJS.Timeout | null = null;
    setInterval(() => {
      if (playingAlgorithm) {
        console.log('calling', dfsVisited.length, dfsStore);

        if (dfsStore.visitedPointer < dfsStore.visited.length) {
          dispatch(DFSActions.incrementVisitedPointer());
          console.log('balling', dfsStore);
        } else {
          intervalId && clearInterval(intervalId);
          setPlayingAlgorithm(false);
        }
      }
    }, 1000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dfsStore, dfsVisited.length, dispatch, playingAlgorithm]);
};
