'use client';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { AlgoComboBox } from './AlgoComboBox';
import { Algorithms, DisplayTypes } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisplayTypeTabs from './DisplayTypeTabs';
import { SideBarContext } from '@/Context/SideBarContext';

const SideBar = () => {
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  return (
    <div className="w-44 min-w-fit h-[85%] rounded-md border-2 border-foreground flex flex-col justify-start items-center p-5">
      <DisplayTypeTabs
        setValue={setSideBarState}
        value={sideBarState.display}
      />
      <AlgoComboBox setValue={setSideBarState} value={sideBarState.algorithm} />
    </div>
  );
};

export default SideBar;
