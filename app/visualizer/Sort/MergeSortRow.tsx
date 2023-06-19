import { HistoryNode } from '@/lib/types';
import React from 'react';
import Node from '@/components/Visualizers/Node';
import { SubArrayBarrier } from './QuickSortRow';

type Props = {
  historyNode: HistoryNode;
};

const MergeSortRow = ({ historyNode }: Props) => {
  return (
    <div className="flex w-full">
      <div className="p-4  w-3/4  border-foreground border-y flex items-center justify-evenly">
        {historyNode.element.map((node, idx) => (
          <>
            <Node fill={node.color} key={node.id} value={node.value} />
            {node.hasNext === false && <SubArrayBarrier />}
          </>
        ))}
      </div>
      <div className="flex flex-col p-4 justify-center items-center w-1/4 text-foreground font-bold border-l-2 border-l-foreground border-b-foreground border-b ">
        {historyNode.stateContext}
      </div>
    </div>
  );
};

export default MergeSortRow;
