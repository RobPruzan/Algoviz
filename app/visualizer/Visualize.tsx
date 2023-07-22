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
  SelectedValidatorLens,
  UndirectedEdge,
} from '@/lib/types';
import { useAppSelector } from '@/redux/store';
import { SideBarContext } from '@/context/SideBarContext';
import { useDepthFirstSearch } from '@/hooks/useDepthFirstSearch';
import { getSelectedItems } from '@/lib/utils';
import { SpeedSlider } from './Sort/SpeedSlider';
import { RedoIcon, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { CanvasActions, canvasReducer } from '@/redux/slices/canvasSlice';
import { ActionCreators } from 'redux-undo';
import AlgoHistorySlider from './Sort/AlgoHistorySlider';
type Props = {
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  canvasWidth: number | Percentage;
};

const Visualize = ({
  canvasWidth,
  selectedValidatorLens,
  setSelectedValidatorLens,
}: Props) => {
  const { sideBarState } = useContext(SideBarContext);
  const canvasPastStateLength = useAppSelector(
    (store) => store.canvas.past.length
  );

  const dispatch = useDispatch();
  // const { show } = useAppSelector((store) => store.canvas.present.variableInspector);
  const { attachableLines, circles } = useAppSelector(
    (store) => store.canvas.present
  );
  const [selectedControlBarAction, setSelectedControlBarAction] =
    useState<DrawTypes | null>(null);
  // if i were to redo this, i would just set the selected ids in state
  // const [selectedGeometryInfo, setSelectedGeometryInfo] =
  //   useState<SelectedGeometryInfo | null>(null);
  const selectedGeometryInfo = useAppSelector(
    (store) => store.canvas.present.selectedGeometryInfo
  );
  const { selectedAttachableLines, selectedCircles } = getSelectedItems({
    attachableLines,
    circles,
    selectedGeometryInfo,
  });

  const adjacencyList = Graph.getAdjacencyList({
    edges: selectedAttachableLines,
    vertices: selectedCircles,
  });

  const { handleDfs } = useDepthFirstSearch({
    adjacencyList,
    // temporary until select is implemented
    startingNode: [...adjacencyList.keys()].at(0) ?? '',
  });

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const width = canvasWrapperRef.current?.offsetWidth;
  const height = canvasWrapperRef.current?.offsetHeight;

  return (
    <div className={`flex w-full flex-col h-full items-center justify-start `}>
      <div className="w-full  border-2 border-2-b-0 rounded-b-none border-secondary ">
        {sideBarState.display === 'nodes' ? (
          <SortControlBar algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasControlBar
            setSelectedControlBarAction={setSelectedControlBarAction}
          />
        )}
      </div>
      <div
        ref={canvasWrapperRef}
        tabIndex={-1}
        className=" w-full overflow-y-scroll rounded-t-none h-full border-2 border-secondary border-t-0"
      >
        {sideBarState.display === 'nodes' ? (
          <SortDisplay algorithm={sideBarState.algorithm} />
        ) : (
          <>
            <CanvasDisplay
              selectedValidatorLens={selectedValidatorLens}
              setSelectedValidatorLens={setSelectedValidatorLens}
              canvasWrapperRef={canvasWrapperRef}
              canvasWidth={width ?? 1000}
              canvasHeight={height ?? 1000}
              selectedControlBarAction={selectedControlBarAction}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Visualize;
