import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import SortRow from './SortRow';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { ControlBarContext } from '@/Context/ControlBarContext';
import { getHistoryArray } from '@/lib/utils';

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
  // useEffect(() => {
  //   scrollRef.current?.scrollTo(0, scrollRef.current?.scrollHeight);
  // }, [scrollRef]);

  const historyPointer = controlBarData.controlBarState.historyPointer;

  const { handleQuickSort } = useQuickSort({
    currentHistory: historyNodesState.historyNodes,
    tempHistoryArrayList: historyNodesState.tempHistoryArrayList,
  });
  const { historyNodes, setHistoryNodes } = useContext(HistoryNodesContext);

  const firstRow = historyNodes[0]?.element;
  // this sucks, need constant reference for handle quickSort
  const { sorted } = useMemo(
    () =>
      handleQuickSort({
        arr: JSON.parse(JSON.stringify(firstRow ?? [])),
        onFinish: (sortedArr) => console.warn('not implemented'),
      }),
    [firstRow]
  );

  console.log(
    'da sorted result',

    historyNodesState.tempHistoryArrayList
  );

  return (
    <div ref={scrollRef} className="bg-primary">
      {getHistoryArray(
        historyNodesState.tempHistoryArrayList.current,
        historyPointer
      ).map((historyNode) => (
        <SortRow
          historyNode={historyNode}
          key={historyNode.element.map((_) => _.id).join('')}
        />
      ))}
    </div>
  );
};

export default SortDisplay;
