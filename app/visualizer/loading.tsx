import { Card } from '@/components/ui/card';
import { Leaf, Moon } from 'lucide-react';
import React from 'react';

const Loading = () => {
  // this does run need a sensible loading state
  return (
    <div className=" text-6xl w-screen flex h-screen items-start justify-center px-[25px] py-[25px] ">
      <div className="h-[98%] w-full flex  ">
        <div className=" w-3/5 h-full rounded-none border-0 animate-pulse flex flex-col">
          <div className="border-2 h-[7%] w-full  border-b-0 rounded-none"></div>
          <div className="border-2 h-[93%] w-full  rounded-none flex items-center justify-center">
            <Moon
              size={35}
              color="gray"
              className="animate-pulse fill-primary"
            />
          </div>

          {/* <div className="border-2 animate-pulse w-full h-full" /> */}

          {/* <div className="border-2 animate-pulse w-full h-full" /> */}
        </div>
        <div className="border-2 border-accent animate-pulse h-full w-[1%] rounded-none border-x-0" />
        <div className="w-2/5 h-full rounded-none  border-0 animate-pulse flex flex-col justify-center">
          <div className="border-2 h-[7%] w-full border-b-0 rounded-none"></div>
          <div className="border-2 h-[57%] w-full border-b-0 rounded-none"></div>
          <div className="border-2 h-[6%] w-full border-b-0  rounded-none"></div>
          <div className="border-2 h-[30%] w-full  rounded-none"></div>
          {/* <div className="animate-pulse w-full h-full" /> */}
        </div>
      </div>
    </div>
  );
};

export default Loading;
