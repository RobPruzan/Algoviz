import { Card } from '@/components/ui/card';
import React from 'react';

const Loading = () => {
  // this does run need a sensible loading state
  return (
    <div className=" text-6xl w-screen flex h-screen items-center justify-center p-[30px]">
      <Card className=" w-3/5 h-full  animate-pulse mx-2"></Card>
      <Card className="w-1/4 h-full animate-pulse mx=2" />
    </div>
  );
};

export default Loading;
