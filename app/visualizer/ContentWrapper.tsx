'use client';
import {
  CircleReceiver,
  Edge,
  Percentage,
  SelectedGeometryInfo,
} from '@/lib/types';
import React, { useEffect, useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import Visualize from './Visualize';
import { Algorithm, Prisma } from '@prisma/client';
import CodeExecutionControlBar from './Canvas/CodeExecutionControlBar';
import { DEFAULT_CODE } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { CanvasActions } from '@/redux/slices/canvasSlice';
type Props = {
  shapes: {
    circles: Prisma.JsonValue;
    lines: Prisma.JsonValue;
    pencil: Prisma.JsonValue;
  } | null;
};

const ContentWrapper = ({ shapes }: Props) => {
  const [canvasWidth, setCanvasWidth] = useState<number | Percentage>('60%');
  const [codeExecWidth, setCodeExecWidth] = useState<number | Percentage>(
    '40%'
  );
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>();
  const dispatch = useDispatch();
  const [userAlgorithm, setUserAlgorithm] = useState<
    Pick<Algorithm, 'code' | 'description' | 'title'>
  >({
    code: DEFAULT_CODE,
    description: '',
    title: '',
  });

  useEffect(() => {
    console.log('does this run on the server?');
    const circles = shapes?.circles as CircleReceiver[] | undefined;
    const lines = shapes?.circles as Edge[] | undefined;
    console.log('the recievec circles and lines', circles, lines);
    if (circles && circles.length > 0) {
      dispatch(CanvasActions.setCircles(circles));
    }
    // simple error here that im somewhere saving the circles for the lines
    // if (lines && lines.length > 0) {
    //   dispatch(CanvasActions.setLines(lines));
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
