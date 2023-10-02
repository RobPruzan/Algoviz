import React from 'react';
import PageWrapper from './PageWrapper';

const page = () => {
  return (
    <div className=" w-screen h-[95%] flex items-display overflow-y-hidden ">
      <div className="h-full w-full py-[10px] px-[25px] flex flex-col items-center justify-center">
        <PageWrapper />
      </div>
    </div>
  );
};

export default page;
