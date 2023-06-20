'use client';
import { SelectedGeometryInfo } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import CodeExecution from './Canvas/CodeExecution';
import Visualize from './Visualize';

type Props = {};

const ContentWrapper = () => {
  const [canvasWidth, setCanvasWidth] = useState<number | '60%'>('60%');
  const [codeExecWidth, setCodeExecWidth] = useState<number | '40%'>('40%');
  const [resizing, setResizing] = useState(false);
  const [selectedGeometryInfo, setSelectedGeometryInfo] =
    useState<SelectedGeometryInfo | null>(null);

  const parentDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!parentDivRef || !parentDivRef.current) return;
    const parentWidth = parentDivRef.current.offsetWidth;

    setCanvasWidth(parentWidth * 0.6); // 60% width
    setCodeExecWidth(parentWidth * 0.4); // 40% width
  }, []);
  const padding = 30;
  const resizeBarWidth = 12;

  useEffect(() => {
    const mouseMoveHandler = (e: any) => {
      if (!resizing) return;

      const parentDiv = parentDivRef.current;
      if (!parentDiv) return;

      // let newDiv1Width = e.clientX - parentDiv.offsetLeft;
      let newDiv1Width =
        e.clientX - parentDiv.offsetLeft - (padding + resizeBarWidth / 2); // subtract left padding

      newDiv1Width = Math.max(0, newDiv1Width);
      newDiv1Width = Math.min(parentDiv.offsetWidth, newDiv1Width);

      const newDiv2Width = parentDiv.offsetWidth - newDiv1Width;

      setCanvasWidth(newDiv1Width);
      setCodeExecWidth(newDiv2Width);
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
  }, [resizing]);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '95%',
        padding: `${padding}px`,
        paddingTop: '10px',
      }}
      ref={parentDivRef}
    >
      <div
        className="unselectable"
        style={{
          width: canvasWidth ?? undefined,
          height: '100%',

          // background: 'lightblue',
        }}
      >
        <Visualize
          canvasWidth={canvasWidth}
          selectedGeometryInfo={selectedGeometryInfo}
          setSelectedGeometryInfo={setSelectedGeometryInfo}
        />
      </div>
      <div
        style={{
          minWidth: resizeBarWidth,
        }}
        className={'cursor-col-resize   border-y-2 border-secondary'}
        onMouseDown={() => setResizing(true)}
      />
      <div
        className="flex items-center justify-center"
        style={{
          width: codeExecWidth ?? undefined,
          // height: '100%',
          // background: 'lightgreen',
        }}
      >
        <CodeExecution
          selectedGeometryInfo={selectedGeometryInfo}
          setSelectedGeometryInfo={setSelectedGeometryInfo}
        />
      </div>
    </div>
  );
};

// export default ResizableDivs;

// export default ResizableDivs;

export default ContentWrapper;
