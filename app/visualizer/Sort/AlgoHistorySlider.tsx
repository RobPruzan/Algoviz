import { Button } from '@/components/ui/button';
import { Undo, RedoIcon } from 'lucide-react';
import React, { useState } from 'react';
import { ActionCreators } from 'redux-undo';
import { SpeedSlider } from './SpeedSlider';
import { useAppDispatch } from '@/redux/store';

type Props = {
  show?: boolean;
};

const AlgoHistorySlider = ({ show = false }: Props) => {
  const dispatch = useAppDispatch();
  if (!show) return null;

  return (
    <div
      className={`w-full animate-in fade-in duration-500 border-t-2    flex items-center justify-evenly  min-h-[40px] max-h-[40px] border-b-2 border-secondary `}
    >
      {/* https://www.radix-ui.com/docs/primitives/components/slider */}
      <SpeedSlider
        onValueChange={(value) => {
          dispatch(ActionCreators.undo());
        }}
        className="w-[85%]"
      />
    </div>
  );
};

export default AlgoHistorySlider;
