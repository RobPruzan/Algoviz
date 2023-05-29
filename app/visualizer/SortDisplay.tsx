import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
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

type Props = {};

const SortDisplay = (props: Props) => {
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
    tempHistoryArrayList: historyNodesState.tempHistoryArrayList,
  });

  const { historyNodes, setHistoryNodes } = useContext(HistoryNodesContext);

  const firstRow = historyNodes[0]?.element;

  const { sorted } = useMemo(
    () =>
      handleQuickSort({
        arr: JSON.parse(JSON.stringify(firstRow ?? [])),
        onFinish: (sortedArr) => console.warn('not implemented'),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstRow]
  );
  // const { handleMergeSort } = useMergeSort({
  //   currentHistory: historyNodesState.historyNodes,
  //   tempHistoryArrayList: historyNodesState.tempHistoryArrayList,
  // });

  const truncatedHistoryArray = [
    ...historyNodesState.tempHistoryArrayList.current.slice(
      0,
      historyPointer + 1
    ),
  ];

  return (
    // we want to have the -/+ that each node moved each step. Then after it's rendered, we begin an animation sequence that shows the nodes being moved to their actual position
    <div ref={scrollRef} className="bg-primary">
      {truncatedHistoryArray.length > 0 ? (
        truncatedHistoryArray.map((historyNode, idx) => (
          <SortRow historyNode={historyNode} key={idx} />
        ))
      ) : (
        <div className="flex w-full justify-center items-center mt-5 text-foreground font-bold text-3xl opacity-40">
          Add some nodes to get started!
        </div>
      )}
    </div>
  );
};

export default SortDisplay;
