import { HistoryNode } from '@/lib/types';
import { Dispatch, SetStateAction, createContext } from 'react';

export type ControlBarContextState = {
  playing: boolean;
  multiplier: number[];
  items: number;
  historyPointer: HistoryNode | null;
};

export const defaultState = {
  playing: false,
  multiplier: [1],
  items: 10,
  historyPointer: null,
};

export type ControlBarContextData = {
  state: ControlBarContextState;
  setState: Dispatch<SetStateAction<ControlBarContextState>>;
};

export const ControlBarContext = createContext<ControlBarContextData>({
  state: defaultState,
  setState: () => console.warn('no state provider'),
});
