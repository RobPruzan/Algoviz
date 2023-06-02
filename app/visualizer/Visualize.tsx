import React, { useContext } from 'react';
import ControlBar from './ControlBar';
import SortDisplay from './SortDisplay';
import { SideBarContext } from '@/Context/SideBarContext';

const Visualize = () => {
  const { sideBarState } = useContext(SideBarContext);

  return (
    <div className="flex w-4/6 flex-col h-[85%] items-center justify-start ">
      <div className="w-full border-2 border-b-0 rounded-b-none border-foreground rounded-md">
        <ControlBar algorithm={sideBarState.algorithm} />
      </div>
      <div className="w-full overflow-y-scroll rounded-t-none h-full border-2 border-foreground rounded-md">
        {sideBarState.display === 'nodes' ? (
          <SortDisplay algorithm={sideBarState.algorithm} />
        ) : (
          <p>Hello</p>
        )}
      </div>
    </div>
  );
};

export default Visualize;
