'use client';
import { AlgoComboBox } from '@/app/visualizer/Sort/AlgoComboBox';
import React, { useContext, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import Visualize from './Visualize';
import Node from '@/components/Visualizers/Node';

import {
  Algorithms,
  DisplayTypes,
  HistoryNode,
  NodeMetadata,
} from '@/lib/types';

import SideBar from './SideBar';
import {
  INITIAL_SIDE_BAR_STATE,
  SideBarContext,
} from '@/context/SideBarContext';
import { store } from '@/redux/store';
import {
  ControlBarContextState,
  defaultState,
  ControlBarContext,
} from '@/context/ControlBarContext';
import { HistoryNodesContext } from '@/context/HistoryNodesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <Provider store={store}>
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
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </ControlBarContext.Provider>
        </HistoryNodesContext.Provider>
      </SideBarContext.Provider>
    </Provider>
  );
};

export default Content;
