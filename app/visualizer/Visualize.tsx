'use client';
import React, { useContext, useState } from 'react';
import SortControlBar from './Sort/SortControlBar';
import SortDisplay from './Sort/SortDisplay';
import { SideBarContext } from '@/Context/SideBarContext';
import CanvasDisplay from './Canvas/CanvasDisplay';
import CanvasControlBar from './Canvas/CanvasControlBar';
import { CircleReceiver, Edge } from '@/lib/types';
import { useAppSelector } from '@/redux/store';

const Visualize = () => {
  const { sideBarState } = useContext(SideBarContext);
  const { show } = useAppSelector((store) => store.canvas.variableInspector);

  return (
    <div
      className={`flex  ${
        show ? ' w-3/6' : 'w-4/6'
      } flex-col h-[85%] items-center justify-start `}
    >
      <div className="w-full border-2 border-b-0 rounded-b-none border-foreground rounded-md">
        {sideBarState.display === 'nodes' ? (
          <SortControlBar algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasControlBar />
        )}
      </div>
      <div className="w-full overflow-y-scroll rounded-t-none h-full border-2 border-foreground rounded-md">
        {sideBarState.display === 'nodes' ? (
          <SortDisplay algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasDisplay />
        )}
      </div>
    </div>
  );
};

export default Visualize;
