'use client';
import { useAppSelector } from '@/redux/store';
import React from 'react';

type Props = {};

const CanvasVariableInspector = (props: Props) => {
  const { show } = useAppSelector((store) => store.canvas.variableInspector);

  return show ? (
    <div className="w-60 rounded-md flex flex-col h-[85%] border-2 border-foreground transition"></div>
  ) : null;
};

export default CanvasVariableInspector;
