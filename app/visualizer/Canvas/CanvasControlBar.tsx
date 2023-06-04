import { Button } from '@/components/ui/button';
import { CircleReceiver, AttachableLine } from '@/lib/types';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, { Dispatch, SetStateAction } from 'react';

type Props = {
  circles: CircleReceiver[];
  setCircles: Dispatch<SetStateAction<CircleReceiver[]>>;
  attachableLines: AttachableLine[];
  setAttachableLines: Dispatch<SetStateAction<AttachableLine[]>>;
};

const CanvasControlBar = ({}: Props) => {
  const dispatch = useAppDispatch();
  const { attachableLines } = useAppSelector((store) => store.canvas);
  const handleAddRect = () => {
    const [x1, y1] = [Math.random() * 400, Math.random() * 400];
    const newLine: AttachableLine = {
      id: crypto.randomUUID(),
      type: 'rect',
      x1,
      y1,
      x2: x1 - 10,
      y2: y1 - 50,
      width: 7,
      color: 'white',
      attachNodeOne: {
        center: [x1, y1],
        radius: 7,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node1',
        connectedToId: null,
      },
      attachNodeTwo: {
        center: [x1 - 10, y1 - 50],
        radius: 7,
        color: '#42506e',
        id: crypto.randomUUID(),
        type: 'node2',
        connectedToId: null,
      },
    };

    dispatch(CanvasActions.addLine(newLine));
  };

  const handleAddCircle = () => {
    const circleCenter: [number, number] = [
      Math.random() * 400,
      Math.random() * 400,
    ];
    const circleRadius = 50;
    const newNodeConnector: CircleReceiver['nodeReceiver'] = {
      id: crypto.randomUUID(),
      center: circleCenter,
      radius: circleRadius / 5,
      color: '#42506e',
      type: 'circle',
      attachedIds: [],
    };
    const newCircle: CircleReceiver = {
      id: crypto.randomUUID(),
      type: 'circle',
      center: circleCenter,
      radius: circleRadius,
      color: '#181e2b',
      nodeReceiver: newNodeConnector,
    };

    // setCircles((prevCircles) => [...prevCircles, newCircle]);
    dispatch(CanvasActions.addCircle(newCircle));
  };
  return (
    <div className="w-full border-b-4 border-secondary h-20 flex items-center justify-evenly">
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleAddCircle}
      >
        Add Circle
      </Button>
      <Button
        className="bg-secondary hover:bg-primary border border-secondary"
        onClick={handleAddRect}
      >
        Add Line
      </Button>
    </div>
  );
};

export default CanvasControlBar;
