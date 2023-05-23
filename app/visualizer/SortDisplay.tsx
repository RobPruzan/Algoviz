import Node from '@/components/Visualizers/Node';
import React from 'react';

type Props = {};

type NodesMetadata = {
  value: number;
  position: number;
  id: number;
}[];

const SortDisplay = (props: Props) => {
  const [sortMetaData, setSortMetaData] = React.useState<NodesMetadata[]>([]);

  return (
    <div className="w-full h-4/6 bg-primary">
      {sortMetaData.map((nodes) => (
        <div key={nodes.toString()} className="border-2 border-secondary">
          {nodes.map((node, index) => (
            <Node key={node.id} value={node.value} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SortDisplay;
