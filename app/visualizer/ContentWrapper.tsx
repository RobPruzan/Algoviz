'use client';
import { Percentage, SelectedGeometryInfo } from '@/lib/types';
import React, { useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import Visualize from './Visualize';
import { Algorithm } from '@prisma/client';
import CodeExecutionControlBar from './Canvas/CodeExecutionControlBar';
import { DEFAULT_CODE } from '@/lib/utils';

// type Props = {};

const ContentWrapper = () => {
  // const [selectedGeometryInfo, setSelectedGeometryInfo] =
  //   useState<SelectedGeometryInfo | null>(null);

  const [canvasWidth, setCanvasWidth] = useState<number | Percentage>('60%');
  const [codeExecWidth, setCodeExecWidth] = useState<number | Percentage>(
    '40%'
  );
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>();
  const [userAlgorithm, setUserAlgorithm] = useState<
    Pick<Algorithm, 'code' | 'description' | 'title'>
  >({
    code: DEFAULT_CODE,
    description: '',
    title: '',
  });
  return (
    <Resizable
      canvasSize={canvasWidth}
      codeExecSize={codeExecWidth}
      setCanvasSize={setCanvasWidth}
      setCodeExecSize={setCodeExecWidth}
      type="horizontal"
      leftDiv={<Visualize canvasWidth={canvasWidth} />}
      rightDiv={
        <div className="w-full h-full border-2 border-secondary">
          <CodeExecutionControlBar
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            userAlgorithm={userAlgorithm}
            setUserAlgorithm={setUserAlgorithm}
          />
          <CodeExecution
            selectedAlgorithm={selectedAlgorithm}
            setUserAlgorithm={setUserAlgorithm}
          />
        </div>
      }
    />
  );
};

export default ContentWrapper;
