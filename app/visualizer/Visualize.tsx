import React, { useContext, useState } from 'react';
import SortControlBar from './Sort/SortControlBar';
import SortDisplay from './Sort/SortDisplay';
import { SideBarContext } from '@/Context/SideBarContext';
import CanvasDisplay from './Canvas/CanvasDisplay';
import CanvasControlBar from './Canvas/CanvasControlBar';
import { CircleReceiver, AttachableLine } from '@/lib/types';

const Visualize = () => {
  const { sideBarState } = useContext(SideBarContext);
  const [circles, setCircles] = useState<CircleReceiver[]>([]);
  const [attachableLines, setAttachableLines] = useState<AttachableLine[]>([]);

  return (
    <div className="flex w-4/6 flex-col h-[85%] items-center justify-start ">
      <div className="w-full border-2 border-b-0 rounded-b-none border-foreground rounded-md">
        {sideBarState.display === 'nodes' ? (
          <SortControlBar algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasControlBar
            attachableLines={attachableLines}
            circles={circles}
            setAttachableLines={setAttachableLines}
            setCircles={setCircles}
          />
        )}
      </div>
      <div className="w-full overflow-y-scroll rounded-t-none h-full border-2 border-foreground rounded-md">
        {sideBarState.display === 'nodes' ? (
          <SortDisplay algorithm={sideBarState.algorithm} />
        ) : (
          <CanvasDisplay
            attachableLines={attachableLines}
            circles={circles}
            setAttachableLines={setAttachableLines}
            setCircles={setCircles}
          />
        )}
      </div>
    </div>
  );
};

export default Visualize;
