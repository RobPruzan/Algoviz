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
import { ControlBarContext } from '../Context/ControlBarContext';

type Props = {};

const ControlBar = (props: Props) => {
  const [test, setTest] = useState(0);

  const {
    state: { items, multiplier, playing },
    setState: setControlBarState,
  } = useContext(ControlBarContext);

  return (
    <div className="w-full bg-secondary h-20 flex items-center justify-evenly">
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
        <label className="font-bold">Items</label>

        <div className="bg-secondary flex border border-primary rounded-md">
          <Button className="bg-primary border-r rounded-r-none  border-primary w-1/2 p-3 hover:bg-slate-800  ">
            <PlusIcon className="" />
          </Button>
          <Button className="bg-primary w-1/2 p-3 rounded-md hover:bg-slate-800">
            <MinusIcon className="" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
