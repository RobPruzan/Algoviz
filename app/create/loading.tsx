import { Leaf, Moon } from 'lucide-react';
import React from 'react';
import Playground from './Playground';
import CreatePlayground from './CreatePlayground';

const Loading = () => {
  // this does run need a sensible loading state
  return (
    <div className="h-full w-full ">
      <div className="flex  items-center justify-center  h-full overflow-y-scroll">
        <div className="w-[90%] h-full flex md:justify-start md:items-start flex-wrap space-y-5 space-x-5 items-center justify-center">
          <CreatePlayground />

          {Array.from({ length: 10 }).map((_, i) => (
            <>
              <Playground
                key={i}
                className="animate-pulse"
                playground={{
                  userId: '',
                  id: 0,
                  name: '',
                }}
              />
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
