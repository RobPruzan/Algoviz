'use client';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { AlgoComboBox } from './Sort/AlgoComboBox';
import { Algorithms, DisplayTypes } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisplayTypeTabs from './DisplayTypeTabs';
import { SideBarContext } from '@/context/SideBarContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, PlayIcon, Plus } from 'lucide-react';
import { DFSActions } from '@/redux/slices/dfsSlice';

const SideBar = () => {
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  const { visitedPointer } = useAppSelector((store) => store.dfs);
  const dispatch = useAppDispatch();
  return (
    <div className="w-44 min-w-fit h-[85%] rounded-md border-2 border-foreground flex flex-col justify-start items-center ">
      <div className="flex flex-col w-full h-4/5 items-center justify-start p-5">
        <DisplayTypeTabs
          setValue={setSideBarState}
          value={sideBarState.display}
        />
        <AlgoComboBox
          setValue={setSideBarState}
          value={sideBarState.algorithm}
        />
        <ScrollArea className="h-[400px] w-full mt-4 rounded-md border p-4">
          {circles.map((circle) => (
            <div
              className="bg-primary border w-40 mt-2 border-secondary rounded-md p-3 flex items-center justify-center"
              key={circle.id}
            >
              {circle.value}
            </div>
          ))}
          {attachableLines.map((line) => (
            <div
              className="bg-primary border w-40 mt-2 border-secondary rounded-md p-3 flex items-center justify-center"
              key={line.id}
            >
              {line.id}
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="flex flex-col w-full h-1/5 items-center justify-end p-5">
        <div className="w-full flex justify-between">
          <Button
            onClick={(e) => {
              console.log('run 0');
              dispatch(DFSActions.decrementVisitedPointer());
            }}
            className="bg-secondary hover:bg-primary border border-secondary w-2/5"
          >
            {/* temporary bad ui to move through history */}

            <ArrowLeft />
          </Button>
          <Button
            onClick={(e) => {
              console.log('run');
              dispatch(DFSActions.incrementVisitedPointer());
            }}
            className="bg-secondary hover:bg-primary border border-secondary w-2/5"
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
