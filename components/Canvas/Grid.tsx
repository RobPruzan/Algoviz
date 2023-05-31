import React from 'react';
import { Line } from 'react-konva';

type GridProps = {
  gridSize: number;
  stageWidth: number;
  stageHeight: number;
  color: string;
};

const Grid: React.FC<GridProps> = ({
  gridSize,
  stageWidth,
  stageHeight,
  color,
}) => {
  const gridLines = [];

  // Horizontal lines
  for (let i = 0; i < stageWidth; i += gridSize) {
    gridLines.push(
      <Line
        points={[i, 0, i, stageHeight]}
        stroke={color}
        strokeWidth={1}
        dash={[0.5, 0.5]}
        key={i}
      />
    );
  }

  // Vertical lines
  for (let i = 0; i < stageHeight; i += gridSize) {
    gridLines.push(
      <Line
        points={[0, i, stageWidth, i]}
        stroke={color}
        strokeWidth={1}
        key={i + stageWidth} // Ensure unique key
      />
    );
  }

  return <>{gridLines}</>;
};

export default Grid;
