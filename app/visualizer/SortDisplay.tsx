import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
import React, { useContext, useMemo, useState } from 'react';
import SortRow from './SortRow';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { ControlBarContext } from '@/Context/ControlBarContext';
import { getHistoryArray } from '@/lib/utils';

type Props = {};

const SortDisplay = (props: Props) => {
  const historyNodesState = useContext(HistoryNodesContext);
  const controlBarData = useContext(ControlBarContext);

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
    [firstRow]
  );

  console.log(
    'da sorted result',

    historyNodesState.tempHistoryArrayList
  );

  // const tailToHeadHistory = [
  //   ...historyNodes,
  //   ...getHistoryArray(tempHistoryArrayList, historyPointer),
  // ];

  // console.log(
  //   'the history array',
  //   getHistoryArray(tempHistoryArrayList, historyPointer)
  // );

  return (
    <div className="bg-primary">
      {getHistoryArray(
        historyNodesState.tempHistoryArrayList.current,
        historyPointer
      ).map((historyNode) => (
        <SortRow nodes={historyNode.element} key={Date.now() + Math.random()} />
      ))}
    </div>
  );
};

export default SortDisplay;
