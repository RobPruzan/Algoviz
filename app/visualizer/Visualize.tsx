'use client';
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from 'react';
import SortControlBar from './Sort/SortControlBar';
import SortDisplay from './Sort/SortDisplay';
import * as Graph from '@/lib/graph';
import CanvasDisplay from './Canvas/CanvasDisplay';
import CanvasControlBar from './Canvas/CanvasControlBar';
import {
  CircleReceiver,
  DrawTypes,
  IO,
  Percentage,
  SelectedGeometryInfo,
  UndirectedEdge,
} from '@/lib/types';
import { useAppSelector } from '@/redux/store';
import { SideBarContext } from '@/context/SideBarContext';
import { useDepthFirstSearch } from '@/hooks/useDepthFirstSearch';
type Props = {
  canvasWidth: number | Percentage;
};
const Visualize = ({ canvasWidth }: Props) => {
  const { sideBarState } = useContext(SideBarContext);
  // const { show } = useAppSelector((store) => store.canvas.variableInspector);
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  const [selectedControlBarAction, setSelectedControlBarAction] =
    useState<DrawTypes | null>(null);
  // if i were to redo this, i would just set the selected ids in state
  // const [selectedGeometryInfo, setSelectedGeometryInfo] =
  //   useState<SelectedGeometryInfo | null>(null);
  const selectedGeometryInfo = useAppSelector(
    (store) => store.canvas.selectedGeometryInfo
  );
  const selectedAttachableLines = attachableLines.filter((line) =>
    selectedGeometryInfo?.selectedIds.includes(line.id)
  );
  const selectedCircles = circles.filter((circle) =>
    selectedGeometryInfo?.selectedIds.includes(circle.id)
  );

  const adjacencyList = Graph.getAdjacencyList({
    edges: selectedAttachableLines,
    vertices: selectedCircles,
  });
  const socketRef = useRef<IO>();

  const { handleDfs } = useDepthFirstSearch({
    adjacencyList,
    // temporary until select is implemented
    startingNode: [...adjacencyList.keys()].at(0) ?? '',
  });
  const notSignedInUserIdRef = useRef(crypto.randomUUID());

  return (
    <div className={`flex w-full flex-col h-full items-center justify-start `}>
      <div className="w-full  border-2 border-2-b-0 rounded-b-none border-secondary ">
        {sideBarState.display === 'nodes' ? (
          <SortControlBar algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasControlBar
            notSignedInUserId={notSignedInUserIdRef.current}
            setSelectedControlBarAction={setSelectedControlBarAction}
            socketRef={socketRef}
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
            notSignedInUserId={notSignedInUserIdRef.current}
            socketRef={socketRef}
            canvasWidth={canvasWidth}
            selectedControlBarAction={selectedControlBarAction}
            // setSelectedControlBarAction={setSelectedControlBarAction}
            // handleDfs={handleDfs}
          />
        )}
      </div>
    </div>
  );
};

export default Visualize;
