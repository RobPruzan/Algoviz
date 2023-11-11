"use client";
import { Percentage, SelectedGeometryInfo } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import CodeExecution from "./Canvas/CodeExecution";
import Visualize from "./Visualize";
import { Algorithm } from "@prisma/client";
import { match } from "ts-pattern";

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
  canvasSize: Percentage | number;
  setCanvasSize: React.Dispatch<React.SetStateAction<Percentage | number>>;
  codeExecSize: Percentage | number;
  setCodeExecSize: React.Dispatch<React.SetStateAction<Percentage | number>>;
};
const Resizable = (props: Props) => {
  const [resizing, setResizing] = useState(false);
  const parentDivRef = useRef<HTMLDivElement | null>(null);
  const childRefOne = useRef<HTMLDivElement | null>(null);
  const childRefTwo = useRef<HTMLDivElement | null>(null);
  const padding = 25;
  const resizeBarSize = 12;

  useEffect(() => {
    const mouseMoveHandler = (e: any) => {
      if (!resizing) return;

      const parentDiv = parentDivRef.current;
      if (!parentDiv) return;
      match(props)
        .with({ type: "horizontal" }, (props) => {
          let newDiv1Width = e.clientX - parentDiv.offsetLeft;

          newDiv1Width = Math.max(0, newDiv1Width);
          newDiv1Width = Math.min(parentDiv.offsetWidth, newDiv1Width);

          const newDiv2Width = parentDiv.offsetWidth - newDiv1Width;

          props.setCanvasSize(newDiv1Width - resizeBarSize / 2);
          props.setCodeExecSize(newDiv2Width - resizeBarSize / 2);
        })
        .with({ type: "vertical" }, (props) => {
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

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // make sure it only runs the useEffect for resizing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing]);

  const handleResize = () => {
    match(props)
      .with({ type: "horizontal" }, (props) => {
        if (
          typeof props.canvasSize === "number" &&
          typeof props.codeExecSize === "number"
        ) {
          // ...
        } else {
          // ...
        }
      })
      // only one that works, but for now have no need for the other version
      .with({ type: "vertical" }, (props) => {
        if (
          typeof props.canvasSize === "number" &&
          typeof props.codeExecSize === "number"
        ) {
          // take the ratio split the parent, multiply be their ratio, boom
          if (
            !childRefOne.current ||
            !childRefTwo.current ||
            !parentDivRef.current
          ) {
            // will be defined, ran as an effect, so just terminate
            return;
          }
          let div1ratio =
            props.codeExecSize === 0
              ? props.canvasSize / props.codeExecSize
              : 0;
          let halfOfParent = parentDivRef.current.offsetHeight / 2;

          let div1size = halfOfParent * div1ratio;
          let div2size = parentDivRef.current.offsetHeight - div1size;

          props.setCanvasSize(div1size);
          props.setCodeExecSize(div2size);
        } else {
          if (
            !childRefOne.current ||
            !childRefTwo.current ||
            !parentDivRef.current
          ) {
            return;
          }
          // quite simple don't over complicate it
          let newDiv1Height =
            (parentDivRef.current.offsetHeight *
              Number((props.canvasSize as string).split("%").at(0))) /
            100;
          const newDiv2Width =
            parentDivRef.current.offsetHeight - newDiv1Height;
          props.setCanvasSize(newDiv1Height);
          props.setCodeExecSize(newDiv2Width - resizeBarSize);
        }
      })
      .exhaustive();
  };

  useEffect(() => {
    handleResize();
  }, []);

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
        // padding: `${padding}px`,
        // paddingTop: '10px',
      }}
      // className="prevent-select"
      ref={parentDivRef}
    >
      <div
        ref={childRefOne}
        style={{
          // width: props.canvasSize ?? undefined,
          maxWidth: props.canvasSize ?? undefined,
          minWidth: props.canvasSize ?? undefined,
          height: "100%",
        }}
      >
        {props.leftDiv}
      </div>
      <div
        style={{
          minWidth: resizeBarSize,
        }}
        className={"cursor-col-resize border-y-2 border-secondary"}
        onMouseDown={() => setResizing(true)}
      />
      <div
        ref={childRefTwo}
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
        className={"cursor-row-resize  border-y-2 border-secondary"}
        onMouseDown={() => setResizing(true)}
      />
      <div
        ref={childRefTwo}
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
