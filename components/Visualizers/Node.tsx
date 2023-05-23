import React from 'react';
type Props = {
  value: number;
};
const Node = ({ value }: Props) => {
  return (
    <svg height="100" width="100">
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="black"
        strokeWidth="3"
        fill="white"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        stroke="black"
        strokeWidth="0.5px"
        dy=".3em"
      >
        {value}
      </text>
    </svg>
  );
};

export default Node;
