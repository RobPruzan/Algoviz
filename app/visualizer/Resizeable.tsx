"use client";
import { Percentage, SelectedGeometryInfo } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import CodeExecution from "./Canvas/CodeExecution";
import Visualize from "./Visualize";
import { Algorithm } from "@prisma/client";
import { match } from "ts-pattern";
import { cn } from "@/lib/utils";

type Props = (
  | {
      type: "horizontal";
      leftDiv: React.ReactNode;
      rightDiv: React.ReactNode;
    }
  | {
      type: "vertical";
      topDiv: React.ReactNode;
      bottomDiv: React.ReactNode;
    }
) & {
  className?: string;
  divOneSize?: Percentage | number;
  setDiveOneSize?: React.Dispatch<React.SetStateAction<Percentage | number>>;
  divTwoSize?: Percentage | number;
  setDivTwoSize?: React.Dispatch<React.SetStateAction<Percentage | number>>;
  resizeBarClassName?: string;
  initialState?: {
    divOneSize?: Props["divOneSize"];
    divTwoSize?: Props["divTwoSize"];
  };
};
const Resizable = (props: Props) => {
  const [resizing, setResizing] = useState(false);
  const parentDivRef = useRef<HTMLDivElement | null>(null);
  const childRefOne = useRef<HTMLDivElement | null>(null);
  const childRefTwo = useRef<HTMLDivElement | null>(null);

  const [_divOneSize, _setDivOneSize] = useState<
    Props["divOneSize"] extends infer R | null | undefined
      ? R
      : Props["divOneSize"]
  >(props.initialState?.divOneSize ?? "60%");
  const [_divTwoSize, _setDivTwoSize] = useState<
    Props["divOneSize"] extends infer R | null | undefined
      ? R
      : Props["divTwoSize"]
  >(props.initialState?.divTwoSize ?? "40%");

  const [divOneSize, setDivOneSize] = [
    props.divOneSize ?? _divOneSize,
    props.setDiveOneSize ?? _setDivOneSize,
  ];

  const [divTwoSize, setDivTwoSize] = [
    props.divTwoSize ?? _divTwoSize,
    props.setDivTwoSize ?? _setDivTwoSize,
  ];

  const resizeBarSize = 12;

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      if (!resizing) return;

      const parentDiv = parentDivRef.current;
      if (!parentDiv) return;
      match(props)
        .with({ type: "horizontal" }, (props) => {
          let newDiv1Width = e.clientX - parentDiv.offsetLeft;

          newDiv1Width = Math.max(0, newDiv1Width);
          newDiv1Width = Math.min(parentDiv.offsetWidth, newDiv1Width);

          const newDiv2Width = parentDiv.offsetWidth - newDiv1Width;

          setDivOneSize(newDiv1Width - resizeBarSize / 2);
          setDivTwoSize(newDiv2Width - resizeBarSize / 2);
        })
        .with({ type: "vertical" }, (props) => {
          let newDiv1Height = e.clientY - parentDiv.offsetTop;
          newDiv1Height = Math.max(0, newDiv1Height);
          newDiv1Height = Math.min(parentDiv.offsetHeight, newDiv1Height);
          const newDiv2Width = parentDiv.offsetHeight - newDiv1Height;
          setDivOneSize(newDiv1Height - resizeBarSize / 2);
          setDivTwoSize(newDiv2Width - resizeBarSize / 2);
        })
        .exhaustive();
    };

    const mouseUpHandler = () => {
      setResizing(false);
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
    // make sure it only runs the useEffect for resizing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing]);

  const handleResize = () => {
    match(props)
      .with({ type: "horizontal" }, (props) => {
        if (typeof divOneSize === "number" && typeof divTwoSize === "number") {
          if (
            !childRefOne.current ||
            !childRefTwo.current ||
            !parentDivRef.current
          ) {
            // will be defined, ran as an effect, so just terminate
            return;
          }
          let parentScaledBy =
            parentDivRef.current.offsetWidth /
            // who woulda known, resizebar is important
            (divOneSize + divTwoSize + resizeBarSize);

          const scale = (prev: number | `${string}%`) => {
            if (typeof prev === "number") {
              return `${
                (prev * parentScaledBy * 100) /
                parentDivRef.current!.offsetWidth
              }%` as const;
            } else {
              return prev;
            }
          };

          setDivOneSize(scale);
          setDivTwoSize(scale);

          // ...
        } else {
          // ...
        }
      })
      // only one that works, but for now have no need for the other version
      .with({ type: "vertical" }, (props) => {
        if (typeof divOneSize === "number" && typeof divTwoSize === "number") {
          if (!childRefOne.current || !childRefTwo.current) {
            // will be defined, ran as an effect, so just terminate
            return;
          }
          let parentScaledBy =
            parentDivRef.current?.offsetHeight! /
            (divOneSize + divTwoSize + resizeBarSize);
          const scale = (prev: number | `${string}%`) => {
            if (typeof prev === "number") {
              return `${
                (prev * parentScaledBy * 100) /
                parentDivRef.current!.offsetHeight
              }%` as const;
            } else {
              return prev;
            }
          };

          setDivOneSize(scale);
          setDivTwoSize(scale);

          // ...
        } else {
          //  ....
        }
      })
      .exhaustive();
  };

  useEffect(() => {
    new ResizeObserver(handleResize).observe(parentDivRef.current!);
    // kinda hacky, forces pixels to be percentages when possible
  }, [divOneSize, divTwoSize]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return props.type === "horizontal" ? (
    <div
      className={cn([props.className, ""])}
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
      }}
      ref={parentDivRef}
    >
      <div
        ref={childRefOne}
        style={{
          maxWidth: divOneSize ?? undefined,
          minWidth: divOneSize ?? undefined,
          height: "100%",
        }}
      >
        {props.leftDiv}
      </div>
      <div
        style={{
          minWidth: resizeBarSize,
        }}
        className={cn([
          "cursor-col-resize border-y-2 border-secondary h-full sticky top-0",
          props.resizeBarClassName,
        ])}
        onMouseDown={() => setResizing(true)}
      />
      <div
        ref={childRefTwo}
        className="flex items-center justify-center"
        style={{
          width: divTwoSize ?? undefined,
          maxWidth: divTwoSize ?? undefined,
          minWidth: divTwoSize ?? undefined,
        }}
      >
        {props.rightDiv}
      </div>
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
      className=""
      ref={parentDivRef}
    >
      <div
        ref={childRefOne}
        style={{
          width: "100%",
          maxHeight: divOneSize ?? undefined,
          minHeight: divOneSize ?? undefined,
        }}
      >
        {props.topDiv}
      </div>
      <div
        style={{
          minHeight: resizeBarSize,
        }}
        className={cn([
          "cursor-row-resize  border-y-2 border-secondary",
          props.resizeBarClassName,
        ])}
        onMouseDown={() => setResizing(true)}
      />
      <div
        ref={childRefTwo}
        className="flex items-center justify-center flex-col"
        style={{
          maxHeight: divTwoSize ?? undefined,
          minHeight: divTwoSize ?? undefined,
        }}
      >
        {props.bottomDiv}
      </div>
    </div>
  );
};

export default Resizable;
