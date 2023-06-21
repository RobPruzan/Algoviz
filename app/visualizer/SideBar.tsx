'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { AlgoComboBox } from './Sort/AlgoComboBox';
import { Algorithms, DisplayTypes } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisplayTypeTabs from './DisplayTypeTabs';
import { SideBarContext } from '@/context/SideBarContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppDispatch, useAppSelector } from '@/redux/store';

import { ArrowLeft, ArrowRight, PlayIcon, Plus } from 'lucide-react';
import { DFSActions } from '@/redux/slices/dfsSlice';

import { Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Editor } from '@monaco-editor/react';
const SideBar = () => {
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  const { attachableLines, circles } = useAppSelector((store) => store.canvas);
  const { visitedPointer } = useAppSelector((store) => store.dfs);
  const dispatch = useAppDispatch();
  return (
    <div className=" h-full flex">
      <div className=" h-[85%] w-64 rounded-md border-2 border-secondary flex flex-col justify-start items-center">
        <div className="flex flex-col w-full h-4/5 items-center justify-start p-5">
          <DisplayTypeTabs
            setValue={setSideBarState}
            value={sideBarState.display}
          />
          <AlgoComboBox
            setValue={setSideBarState}
            value={sideBarState.algorithm}
          />
          <ScrollArea className="h-[400px] w-full mt-4 rounded-md border-2 p-4">
            {circles.map((circle) => (
              <div
                className="bg-primary border-2 w-40 mt-2 border-secondary rounded-md p-3 flex items-center justify-center"
                key={circle.id}
              >
                <div className="w-1/2 flex items-center justify-end h-full">
                  {circle.value}
                </div>
                <div className="w-1/2 flex items-center justify-end h-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 rounded-full p-0"
                      >
                        <Settings2 className="h-4 w-4" />
                        <span className="sr-only">Open popover</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">
                            Dimensions
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Set the dimensions for the layer.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="width">Width</Label>
                            <Input
                              id="width"
                              defaultValue="100%"
                              className="col-span-2 h-8"
                            />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxWidth">Max. width</Label>
                            <Input
                              id="maxWidth"
                              defaultValue="300px"
                              className="col-span-2 h-8"
                            />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="height">Height</Label>
                            <Input
                              id="height"
                              defaultValue="25px"
                              className="col-span-2 h-8"
                            />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxHeight">Max. height</Label>
                            <Input
                              id="maxHeight"
                              defaultValue="none"
                              className="col-span-2 h-8"
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
            {attachableLines.map((line) => (
              <div
                className="bg-primary border-2 w-40 mt-2 border-secondary rounded-md p-3 flex items-center justify-center"
                key={line.id}
              >
                {line.id}
              </div>
            ))}
          </ScrollArea>
          {/* <Card className="w-full p-0">
            <CardContent className="p-0">
              <Editor
                height="30vh"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false }, // This turns off the minimap
                  folding: false, // This turns off the sidebar (folding region)
                  scrollbar: {
                    vertical: 'hidden', // This hides the vertical scrollbar
                    horizontal: 'hidden', // This hides the horizontal scrollbar
                  },
                }}
                language="typescript"
                defaultLanguage="javascript"
                defaultValue="// some comment"
              />
            </CardContent>
          </Card> */}
        </div>

        <div className="flex flex-col w-full h-1/5 items-center justify-end p-5">
          <div className="w-full flex justify-between">
            <Button
              onClick={(e) => {
                dispatch(DFSActions.decrementVisitedPointer());
              }}
              className="bg-secondary hover:bg-primary border-2 border-secondary w-2/5"
            >
              {/* temporary bad ui to move through history */}

              <ArrowLeft />
            </Button>
            <Button
              onClick={(e) => {
                dispatch(DFSActions.incrementVisitedPointer());
              }}
              className="bg-secondary hover:bg-primary border-2 border-secondary w-2/5"
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
