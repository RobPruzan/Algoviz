import { AlgoComboBox } from '@/app/visualizer/AlgoComboBox';
import React, { useState } from 'react';
import SortVisualize from './SortVisualize';
import Node from '@/components/Visualizers/Node';
import {
  ControlBarContext,
  ControlBarContextData,
  ControlBarContextState,
  defaultState,
} from '../../Context/ControlBarContext';
import { HistoryNode, NodeMetadata } from '@/lib/types';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';

const Content = () => {
  const [historyNodes, setHistoryNodes] = useState<HistoryNode[]>([]);

  const [algorithm, setAlgorithm] = useState<string>('');
  const [controlBarState, setControlBarState] =
    useState<ControlBarContextState>(defaultState);
  return (
    <HistoryNodesContext.Provider
      value={{
        historyNodes: historyNodes,
        setHistoryNodes: setHistoryNodes,
      }}
    >
      <ControlBarContext.Provider
        value={{
          state: controlBarState,
          setState: setControlBarState,
        }}
      >
        <div className="w-44 min-w-fit h-[90%] rounded-md border-4 border-secondary flex flex-col justify-start items-center p-5">
          <AlgoComboBox value={algorithm} setValue={setAlgorithm} />
        </div>
        <SortVisualize algorithm={algorithm} />
      </ControlBarContext.Provider>
    </HistoryNodesContext.Provider>
  );
};

export default Content;
