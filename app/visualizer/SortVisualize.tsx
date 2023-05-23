import React from 'react';
import ControlBar from './ControlBar';
import SortDisplay from './SortDisplay';

type Props = {
  algorithm: string;
};

const SortVisualize = ({ algorithm }: Props) => {
  return (
    <div className="w-[750px] h-[90%] border-4 border-secondary rounded-md">
      <ControlBar />

      <SortDisplay />
    </div>
  );
};

export default SortVisualize;
