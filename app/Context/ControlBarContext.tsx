import { Dispatch, SetStateAction, createContext } from 'react';

export type ControlBarContextState = {
  playing: boolean;
  multiplier: number[];
  items: number;
};

export const defaultState = {
  playing: false,
  multiplier: [1],
  items: 10,
};

type ControlBarContextData = {
  state: ControlBarContextState;
  setState: Dispatch<SetStateAction<ControlBarContextState>>;
};

export const ControlBarContext = createContext<ControlBarContextData>({
  state: defaultState,
  setState: () => console.warn('no state provider'),
});
