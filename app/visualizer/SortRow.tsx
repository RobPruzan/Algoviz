import Node from '@/components/Visualizers/Node';
import { NodeMetadata } from '@/lib/types';
import { useState } from 'react';

type Props = {
  nodes: NodeMetadata[];
};

const SortRow = ({ nodes }: Props) => {
  return (
    <div className="p-4 overflow-y-scroll w-full  border-foreground border-y flex justify-evenly">
      {nodes.map((node) => (
        <Node key={node.id} value={node.value} />
      ))}
    </div>
  );
};

export default SortRow;
