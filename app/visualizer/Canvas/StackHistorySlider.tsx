import { CodeExecActions } from "@/redux/slices/codeExecSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import React, { Dispatch, SetStateAction } from "react";
import { SpeedSlider } from "../Sort/SpeedSlider";
import { cn } from "@/lib/utils";

export const StackHistorySlider = (
  props: React.ComponentPropsWithoutRef<typeof SpeedSlider>
) => {
  // if (!show) return null;

  return (
    <div
      className={`w-full animate-in fade-in duration-500 border-secondary   flex items-center justify-evenly  min-h-[40px] max-h-[40px]  `}
    >
      {/* https://www.radix-ui.com/docs/primitives/components/slider */}
      <SpeedSlider
        // min={0}
        // value={[value]}
        // max={10}
        // // need min and max
        // // need to be able to set point to that value
        // onValueChange={(value) => {}}
        // className="w-[85%]"
        {...props}
        className={cn(["w-[85%]", props.className])}
      />
    </div>
  );
};
