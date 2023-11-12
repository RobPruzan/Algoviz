"use client";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";

import CanvasDisplay from "./Canvas/CanvasDisplay";
import CanvasControlBar from "./Canvas/CanvasControlBar";
import {
  CircleReceiver,
  DrawTypes,
  IO,
  Percentage,
  RealMessedUpAlgoType,
  SelectedGeometryInfo,
  SelectedValidatorLens,
  TaggedDrawTypes,
  UndirectedEdge,
} from "@/lib/types";
import { useAppSelector } from "@/redux/store";

import { useDepthFirstSearch } from "@/hooks/useDepthFirstSearch";
import { getSelectedItems } from "@/lib/utils";
import { SpeedSlider } from "./Sort/SpeedSlider";
import { RedoIcon, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { CanvasActions, canvasReducer } from "@/redux/slices/canvasSlice";
import { ActionCreators } from "redux-undo";

import { Algorithm } from "@prisma/client";
import {
  ErrorBoundary,
  ErrorComponent,
} from "next/dist/client/components/error-boundary";
type Props = {
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  canvasWidth: number | Percentage;
  setUserAlgorithm: React.Dispatch<React.SetStateAction<RealMessedUpAlgoType>>;

  userAlgorithm: RealMessedUpAlgoType;
};

const Visualize = ({
  canvasWidth,
  selectedValidatorLens,
  setUserAlgorithm,
  userAlgorithm,
  setSelectedValidatorLens,
}: Props) => {
  const [selectedControlBarAction, setSelectedControlBarAction] =
    useState<TaggedDrawTypes | null>(null);

  // const [actionPressed, setActionPressed] = useState(false);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const width = canvasWrapperRef.current?.offsetWidth;
  const height = canvasWrapperRef.current?.offsetHeight;

  return (
    <div className={`flex w-full flex-col h-full items-center justify-start `}>
      <div className="w-full  border-2 border-2-b-0 rounded-b-none border-secondary ">
        <CanvasControlBar
          selectedControlBarAction={selectedControlBarAction}
          setSelectedControlBarAction={setSelectedControlBarAction}
        />
      </div>
      <div
        ref={canvasWrapperRef}
        tabIndex={-1}
        className=" w-full overflow-y-scroll rounded-t-none h-full border-2 border-secondary border-t-0"
      >
        <ErrorBoundary errorComponent={CanvasError}>
          <CanvasDisplay
            setUserAlgorithm={setUserAlgorithm}
            setSelectedControlBarAction={setSelectedControlBarAction}
            selectedValidatorLens={selectedValidatorLens}
            setSelectedValidatorLens={setSelectedValidatorLens}
            canvasWrapperRef={canvasWrapperRef}
            userAlgorithm={userAlgorithm}
            canvasWidth={width ?? 1000}
            canvasHeight={height ?? 1000}
            selectedControlBarAction={selectedControlBarAction}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

const CanvasError: ErrorComponent = ({ error, reset }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="mb-5 text-red-500 text-lg font-bold">
        {" "}
        Something went wrong...
      </div>
      <Button onClick={reset} variant={"outline"}>
        {" "}
        Reload{" "}
      </Button>
    </div>
  );
};

export default Visualize;
