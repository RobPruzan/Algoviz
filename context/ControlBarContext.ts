import { HistoryNode } from '@/lib/types';
import { Dispatch, SetStateAction, createContext } from 'react';

export type ControlBarContextState = {
  playing: boolean;
  multiplier: number[];
  items: number;
  historyPointer: number;
};

export const defaultState = {
  playing: false,
  multiplier: [1],
  items: 10,
  historyPointer: 0,
};

export type ControlBarContextData = {
  controlBarState: ControlBarContextState;
  setControlBarState: Dispatch<SetStateAction<ControlBarContextState>>;
};

export const ControlBarContext = createContext<ControlBarContextData>({
  controlBarState: defaultState,
  setControlBarState: () => console.warn('no state provider'),
});
