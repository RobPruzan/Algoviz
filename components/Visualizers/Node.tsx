import React, { SVGProps, useEffect, useRef, useState } from 'react';
type Props = {
  value: number;
} & SVGProps<SVGSVGElement>;
const Node = ({ value, ...props }: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={ref}
      className="animate-in duration-300 zoom-in "
      height="100"
      width="100"
      {...props}
    >
      <circle
        className="transition duration-300 ease-in"
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
