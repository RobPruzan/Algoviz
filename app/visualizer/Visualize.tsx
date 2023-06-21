'use client';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import SortControlBar from './Sort/SortControlBar';
import SortDisplay from './Sort/SortDisplay';
import * as Graph from '@/lib/graph';
import CanvasDisplay from './Canvas/CanvasDisplay';
import CanvasControlBar from './Canvas/CanvasControlBar';
import {
  CircleReceiver,
  DrawTypes,
  Percentage,
  SelectedGeometryInfo,
  UndirectedEdge,
} from '@/lib/types';
import { useAppSelector } from '@/redux/store';
import { SideBarContext } from '@/context/SideBarContext';
import { useDepthFirstSearch } from '@/hooks/useDepthFirstSearch';
type Props = {
  canvasWidth: number | Percentage;
  selectedGeometryInfo: SelectedGeometryInfo | null;
  setSelectedGeometryInfo: Dispatch<
    SetStateAction<SelectedGeometryInfo | null>
  >;
};
const Visualize = ({
  selectedGeometryInfo,
  setSelectedGeometryInfo,
  canvasWidth,
}: Props) => {
  const { sideBarState } = useContext(SideBarContext);
  const { show } = useAppSelector((store) => store.canvas.variableInspector);
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  const [selectedControlBarAction, setSelectedControlBarAction] =
    useState<DrawTypes | null>(null);
  // if i were to redo this, i would just set the selected ids in state
  // const [selectedGeometryInfo, setSelectedGeometryInfo] =
  //   useState<SelectedGeometryInfo | null>(null);
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
    <div className={`flex w-full flex-col h-full items-center justify-start `}>
      <div className="w-full  border-2 border-2-b-0 rounded-b-none border-secondary ">
        {sideBarState.display === 'nodes' ? (
          <SortControlBar algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasControlBar
            selectedControlBarAction={selectedControlBarAction}
            setSelectedControlBarAction={setSelectedControlBarAction}
            handleDfs={handleDfs}
          />
        )}
      </div>
      <div
        tabIndex={-1}
        className=" w-full overflow-y-scroll rounded-t-none h-full border-2 border-secondary border-t-0"
      >
        {sideBarState.display === 'nodes' ? (
          <SortDisplay algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasDisplay
            canvasWidth={canvasWidth}
            selectedControlBarAction={selectedControlBarAction}
            setSelectedControlBarAction={setSelectedControlBarAction}
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
