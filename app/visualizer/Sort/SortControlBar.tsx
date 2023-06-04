import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SpeedSlider } from './SpeedSlider';
import {
  ArrowLeft,
  ArrowRight,
  MinusCircle,
  MinusIcon,
  Pause,
  Play,
  Plus,
  PlusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ControlBarContext } from '../../../Context/ControlBarContext';
import { HistoryNodesContext } from '../../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { boolean, z } from 'zod';

import { useTraverseHistory } from '@/hooks/useTraverseHistory';
import { Algorithms } from '@/lib/types';

type Props = {
  algorithm: Algorithms | undefined;
};

const SortControlBar = ({ algorithm }: Props) => {
  const { controlBarState, setControlBarState } = useContext(ControlBarContext);
  const {
    historyNodes,
    setHistoryNodes,
    quickSortTempHistoryArrayList,
    mergeSortTempHistoryArrayList,
  } = useContext(HistoryNodesContext);
  const currTempHistList =
    algorithm === 'quick sort'
      ? quickSortTempHistoryArrayList
      : mergeSortTempHistoryArrayList;
  const { handleQuickSort } = useQuickSort({
    currentHistory: historyNodes,
    tempHistoryArrayList: currTempHistList,
  });

  const { handleMoveBackward, handleMoveForward } = useTraverseHistory({
    setControlBarState: setControlBarState,
    controlBarState: controlBarState,
  });
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (controlBarState.playing) {
      intervalId = setInterval(() => {
        if (
          controlBarState.historyPointer ===
          currTempHistList.current.length - 1
        ) {
          setControlBarState((prevState) => ({
            ...prevState,
            playing: false,
          }));
          return;
        }
        if (controlBarState.playing) {
          handleMoveForward(currTempHistList.current);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlBarState.playing, handleMoveForward]);

  const numItems =
    historyNodes.length === 1 ? historyNodes[0].element.length : 0;

  const handleAddNode = () => {
    if (historyNodes.length > 1) {
      console.log('1');
      return;
    }

    const newNode = {
      value: Math.floor(Math.random() * 100),
      id: crypto.randomUUID(),
      position: 0,
      next: true,

      color: 'white',
    };
    if (historyNodes.length == 0) {
      const initialNode = {
        element: [newNode],
        stateContext: 'Beginning sort',
        id: crypto.randomUUID(),
      };

      const newHistoryArrayList = [initialNode];
      setHistoryNodes((_) => {
        currTempHistList.current = [];

        return newHistoryArrayList;
      });

      return;
    }

    // ideal behavior is an initial node array/discriminated union for holding nodes, but just updating the array and blocking adds else will work
    setHistoryNodes((prev) => {
      const newArrayList = {
        element: [...prev[0].element, newNode],

        stateContext: 'Beginning sort',
        id: crypto.randomUUID(),
      };
      currTempHistList.current = [];

      return [newArrayList];
    });
  };

  const handleRemoveItem = () => {
    if (historyNodes.length > 1) {
      return;
    }
    if (historyNodes.length == 0) {
      return;
    }

    const currentNodeRow = historyNodes[0];
    if (currentNodeRow.element.length === 0) {
      return;
    }

    setHistoryNodes((prev) => {
      const newArrayList = {
        element: [...prev[0].element.slice(0, -1)],
        stateContext: 'Beginning sort',
        id: crypto.randomUUID(),
      };
      currTempHistList.current = [];

      return [newArrayList];
    });
  };

  const truncatedHistoryArray = currTempHistList.current.slice(
    0,
    controlBarState.historyPointer + 1
  );
  return (
    <div className="w-full h-20 flex items-center justify-evenly">
      <Button>
        {controlBarState.playing ? (
          <Pause
            onClick={() => {
              setControlBarState((prevState) => ({
                ...prevState,
                playing: false,
              }));
            }}
            size={32}
            className="cursor-pointer hover:scale-105 transition animate-pulse"
          />
        ) : (
          <Play
            onClick={async () => {
              setControlBarState((prev) => ({ ...prev, playing: true }));

              // we will probably need to call a use visualizer hook handler here
            }}
            className="cursor-pointer hover:scale-105 transition "
            size={32}
          />
        )}
      </Button>
      <div className="w-3/5 flex justify-evenly items-center">
        <Button>
          <ArrowLeft
            className="cursor-pointer hover:scale-105 transition"
            onClick={() => {
              handleMoveBackward();
            }}
            size={32}
          />
        </Button>

        <SpeedSlider
          min={0}
          max={currTempHistList.current.length - 1}
          value={[controlBarState.historyPointer]}
          onValueChange={(value) =>
            setControlBarState((prev) => ({
              ...prev,
              historyPointer: value[0],
            }))
          }
        />
        <Button>
          <ArrowRight
            className="cursor-pointer hover:scale-105 transition"
            onClick={() => {
              handleMoveForward(currTempHistList.current);
            }}
            size={32}
          />
        </Button>

        <label className="font-bold">
          Step {controlBarState.historyPointer}
        </label>
      </div>
      <div className="flex justify-evenly items-center w-1/4 ">
        <label className="font-bold">Items: {numItems}</label>

        <div className="bg-secondary flex border border-primary rounded-md">
          <Button
            disabled={truncatedHistoryArray.length > 1}
            onClick={() => {
              handleAddNode();
              // handleQuickSort({
              //   arr: JSON.parse(JSON.stringify(firstRow ?? [])),
              //   onFinish: (sortedArr) => console.warn('not implemented'),
              // });
            }}
            className="bg-primary border-r rounded-r-none  border-primary w-1/2 p-3 hover:bg-slate-800  "
          >
            <PlusIcon className="" />
          </Button>
          <Button
            disabled={truncatedHistoryArray.length > 1}
            onClick={() => {
              handleRemoveItem();
              // handleQuickSort({
              //   arr: JSON.parse(JSON.stringify(firstRow ?? [])),
              //   onFinish: (sortedArr) => console.warn('not implemented'),
              // });
            }}
            className="bg-primary w-1/2 p-3 rounded-md hover:bg-slate-800"
          >
            <MinusIcon className="" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SortControlBar;
