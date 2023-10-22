"use client";
import { CanvasActions, Meta } from "@/redux/slices/canvasSlice";
import { useAppDispatch } from "@/redux/store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// export const useClearCanvasState = (meta: Meta) => {
//   const dispatch = useAppDispatch();
//   const pathname = usePathname();

//   useEffect(
//     () => {
//       dispatch(CanvasActions.resetCircles(undefined));
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [pathname]
//   );
//   useEffect(
//     () => {
//       dispatch(CanvasActions.resetLines(undefined));
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [pathname]
//   );
// };
