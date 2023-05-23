import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
import React, { useState } from 'react';
import SortRow from './SortRow';
import { NodesContext } from '../Context/NodesContext';

type Props = {};

const SortDisplay = (props: Props) => {
  const [nodeRows, setNodeRows] = useState<NodeMetadata[][]>([]);

  return (
    <NodesContext.Provider
      value={{
        nodeRows: nodeRows,
        setNodeRows: setNodeRows,
      }}
    >
      <div className="w-full h-4/6 bg-primary">
        {nodeRows.map((nodes) => (
          <SortRow nodes={nodes} key={nodes.toString()} />
        ))}
      </div>
    </NodesContext.Provider>
  );
};

export default SortDisplay;
