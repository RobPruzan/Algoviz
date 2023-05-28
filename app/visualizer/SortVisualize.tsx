import React from 'react';
import ControlBar from './ControlBar';
import SortDisplay from './SortDisplay';

type Props = {
  algorithm: string;
};

const SortVisualize = ({ algorithm }: Props) => {
  return (
    <div className="flex flex-col h-[900px] items-center justify-center w-4/5">
      <div className="w-full border-2 border-b-0 rounded-b-none border-foreground rounded-md">
        <ControlBar />
      </div>
      <div className="w-full overflow-y-scroll rounded-t-none h-4/5 border-2 border-foreground rounded-md">
        <SortDisplay />
      </div>
    </div>
  );
};

export default SortVisualize;
