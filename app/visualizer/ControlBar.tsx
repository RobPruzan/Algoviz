import React, { useContext, useRef, useState } from 'react';
import { SpeedSlider } from './SpeedSlider';
import {
  MinusCircle,
  MinusIcon,
  Pause,
  Play,
  Plus,
  PlusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ControlBarContext } from '../../Context/ControlBarContext';
import { NodesContext } from '../../Context/NodesContext';

type Props = {};

const ControlBar = (props: Props) => {
  const [test, setTest] = useState(0);

  const {
    state: { multiplier, playing },
    setState: setControlBarState,
  } = useContext(ControlBarContext);
  const { nodeRows, setNodeRows } = useContext(NodesContext);

  const numItems = nodeRows.length === 1 ? nodeRows[0].length : 0;

  const handleAddNode = () => {
    if (nodeRows.length > 1) {
      return;
    }
    const newNode = {
      value: Math.floor(Math.random() * 100),
      id: crypto.randomUUID(),
      position: 0,
      next: null,
      color: 'white',
    };
    if (nodeRows.length == 0) {
      setNodeRows([[newNode]]);
      return;
    }

    const currentNodeRow = nodeRows[0];
    const lastInsert = currentNodeRow.at(-1);
    lastInsert ? (lastInsert.next = newNode) : null;
    console.log('rows', nodeRows);

    // ideal behavior is an initial node array/discriminated union for holding nodes, but just updating the array and blocking adds else will work
    setNodeRows((prev) => [[...currentNodeRow, newNode]]);
  };

  const handleRemoveItem = () => {
    console.log(nodeRows);
    if (nodeRows.length > 1) {
      return;
    }
    if (nodeRows.length == 0) {
      return;
    }
    const currentNodeRow = nodeRows[0];
    if (currentNodeRow.length === 0) {
      return;
    }
    const newTail = currentNodeRow.at(-2);
    newTail ? (newTail.next = null) : null;
    setNodeRows((prev) => [[...currentNodeRow.slice(0, -1)]]);
  };

  return (
    <div className="w-full border-b-4 border-secondary h-20 flex items-center justify-evenly">
      {playing ? (
        <Pause
          onClick={() =>
            setControlBarState((prevState) => ({
              ...prevState,
              playing: false,
            }))
          }
          size={32}
          className="cursor-pointer hover:scale-105 transition animate-pulse"
        />
      ) : (
        <Play
          onClick={() =>
            setControlBarState((prev) => ({ ...prev, playing: true }))
          }
          className="cursor-pointer hover:scale-105 transition "
          size={32}
        />
      )}
      <div className="w-2/5 flex justify-evenly">
        <SpeedSlider
          min={0}
          max={10}
          value={multiplier}
          onValueChange={(value) =>
            setControlBarState((prev) => ({ ...prev, multiplier: value }))
          }
        />
        <label className="font-bold">x{multiplier}</label>
      </div>
      <div className="flex justify-evenly items-center w-1/4 ">
        <label className="font-bold">Items: {numItems}</label>

        <div className="bg-secondary flex border border-primary rounded-md">
          <Button
            onClick={handleAddNode}
            className="bg-primary border-r rounded-r-none  border-primary w-1/2 p-3 hover:bg-slate-800  "
          >
            <PlusIcon className="" />
          </Button>
          <Button
            onClick={handleRemoveItem}
            className="bg-primary w-1/2 p-3 rounded-md hover:bg-slate-800"
          >
            <MinusIcon className="" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
