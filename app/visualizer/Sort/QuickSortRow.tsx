import Node from '@/components/Visualizers/Node';
import { HistoryNode, NodeMetadata } from '@/lib/types';
import {
  ArrowUp,
  Braces,
  Brackets,
  CarrotIcon,
  Minus,
  Play,
  Pointer,
} from 'lucide-react';
import { ComponentProps, useState } from 'react';

type Props = {
  historyNode: HistoryNode;
};

const QuickSortRow = ({ historyNode }: Props) => {
  return (
    <div className="flex w-full">
      <div className="p-4  w-3/4  border-2-secondary border-2-y flex items-center justify-evenly">
        {historyNode.element.map((node, idx) =>
          historyNode.fakeArrayBounds?.[0] === idx ? (
            <NodeWithLeftBound
              hasPointer={historyNode.pivotPointerPosition === idx - 1}
              key={node.id}
              node={node}
            />
          ) : historyNode.fakeArrayBounds?.[1] === idx ? (
            <NodeWithRightBound
              hasPointer={historyNode.pivotPointerPosition === idx - 1}
              key={node.id}
              node={node}
            />
          ) : historyNode.pivotPointerPosition === idx - 1 ? (
            <NodeWithPointer key={node.id} node={node} />
          ) : (
            <Node fill={node.color} key={node.id} value={node.value} />
          )
        )}
      </div>
      <div className="flex flex-col p-4 justify-center items-center w-1/4 text-foreground font-bold border-2-l-2 border-2-l-foreground border-2-b-foreground border-2-b ">
        {historyNode.stateContext}
      </div>
    </div>
  );
};

function NodeWithPointer({ node }: { node: NodeMetadata }) {
  return (
    <>
      <Play className="w-6 h-6 mt-auto -rotate-90 fill-white" />
      <Node fill={node.color} key={node.id} value={node.value} />
    </>
  );
}

function NodeWithLeftBound({
  node,
  hasPointer = false,
}: {
  node: NodeMetadata;
  hasPointer?: boolean;
}) {
  return (
    <>
      <SubArrayBarrier />

      {hasPointer && <Play className="fill-white w-6 h-6 mt-auto -rotate-90" />}
      <Node fill={node.color} key={node.id} value={node.value} />
    </>
  );
}

function NodeWithRightBound({
  node,
  hasPointer = false,
}: {
  node: NodeMetadata;
  hasPointer?: boolean;
}) {
  return (
    <>
      {hasPointer && <Play className="fill-white w-6 h-6 mt-auto -rotate-90" />}
      <Node fill={node.color} key={node.id} value={node.value} />
      {/* <div className="flex flex-col justify-center items-center">|</div> */}
      {/* <Brackets /> */}
      <SubArrayBarrier />
    </>
  );
}

export function SubArrayBarrier() {
  return (
    <div className="flex flex-col justify-center items-center">
      <Minus size={75} className="rotate-90" />
    </div>
  );
}

export default QuickSortRow;
