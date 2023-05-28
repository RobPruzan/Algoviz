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
import { HistoryNode, NodeMetadata } from '@/lib/types';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';

const Content = () => {
  const [historyNodes, setHistoryNodes] = useState<HistoryNode[]>([]);
  const tempHistoryArrayList = useRef<HistoryNode[]>([]);
  const [algorithm, setAlgorithm] = useState<string>('');
  const [controlBarState, setControlBarState] =
    useState<ControlBarContextState>(defaultState);
  return (
    <HistoryNodesContext.Provider
      value={{
        historyNodes,
        setHistoryNodes,
        tempHistoryArrayList,
      }}
    >
      <ControlBarContext.Provider
        value={{
          controlBarState,
          setControlBarState,
        }}
      >
        <div className="w-44 min-w-fit h-[90%] rounded-md border-2 border-foreground flex flex-col justify-start items-center p-5">
          <AlgoComboBox value={algorithm} setValue={setAlgorithm} />
        </div>
        <SortVisualize algorithm={algorithm} />
      </ControlBarContext.Provider>
    </HistoryNodesContext.Provider>
  );
};

export default Content;
