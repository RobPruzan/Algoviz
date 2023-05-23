import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
import React, { useContext, useState } from 'react';
import SortRow from './SortRow';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { ControlBarContext } from '@/Context/ControlBarContext';

type Props = {};

const SortDisplay = (props: Props) => {
  const historyNodesState = useContext(HistoryNodesContext);

  return (
    <div className=" h-4/6 bg-primary">
      {historyNodesState.historyNodes.map((historyNode) => (
        <SortRow
          nodes={historyNode.element}
          key={historyNode.element.toString()}
        />
      ))}
    </div>
  );
};

export default SortDisplay;
