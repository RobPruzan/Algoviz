'use client';
import { useAppSelector } from '@/redux/store';
import React from 'react';

type Props = {};

const CanvasVariableInspector = (props: Props) => {
  const variables = useAppSelector((store) => store.canvas.variableInspector);

  return variables.show ? (
    <div className="w-60 rounded-md flex flex-col h-[85%] border-2 border-foreground transition">
      {variables.queues.map((item) => item.toString())}
    </div>
  ) : null;
};

export default CanvasVariableInspector;
