'use client';
import { Button } from '@/components/ui/button';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line } from 'react-konva';
import Grid from './Grid';
import Konva from 'konva';

type CanvasObject = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  gridSize: number;
};
type LineData = {
  points: [number, number, number, number];
  selected: boolean;
};

export const getGridAdjustedPosition = (position: [number, number]) => {
  const [x, y] = position;
  const gridX = Math.floor(x / 10) * 10;
  const gridY = Math.floor(y / 10) * 10;
  return [gridX, gridY];
};

export const CanvasDisplay: React.FC = () => {
  const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>([]);
  const [lines, setLines] = useState<LineData[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<0 | 1 | null>(null);

  const spawnLine = () => {
    setLines([
      ...lines,
      {
        points: [
          stageWidth / 2,
          stageHeight / 2,
          stageWidth / 2,
          stageHeight / 2 + 50,
        ],
        selected: false,
      },
    ]);
  };

  const handleMouseDown = (
    i: number,
    line: LineData,
    e: Konva.KonvaEventObject<MouseEvent>
  ) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    console.log('mousedown', i, line, pos);
    // change lines color to red
  };

  const handleDragMove = (i: number, e: Konva.KonvaEventObject<DragEvent>) => {
    if (selectedLine !== i || selectedPoint === null) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
  };
  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;

  const gridSize = 20;
  return (
    <>
      <Button
        onClick={() => {
          setCanvasObjects([
            ...canvasObjects,
            {
              id: crypto.randomUUID(),
              x: 20,
              y: 20,
              width: 100,
              height: 100,
              gridSize: 100,
              fill: 'red',
            },
          ]);
        }}
      >
        Add
      </Button>
      <Button onClick={spawnLine}>Spawn Line</Button>

      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          <Grid
            gridSize={gridSize}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
            // very light gray hex
            color="#eee"
          />
          {canvasObjects.map((object, index) => (
            <CanvasObject
              key={index}
              x={object.x}
              y={object.y}
              width={object.width}
              height={object.height}
              fill={object.fill}
              gridSize={gridSize}
              id={object.id}
            />
          ))}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#fff"
              strokeWidth={10}
              draggable
              onMouseDown={(e) => handleMouseDown(i, line, e)}
              onDragMove={(e) => handleDragMove(i, e)}
              onMouseUp={() => {
                setSelectedLine(null);
                setSelectedPoint(null);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};
const CanvasObject: React.FC<CanvasObject> = ({
  x,
  y,
  width,
  height,
  fill,
  gridSize,
}) => {
  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDragEnd = (e: any) => {
    e.target.x(snapToGrid(e.target.x()));
    e.target.y(snapToGrid(e.target.y()));
  };

  return (
    <Circle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      draggable
      onDragEnd={handleDragEnd}
    />
  );
};
