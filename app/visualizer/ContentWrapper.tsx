'use client';
import { Percentage, SelectedGeometryInfo } from '@/lib/types';
import React, { useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import Visualize from './Visualize';

// type Props = {};

const ContentWrapper = () => {
  // const [selectedGeometryInfo, setSelectedGeometryInfo] =
  //   useState<SelectedGeometryInfo | null>(null);

  const [canvasWidth, setCanvasWidth] = useState<number | Percentage>('60%');
  const [codeExecWidth, setCodeExecWidth] = useState<number | Percentage>(
    '40%'
  );
  return (
    <Resizable
      canvasSize={canvasWidth}
      codeExecSize={codeExecWidth}
      setCanvasSize={setCanvasWidth}
      setCodeExecSize={setCodeExecWidth}
      type="horizontal"
      leftDiv={<Visualize canvasWidth={canvasWidth} />}
      rightDiv={<CodeExecution />}
    />
  );
};

export default ContentWrapper;
