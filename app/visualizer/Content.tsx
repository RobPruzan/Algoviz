import { AlgoComboBox } from '@/app/visualizer/AlgoComboBox';
import React, { useRef, useState } from 'react';
import SortVisualize from './SortVisualize';
import Node from '@/components/Visualizers/Node';
import {
  ControlBarContext,
  ControlBarContextData,
  ControlBarContextState,
  defaultState,
} from '../../Context/ControlBarContext';
import { Algorithms, HistoryNode, NodeMetadata } from '@/lib/types';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import SideBar from './SideBar';

const Content = () => {
  const [historyNodes, setHistoryNodes] = useState<HistoryNode[]>([]);
  const quickSortTempHistoryArrayList = useRef<HistoryNode[]>([]);
  const mergeSortTempHistoryArrayList = useRef<HistoryNode[]>([]);
  const [algorithm, setAlgorithm] = useState<Algorithms>();
  const [controlBarState, setControlBarState] =
    useState<ControlBarContextState>(defaultState);
  return (
    <HistoryNodesContext.Provider
      value={{
        historyNodes,
        setHistoryNodes,
        quickSortTempHistoryArrayList,
        mergeSortTempHistoryArrayList,
      }}
    >
      <ControlBarContext.Provider
        value={{
          controlBarState,
          setControlBarState,
        }}
      >
        <SideBar algorithm={algorithm} setAlgorithm={setAlgorithm} />
        <SortVisualize algorithm={algorithm} />
      </ControlBarContext.Provider>
    </HistoryNodesContext.Provider>
  );
};

export default Content;
