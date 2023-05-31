import { SideBarContextState } from '@/Context/SideBarContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DISPLAY_TYPES, DisplayTypes } from '@/lib/types';
import React, { Dispatch, SetStateAction } from 'react';

type Props = {
  value: DisplayTypes;
  setValue: Dispatch<SetStateAction<SideBarContextState>>;
};
const valueIsDisplayType = (s: string): s is DisplayTypes => {
  return DISPLAY_TYPES.includes(s as DisplayTypes);
};
const DisplayTypeTabs = ({ setValue, value }: Props) => {
  return (
    <Tabs
      value={value}
      onValueChange={(v) =>
        valueIsDisplayType(v) && setValue((prev) => ({ ...prev, display: v }))
      }
      defaultValue="account"
      className=" flex justify-center items-center mb-5"
    >
      <TabsList>
        <TabsTrigger className="w-24" value="canvas">
          Canvas
        </TabsTrigger>
        <TabsTrigger className="w-24" value="nodes">
          Nodes
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default DisplayTypeTabs;
