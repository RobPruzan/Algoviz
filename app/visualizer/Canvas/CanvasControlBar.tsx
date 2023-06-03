import { CircleReceiver, AttachableLine } from '@/lib/types';
import React, { Dispatch, SetStateAction } from 'react';

type Props = {
  circles: CircleReceiver[];
  setCircles: Dispatch<SetStateAction<CircleReceiver[]>>;
  attachableLines: AttachableLine[];
  setAttachableLines: Dispatch<SetStateAction<AttachableLine[]>>;
};

const CanvasControlBar = ({
  attachableLines,
  circles,
  setAttachableLines,
  setCircles,
}: Props) => {
  return (
    <div className="w-full border-b-4 border-secondary h-20 flex items-center justify-evenly">
      hello
    </div>
  );
};

export default CanvasControlBar;
