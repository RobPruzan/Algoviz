'use client';
import {
  CircleReceiver,
  Edge,
  Percentage,
  SelectedGeometryInfo,
  SelectedValidatorLens,
} from '@/lib/types';
import React, { useEffect, useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import Visualize from './Visualize';
import { Algorithm, Prisma } from '@prisma/client';
import CodeExecutionControlBar from './Canvas/CodeExecutionControlBar';
import {
  DEFAULT_VALIDATOR_CODE,
  DEFAULT_VISUALIZATION_CODE,
} from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { CanvasActions } from '@/redux/slices/canvasSlice';
import { useAppSelector } from '@/redux/store';
import { match } from 'ts-pattern';
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
  const [selectedValidatorLens, setSelectedValidatorLens] =
    useState<SelectedValidatorLens | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>();
  const dispatch = useDispatch();
  const [userAlgorithm, setUserAlgorithm] = useState<
    Pick<Algorithm, 'code' | 'description' | 'title'>
  >({
    code: DEFAULT_VISUALIZATION_CODE,
    description: '',
    title: '',
  });

  useEffect(() => {
    // #TODO need to do zod validation
    const circles = shapes?.circles as CircleReceiver[] | undefined;
    const lines = shapes?.lines as Edge[] | undefined;
    if (circles && circles.length > 0) {
      dispatch(CanvasActions.setCircles(circles));
    }
    if (lines && lines.length > 0) {
      dispatch(CanvasActions.setLines(lines));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const rx = /INPUT|SELECT|TEXTAREA/i;

    const keyDownHandler = (e: any) => {
      if (e.which === 8) {
        // 8 == backspace
        if (
          !rx.test(e.target.tagName) ||
          e.target.disabled ||
          e.target.readOnly
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keypress', keyDownHandler);

    // cleanup function
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keypress', keyDownHandler);
    };
  }, []);
  return (
    <Resizable
      canvasSize={canvasWidth}
      codeExecSize={codeExecWidth}
      setCanvasSize={setCanvasWidth}
      setCodeExecSize={setCodeExecWidth}
      type="horizontal"
      leftDiv={
        <Visualize
          selectedValidatorLens={selectedValidatorLens}
          setSelectedValidatorLens={setSelectedValidatorLens}
          canvasWidth={canvasWidth}
        />
      }
      rightDiv={
        <div className="w-full h-full border-2 border-secondary">
          <CodeExecutionControlBar
            selectedValidatorLens={selectedValidatorLens}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            userAlgorithm={userAlgorithm}
            setUserAlgorithm={setUserAlgorithm}
          />
          <CodeExecution
            selectedValidatorLens={selectedValidatorLens}
            setSelectedValidatorLens={setSelectedValidatorLens}
            selectedAlgorithm={selectedAlgorithm}
            setUserAlgorithm={setUserAlgorithm}
          />
        </div>
      }
    />
  );
};

export default ContentWrapper;
