import Node from '@/components/Visualizers/Node';
import { Algorithms, NodeMetadata } from '@/lib/types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import SortRow from './SortRow';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { ControlBarContext } from '@/Context/ControlBarContext';

import { useMergeSort } from '@/hooks/useMergeSort';
import { useTransition, animated, config } from 'react-spring';

type Props = {
  algorithm: Algorithms | undefined;
};

const SortDisplay = ({ algorithm }: Props) => {
  const historyNodesState = useContext(HistoryNodesContext);
  const controlBarData = useContext(ControlBarContext);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      const lastChild = scrollRef.current.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });
      }
    }
  }, [controlBarData]);

  const historyPointer = controlBarData.controlBarState.historyPointer;

  const { handleQuickSort } = useQuickSort({
    currentHistory: historyNodesState.historyNodes,
    tempHistoryArrayList: historyNodesState.quickSortTempHistoryArrayList,
  });

  const { historyNodes, setHistoryNodes } = useContext(HistoryNodesContext);

  const firstRow = historyNodes[0]?.element;

  // const { sorted } = useMemo(
  //   () =>
  //     handleQuickSort({
  //       arr: JSON.parse(JSON.stringify(firstRow ?? [])),
  //       onFinish: (sortedArr) => console.warn('not implemented'),
  //     }),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [firstRow]
  // );
  // useEffect(() => {
  //   handleQuickSort({
  //     arr: JSON.parse(JSON.stringify(firstRow ?? [])),
  //     onFinish: (sortedArr) => console.warn('not implemented'),
  //   });
  // }, [firstRow]);
  useEffect(() => {
    console.log('da algorithim', algorithm);
    switch (algorithm) {
      case 'quick sort':
        historyNodesState.quickSortTempHistoryArrayList.current = [];
        handleQuickSort({
          arr: JSON.parse(JSON.stringify(firstRow ?? [])),
          onFinish: (sortedArr) => console.warn('not implemented'),
        });
    }
  }, [firstRow, algorithm]);

  // const { handleMergeSort } = useMergeSort({
  //   currentHistory: historyNodesState.historyNodes,
  //   tempHistoryArrayList: historyNodesState.tempHistoryArrayList,
  // });

  const truncatedQuickSortHistoryArray = [
    ...historyNodesState.quickSortTempHistoryArrayList.current.slice(
      1,
      historyPointer + 1
    ),
  ];

  console.log('debug history', historyNodesState);

  return (
    // have a floating box above each node showing it's +/- like a leader board
    <div ref={scrollRef} className="bg-primary">
      {[
        ...historyNodesState.historyNodes,
        ...truncatedQuickSortHistoryArray,
      ].map((historyNode, idx) => (
        <SortRow historyNode={historyNode} key={idx} />
      ))}

      {/* {truncatedQuickSortHistoryArray.length > 0 ? (
        truncatedQuickSortHistoryArray.map((historyNode, idx) => (
          <SortRow historyNode={historyNode} key={idx} />
        ))
      ) : (
        <div className="flex w-full justify-center items-center mt-5 text-foreground font-bold text-3xl opacity-40">
          Add some nodes to get started!
        </div>
      )} */}
    </div>
  );
};

export default SortDisplay;
