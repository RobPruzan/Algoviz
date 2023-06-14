'use client';
import React, { useContext, useState } from 'react';
import SortControlBar from './Sort/SortControlBar';
import SortDisplay from './Sort/SortDisplay';
import * as Graph from '@/lib/graph';
import CanvasDisplay from './Canvas/CanvasDisplay';
import CanvasControlBar from './Canvas/CanvasControlBar';
import {
  CircleReceiver,
  SelectedGeometryInfo,
  UndirectedEdge,
} from '@/lib/types';
import { useAppSelector } from '@/redux/store';
import { SideBarContext } from '@/context/SideBarContext';
import { useDepthFirstSearch } from '@/hooks/useDepthFirstSearch';

const Visualize = () => {
  const { sideBarState } = useContext(SideBarContext);
  const { show } = useAppSelector((store) => store.canvas.variableInspector);
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);

  const [selectedGeometryInfo, setSelectedGeometryInfo] =
    useState<SelectedGeometryInfo | null>(null);
  const selectedAttachableLines = attachableLines.filter((line) =>
    selectedGeometryInfo?.selectedIds.has(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.has(circle.id)
  );

  const adjacencyList = Graph.getAdjacencyList({
    edges: selectedAttachableLines,
    vertices: selectedCircles,
  });

  const { handleDfs } = useDepthFirstSearch({
    adjacencyList,
    // temporary until select is implemented
    startingNode: [...adjacencyList.keys()].at(0) ?? '',
  });
  return (
    <div
      className={`flex  ${
        show ? ' w-3/6' : 'w-4/6'
      } flex-col h-[85%] items-center justify-start `}
    >
      <div className="w-full border-2 border-b-0 rounded-b-none border-foreground rounded-md">
        {sideBarState.display === 'nodes' ? (
          <SortControlBar algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasControlBar handleDfs={handleDfs} />
        )}
      </div>
      <div className="w-full overflow-y-scroll rounded-t-none h-full border-2 border-foreground rounded-md">
        {sideBarState.display === 'nodes' ? (
          <SortDisplay algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasDisplay
            handleDfs={handleDfs}
            selectedGeometryInfo={selectedGeometryInfo}
            setSelectedGeometryInfo={setSelectedGeometryInfo}
          />
        )}
      </div>
    </div>
  );
};

export default Visualize;
