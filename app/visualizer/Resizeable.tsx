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
  divOneSize: Percentage | number;
  setDiveOneSize: React.Dispatch<React.SetStateAction<Percentage | number>>;
  divTwoSize: Percentage | number;
  setDivTwoSize: React.Dispatch<React.SetStateAction<Percentage | number>>;
  resizeBarClassName?: string;
};
const Resizable = (props: Props) => {
  const [resizing, setResizing] = useState(false);
  const parentDivRef = useRef<HTMLDivElement | null>(null);
  const childRefOne = useRef<HTMLDivElement | null>(null);
  const childRefTwo = useRef<HTMLDivElement | null>(null);
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

          // if (
          //   newDiv1Width - resizeBarSize / 2 === 0 ||
          //   newDiv2Width - resizeBarSize / 2 === 0
          // ) {
          //   console.log("aint no way");
          // }

          props.setDiveOneSize(newDiv1Width - resizeBarSize / 2);
          props.setDivTwoSize(newDiv2Width - resizeBarSize / 2);
        })
        .with({ type: "vertical" }, (props) => {
          let newDiv1Height = e.clientY - parentDiv.offsetTop;
          newDiv1Height = Math.max(0, newDiv1Height);
          newDiv1Height = Math.min(parentDiv.offsetHeight, newDiv1Height);
          const newDiv2Width = parentDiv.offsetHeight - newDiv1Height;
          props.setDiveOneSize(newDiv1Height - resizeBarSize / 2);
          props.setDivTwoSize(newDiv2Width - resizeBarSize / 2);
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
        if (
          typeof props.divOneSize === "number" &&
          typeof props.divTwoSize === "number"
        ) {
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
            (props.divOneSize + props.divTwoSize + resizeBarSize);

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

          props.setDiveOneSize(scale);
          props.setDivTwoSize(scale);

          // ...
        } else {
          // ...
        }
      })
      // only one that works, but for now have no need for the other version
      .with({ type: "vertical" }, (props) => {
        if (
          typeof props.divOneSize === "number" &&
          typeof props.divTwoSize === "number"
        ) {
          if (!childRefOne.current || !childRefTwo.current) {
            // will be defined, ran as an effect, so just terminate
            return;
          }
          let parentScaledBy =
            parentDivRef.current?.offsetHeight! /
            (props.divOneSize + props.divTwoSize + resizeBarSize);
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

          props.setDiveOneSize(scale);
          props.setDivTwoSize(scale);

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
  }, [props.divOneSize, props.divTwoSize]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return props.type === "horizontal" ? (
    <div
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
          maxWidth: props.divOneSize ?? undefined,
          minWidth: props.divOneSize ?? undefined,
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
          "cursor-col-resize border-y-2 border-secondary",
          props.resizeBarClassName,
        ])}
        onMouseDown={() => setResizing(true)}
      />
      <div
        ref={childRefTwo}
        className="flex items-center justify-center"
        style={{
          width: props.divTwoSize ?? undefined,
          maxWidth: props.divTwoSize ?? undefined,
          minWidth: props.divTwoSize ?? undefined,
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
          maxHeight: props.divOneSize ?? undefined,
          minHeight: props.divOneSize ?? undefined,
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
          maxHeight: props.divTwoSize ?? undefined,
          minHeight: props.divTwoSize ?? undefined,
        }}
      >
        {props.bottomDiv}
      </div>
    </div>
  );
};

export default Resizable;
