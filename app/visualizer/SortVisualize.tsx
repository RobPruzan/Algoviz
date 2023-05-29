import React from 'react';
import ControlBar from './ControlBar';
import SortDisplay from './SortDisplay';
import { Algorithms } from '@/lib/types';

type Props = {
  algorithm: Algorithms | undefined;
};

const SortVisualize = ({ algorithm: algorithm }: Props) => {
  return (
    <div className="flex w-4/6 flex-col h-[900px] items-center justify-center ">
      <div className="w-full border-2 border-b-0 rounded-b-none border-foreground rounded-md">
        <ControlBar algorithm={algorithm} />
      </div>
      <div className="w-full overflow-y-scroll rounded-t-none h-4/5 border-2 border-foreground rounded-md">
        <SortDisplay algorithm={algorithm} />
      </div>
    </div>
  );
};

export default SortVisualize;
