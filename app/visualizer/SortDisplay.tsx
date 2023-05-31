import Node from '@/components/Visualizers/Node';
import { Algorithms, NodeMetadata } from '@/lib/types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import QuickSortRow, { SubArrayBarrier } from './QuickSortRow';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { ControlBarContext } from '@/Context/ControlBarContext';

import { useMergeSort } from '@/hooks/useMergeSort';
import { useTransition, animated, config } from 'react-spring';
import MergeSortRow from './MergeSortRow';

type Props = {
  algorithm: Algorithms | undefined;
};

const SortDisplay = ({ algorithm }: Props) => {
  const historyNodesState = useContext(HistoryNodesContext);
  const controlBarData = useContext(ControlBarContext);
  const scrollRef = useRef<HTMLDivElement>(null);
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
  // this looks awful and is awful, current history is just one node,
  const { handleMergeSort } = useMergeSort({
    currentHistory: historyNodesState.historyNodes,
    tempHistoryArrayList: historyNodesState.mergeSortTempHistoryArrayList,
  });

  const { historyNodes, setHistoryNodes } = useContext(HistoryNodesContext);

  const firstRow = historyNodes[0]?.element;

  useEffect(() => {
    switch (algorithm) {
      case 'quick sort':
        historyNodesState.quickSortTempHistoryArrayList.current = [];
        handleQuickSort({
          arr: JSON.parse(JSON.stringify(firstRow ?? [])),
          onFinish: (sortedArr) => console.warn('not implemented'),
        });
        break;
      case 'merge sort':
        historyNodesState.mergeSortTempHistoryArrayList.current = [];
        handleMergeSort({
          arr: JSON.parse(JSON.stringify(firstRow ?? [])),
          onFinish: (sortedArr) => console.warn('not implemented'),
        });
        break;
      default:
        break;
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

  const truncatedMergeSortHistoryArray = [
    ...historyNodesState.mergeSortTempHistoryArrayList.current.slice(
      1,
      historyPointer + 1
    ),
  ];

  return (
    // have a floating box above each node showing it's +/- like a leader board
    <div ref={scrollRef} className="bg-primary">
      {algorithm === 'quick sort' &&
        [
          ...historyNodesState.historyNodes,
          ...truncatedQuickSortHistoryArray,
        ].map((historyNode, idx) => (
          <QuickSortRow historyNode={historyNode} key={idx} />
        ))}
      {algorithm === 'merge sort' &&
        [
          ...historyNodesState.historyNodes,
          ...truncatedMergeSortHistoryArray,
        ].map((historyNode, idx) => (
          <MergeSortRow historyNode={historyNode} key={idx} />
        ))}
      {algorithm === undefined &&
        // need to make history nodes just an object since we're now dealing with this as a single item array
        historyNodesState.historyNodes.map((historyNode, idx) => (
          <QuickSortRow historyNode={historyNode} key={idx} />
        ))}
    </div>
  );
};

export default SortDisplay;
