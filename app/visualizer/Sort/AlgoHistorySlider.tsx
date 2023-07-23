import { Button } from '@/components/ui/button';
import { Undo, RedoIcon } from 'lucide-react';
import React, { useState } from 'react';
import { ActionCreators } from 'redux-undo';
import { SpeedSlider } from './SpeedSlider';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { CodeExecActions } from '@/redux/slices/codeExecSlice';

type Props = {
  show?: boolean;
};

const AlgoHistorySlider = ({ show = false }: Props) => {
  const dispatch = useAppDispatch();
  const visualizationLength = useAppSelector(
    (store) => store.codeExec.visualization?.length
  );
  const visualizationPointer = useAppSelector(
    (store) => store.codeExec.visualizationPointer
  );
  if (!show) return null;

  return (
    <div
      className={`w-full animate-in fade-in duration-500 border-secondary   flex items-center justify-evenly  min-h-[40px] max-h-[40px] border-t-2 `}
    >
      {/* https://www.radix-ui.com/docs/primitives/components/slider */}
      <SpeedSlider
        min={0}
        value={[visualizationPointer]}
        max={visualizationLength}
        // need min and max
        // need to be able to set point to that value
        onValueChange={(value) => {
          if (value.length !== 1) return;
          const [val] = value;
          // console.log('slider val', value);
          dispatch(CodeExecActions.setVisualizationPointer(val));
        }}
        className="w-[85%]"
      />
    </div>
  );
};

export default AlgoHistorySlider;
