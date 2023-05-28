import React, { useContext, useMemo, useRef, useState } from 'react';
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
import { ControlBarContext } from '../../Context/ControlBarContext';
import { HistoryNodesContext } from '../../Context/HistoryNodesContext';
import { useQuickSort } from '@/hooks/useQuickSort';
import { z } from 'zod';
import { getHistoryArray } from '@/lib/utils';
import { useTraverseHistory } from '@/hooks/useTraverseHistory';

type Props = {};

const ControlBar = (props: Props) => {
  const { controlBarState, setControlBarState } = useContext(ControlBarContext);
  const { historyNodes, setHistoryNodes, tempHistoryArrayList } =
    useContext(HistoryNodesContext);
  const { handleQuickSort } = useQuickSort({
    currentHistory: historyNodes,
    tempHistoryArrayList,
  });

  const firstRow = historyNodes[0]?.element;

  const { handleMoveBackward, handleMoveForward } = useTraverseHistory({
    setControlBarState: setControlBarState,
    controlBarState: controlBarState,
  });

  const numItems =
    historyNodes.length === 1 ? historyNodes[0].element.length : 0;

  const handleAddNode = () => {
    if (historyNodes.length > 1) {
      return;
    }

    const newNode = {
      value: Math.floor(Math.random() * 100),
      id: crypto.randomUUID(),
      position: 0,
      next: null,
      color: 'white',
    };
    if (historyNodes.length == 0) {
      const initialNode = {
        element: [newNode],
        next: null,
        prev: null,
        stateContext: '',
      };
      const newHistoryArrayList = [initialNode];
      setHistoryNodes((_) => {
        tempHistoryArrayList.current = [];
        return newHistoryArrayList;
      });
      return;
    }

    // ideal behavior is an initial node array/discriminated union for holding nodes, but just updating the array and blocking adds else will work
    setHistoryNodes((prev) => {
      const lastInsert = prev[0].element.at(-1);
      lastInsert ? (lastInsert.next = newNode) : null;
      const newArrayList = {
        element: [...prev[0].element, newNode],
        next: null,
        prev: null,
        stateContext: '',
      };
      tempHistoryArrayList.current = [];
      // setControlBarState((prev) => ({
      //   ...prev,
      //   historyPointer: newArrayList,
      // }));
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

    // setNodeRows((prev) => [[...currentNodeRow.slice(0, -1)]]);
    setHistoryNodes((prev) => {
      const newTail = prev[0].element.at(-2);
      newTail ? (newTail.next = null) : null;
      const newArrayList = {
        element: [...prev[0].element.slice(0, -1)],
        next: null,
        prev: null,
        stateContext: '',
      };
      tempHistoryArrayList.current = [];

      return [newArrayList];
    });
  };

  const tailToHeadHistory = getHistoryArray(
    historyNodes,
    controlBarState.historyPointer
  );

  return (
    <div className="w-full border-b-4 border-secondary h-20 flex items-center justify-evenly">
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
          onClick={() => {
            setControlBarState((prev) => ({ ...prev, playing: true }));
            const copyArray = JSON.parse(JSON.stringify(firstRow));
            const res = handleQuickSort({
              arr: copyArray,
              onFinish: (sortedArr) => console.warn('not implemented'),
            });
            // we will probably need to call a use visualizer hook handler here
          }}
          className="cursor-pointer hover:scale-105 transition "
          size={32}
        />
      )}
      <div className="w-3/5 flex justify-evenly items-center">
        <ArrowLeft
          className="cursor-pointer hover:scale-105 transition"
          onClick={() => {
            handleMoveBackward();
          }}
          size={32}
        />
        <SpeedSlider
          min={0}
          max={10}
          value={[tailToHeadHistory.length]}
          onValueChange={(value) =>
            setControlBarState((prev) => ({ ...prev, multiplier: value }))
          }
        />
        <ArrowRight
          className="cursor-pointer hover:scale-105 transition"
          onClick={() => {
            handleMoveForward(tempHistoryArrayList.current);
          }}
          size={32}
        />

        <label className="font-bold">
          Step {controlBarState.historyPointer}
        </label>
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
