'use client';
import { AlgoComboBox } from '@/app/visualizer/AlgoComboBox';
import React, { useContext, useRef, useState } from 'react';
import Visualize from './Visualize';
import Node from '@/components/Visualizers/Node';
import {
  ControlBarContext,
  ControlBarContextData,
  ControlBarContextState,
  defaultState,
} from '../../Context/ControlBarContext';
import {
  Algorithms,
  DisplayTypes,
  HistoryNode,
  NodeMetadata,
} from '@/lib/types';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import SideBar from './SideBar';
import {
  INITIAL_SIDE_BAR_STATE,
  SideBarContext,
} from '@/Context/SideBarContext';

type Props = {
  children: React.ReactNode;
};
const Content = ({ children }: Props) => {
  const [historyNodes, setHistoryNodes] = useState<HistoryNode[]>([]);
  const quickSortTempHistoryArrayList = useRef<HistoryNode[]>([]);
  const mergeSortTempHistoryArrayList = useRef<HistoryNode[]>([]);
  const [sideBarState, setSideBarState] = useState(INITIAL_SIDE_BAR_STATE);

  const [controlBarState, setControlBarState] =
    useState<ControlBarContextState>(defaultState);

  return (
    <SideBarContext.Provider
      value={{
        sideBarState,
        setSideBarState,
      }}
    >
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
          {children}
        </ControlBarContext.Provider>
      </HistoryNodesContext.Provider>
    </SideBarContext.Provider>
  );
};

export default Content;
