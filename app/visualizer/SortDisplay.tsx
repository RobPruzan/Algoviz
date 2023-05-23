import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
import React, { useContext, useState } from 'react';
import SortRow from './SortRow';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { ControlBarContext } from '@/Context/ControlBarContext';
import { getHistoryArray } from '@/lib/utils';

type Props = {};

const SortDisplay = (props: Props) => {
  const historyNodesState = useContext(HistoryNodesContext);
  const controlBarData = useContext(ControlBarContext);

  const historyPointer = controlBarData.state.historyPointer;
  const tailToHeadHistory = getHistoryArray(historyPointer);

  console.log('debug', historyNodesState, tailToHeadHistory);

  return (
    <div className="h-4/6 bg-primary">
      {tailToHeadHistory.map((historyNode) => (
        <SortRow
          nodes={historyNode.element}
          key={historyNode.element.toString()}
        />
      ))}
    </div>
  );
};

export default SortDisplay;
