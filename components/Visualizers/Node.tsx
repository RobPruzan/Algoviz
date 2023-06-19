import React, {
  ComponentProps,
  SVGProps,
  useEffect,
  useRef,
  useState,
} from 'react';
type Props = {
  value: number;
  size?: number;
} & ComponentProps<'circle'>;
const Node = ({ value, size = 42, ...props }: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={ref}
      className="animate-in duration-300 zoom-in mr-4 "
      height="100"
      width="80"
    >
      <circle
        className="transition duration-300 ease-in"
        cx={size}
        cy={size}
        r={size / 1.75}
        stroke="black"
        strokeWidth="3"
        fill="white"
        {...props}
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
