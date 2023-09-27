'use client';
import { Percentage, SelectedGeometryInfo } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Visualize from './Visualize';
import { Algorithm } from '@prisma/client';
import { match } from 'ts-pattern';

type Props = (
  | {
      type: 'horizontal';
      leftDiv: React.ReactNode;
      rightDiv: React.ReactNode;
    }
  | {
      type: 'vertical';
      topDiv: React.ReactNode;
      bottomDiv: React.ReactNode;
    }
) & {
  canvasSize: Percentage | number;
  setCanvasSize: React.Dispatch<React.SetStateAction<Percentage | number>>;
  codeExecSize: Percentage | number;
  setCodeExecSize: React.Dispatch<React.SetStateAction<Percentage | number>>;
};
const Resizable = (props: Props) => {
  const [resizing, setResizing] = useState(false);
  const parentDivRef = useRef<HTMLDivElement | null>(null);
  const padding = 25;
  const resizeBarSize = 12;

  useEffect(() => {
    const mouseMoveHandler = (e: any) => {
      if (!resizing) return;

      const parentDiv = parentDivRef.current;
      if (!parentDiv) return;
      match(props)
        .with({ type: 'horizontal' }, (props) => {
          let newDiv1Width = e.clientX - parentDiv.offsetLeft;

          newDiv1Width = Math.max(0, newDiv1Width);
          newDiv1Width = Math.min(parentDiv.offsetWidth, newDiv1Width);

          const newDiv2Width = parentDiv.offsetWidth - newDiv1Width;

          props.setCanvasSize(newDiv1Width - resizeBarSize / 2);
          props.setCodeExecSize(newDiv2Width - resizeBarSize / 2);
        })
        .with({ type: 'vertical' }, (props) => {
          let newDiv1Height = e.clientY - parentDiv.offsetTop;
          newDiv1Height = Math.max(0, newDiv1Height);
          newDiv1Height = Math.min(parentDiv.offsetHeight, newDiv1Height);
          const newDiv2Width = parentDiv.offsetHeight - newDiv1Height;
          props.setCanvasSize(newDiv1Height - resizeBarSize / 2);
          props.setCodeExecSize(newDiv2Width - resizeBarSize / 2);
        })
        .exhaustive();
    };

    const mouseUpHandler = () => {
      setResizing(false);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);

    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // make sure it only runs the useEffect for resizing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing]);

  useEffect(() => {
    const handleResize = () => {
      match(props)
        .with({ type: 'horizontal' }, (props) => {
          if (
            typeof props.canvasSize === 'number' &&
            typeof props.codeExecSize === 'number'
          ) {
            const totalWidth = window.innerWidth;
            const canvasRatio =
              props.canvasSize / (props.canvasSize + props.codeExecSize);
            const codeExecRatio =
              props.codeExecSize / (props.canvasSize + props.codeExecSize);

            const newCanvasWidth = canvasRatio * totalWidth;
            const newCodeExecWidth = codeExecRatio * totalWidth;
            props.setCanvasSize(newCanvasWidth);
            props.setCodeExecSize(newCodeExecWidth);
          }
        })
        .with({ type: 'vertical' }, (props) => {
          if (
            typeof props.canvasSize === 'number' &&
            typeof props.codeExecSize === 'number'
          ) {
            const totalHeight = window.innerHeight;
            const canvasRatio =
              props.canvasSize / (props.canvasSize + props.codeExecSize);
            const codeExecRatio =
              props.codeExecSize / (props.canvasSize + props.codeExecSize);

            const newCanvasHeight = canvasRatio * totalHeight;
            const newCodeExecHeight = codeExecRatio * totalHeight;
            props.setCanvasSize(newCanvasHeight);
            props.setCodeExecSize(newCodeExecHeight);
          }
        })
        .exhaustive();
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return props.type === 'horizontal' ? (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        // padding: `${padding}px`,
        // paddingTop: '10px',
      }}
      // className="prevent-select"
      ref={parentDivRef}
    >
      <div
        style={{
          // width: props.canvasSize ?? undefined,
          maxWidth: props.canvasSize ?? undefined,
          minWidth: props.canvasSize ?? undefined,
          height: '100%',
        }}
      >
        {props.leftDiv}
      </div>
      <div
        style={{
          minWidth: resizeBarSize,
        }}
        className={'cursor-col-resize border-y-2 border-secondary'}
        onMouseDown={() => setResizing(true)}
      />
      <div
        className="flex items-center justify-center"
        style={{
          width: props.codeExecSize ?? undefined,
          maxWidth: props.codeExecSize ?? undefined,
          minWidth: props.codeExecSize ?? undefined,
        }}
      >
        {props.rightDiv}
      </div>
    </div>
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
      className=""
      ref={parentDivRef}
    >
      <div
        style={{
          width: '100%',
          maxHeight: props.canvasSize ?? undefined,
          minHeight: props.canvasSize ?? undefined,
        }}
      >
        {props.topDiv}
      </div>
      <div
        style={{
          minHeight: resizeBarSize,
        }}
        className={'cursor-row-resize  border-y-2 border-secondary'}
        onMouseDown={() => setResizing(true)}
      />
      <div
        className="flex items-center justify-center flex-col"
        style={{
          // height: props.codeExecSize ?? undefined,
          maxHeight: props.codeExecSize ?? undefined,
          minHeight: props.codeExecSize ?? undefined,
        }}
      >
        {props.bottomDiv}
      </div>
    </div>
  );
};

export default Resizable;
