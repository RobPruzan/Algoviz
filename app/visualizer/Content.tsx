import { AlgoComboBox } from '@/app/visualizer/AlgoComboBox';
import React, { useState } from 'react';
import SortVisualize from './Visualize';
import Node from '@/components/Visualizers/Node';
import {
  ControlBarContext,
  ControlBarContextState,
  defaultState,
} from '../Context/ControlBarContext';

type Props = {};

const Content = (props: Props) => {
  const [algorithm, setAlgorithm] = useState<string>('');
  const [controlBarState, setControlBarState] =
    useState<ControlBarContextState>(defaultState);
  return (
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
  );
};

export default Content;
