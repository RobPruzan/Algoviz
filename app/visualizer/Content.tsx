import { AlgoComboBox } from '@/app/visualizer/AlgoComboBox';
import React, { useState } from 'react';
import SortVisualize from './SortVisualize';
import Node from '@/components/Visualizers/Node';
import {
  ControlBarContext,
  ControlBarContextState,
  defaultState,
} from '../Context/ControlBarContext';
import { NodeMetadata } from '@/lib/types';
import { NodesContext } from '../Context/NodesContext';

const Content = () => {
  const [nodeRows, setNodeRows] = useState<NodeMetadata[][]>([]);

  const [algorithm, setAlgorithm] = useState<string>('');
  const [controlBarState, setControlBarState] =
    useState<ControlBarContextState>(defaultState);
  return (
    <NodesContext.Provider
      value={{
        nodeRows: nodeRows,
        setNodeRows: setNodeRows,
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
    </NodesContext.Provider>
  );
};

export default Content;
