'use client';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { AlgoComboBox } from './Sort/AlgoComboBox';
import { Algorithms, DisplayTypes } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisplayTypeTabs from './DisplayTypeTabs';
import { SideBarContext } from '@/Context/SideBarContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppSelector } from '@/redux/store';

const SideBar = () => {
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  return (
    <div className="w-44 min-w-fit h-[85%] rounded-md border-2 border-foreground flex flex-col justify-start items-center p-5">
      <DisplayTypeTabs
        setValue={setSideBarState}
        value={sideBarState.display}
      />
      <AlgoComboBox setValue={setSideBarState} value={sideBarState.algorithm} />
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
  );
};

export default SideBar;
