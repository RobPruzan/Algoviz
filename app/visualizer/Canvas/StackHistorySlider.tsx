import { CodeExecActions } from "@/redux/slices/codeExecSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import React from "react";
import { SpeedSlider } from "../Sort/SpeedSlider";

type Props = {};

export const StackHistorySlider = (props: Props) => {
  const dispatch = useAppDispatch();

  // if (!show) return null;

  return (
    <div
      className={`w-full animate-in fade-in duration-500 border-secondary   flex items-center justify-evenly  min-h-[40px] max-h-[40px] border-t-2 `}
    >
      {/* https://www.radix-ui.com/docs/primitives/components/slider */}
      <SpeedSlider
        min={0}
        // value={[0]}
        max={10}
        // need min and max
        // need to be able to set point to that value
        onValueChange={(value) => {}}
        className="w-[85%]"
      />
    </div>
  );
};
