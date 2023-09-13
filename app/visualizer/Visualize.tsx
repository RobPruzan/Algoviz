'use client';
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from 'react';

import CanvasDisplay from './Canvas/CanvasDisplay';
import CanvasControlBar from './Canvas/CanvasControlBar';
import {
  CircleReceiver,
  DrawTypes,
  IO,
  Percentage,
  SelectedGeometryInfo,
  SelectedValidatorLens,
  UndirectedEdge,
} from '@/lib/types';
import { useAppSelector } from '@/redux/store';

import { useDepthFirstSearch } from '@/hooks/useDepthFirstSearch';
import { getSelectedItems } from '@/lib/utils';
import { SpeedSlider } from './Sort/SpeedSlider';
import { RedoIcon, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { CanvasActions, canvasReducer } from '@/redux/slices/canvasSlice';
import { ActionCreators } from 'redux-undo';
import AlgoHistorySlider from './Sort/AlgoHistorySlider';
import { Algorithm } from '@prisma/client';
type Props = {
  setSelectedValidatorLens: React.Dispatch<
    React.SetStateAction<SelectedValidatorLens | null>
  >;
  selectedValidatorLens: SelectedValidatorLens | null;
  canvasWidth: number | Percentage;
  setUserAlgorithm: React.Dispatch<
    React.SetStateAction<
      Pick<Algorithm, 'title' | 'code' | 'description' | 'type' | 'language'>
    >
  >;
};

const Visualize = ({
  canvasWidth,
  selectedValidatorLens,
  setUserAlgorithm,
  setSelectedValidatorLens,
}: Props) => {
  const [selectedControlBarAction, setSelectedControlBarAction] =
    useState<DrawTypes | null>(null);

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
        <CanvasDisplay
          setUserAlgorithm={setUserAlgorithm}
          setSelectedControlBarAction={setSelectedControlBarAction}
          selectedValidatorLens={selectedValidatorLens}
          setSelectedValidatorLens={setSelectedValidatorLens}
          canvasWrapperRef={canvasWrapperRef}
          canvasWidth={width ?? 1000}
          canvasHeight={height ?? 1000}
          selectedControlBarAction={selectedControlBarAction}
        />
      </div>
    </div>
  );
};

export default Visualize;
