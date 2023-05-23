import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
import React, { useContext, useState } from 'react';
import SortRow from './SortRow';
import { NodesContext } from '../../Context/NodesContext';

type Props = {};

const SortDisplay = (props: Props) => {
  const { nodeRows } = useContext(NodesContext);

  return (
    <div className=" h-4/6 bg-primary">
      {nodeRows.map((nodes) => (
        <SortRow nodes={nodes} key={nodes.toString()} />
      ))}
    </div>
  );
};

export default SortDisplay;
