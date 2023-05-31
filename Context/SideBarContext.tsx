import { Algorithms, DisplayTypes } from '@/lib/types';
import { Dispatch, SetStateAction, createContext } from 'react';

export type SideBarContextState = {
  algorithm: Algorithms;
  display: DisplayTypes;
};

export type SideBarContextData = {
  sideBarState: SideBarContextState;
  setSideBarState: Dispatch<SetStateAction<SideBarContextState>>;
};

export const INITIAL_SIDE_BAR_STATE: SideBarContextState = {
  algorithm: 'quick sort',
  display: 'nodes',
};

export const SideBarContext = createContext<SideBarContextData>({
  sideBarState: INITIAL_SIDE_BAR_STATE,
  setSideBarState: () =>
    console.error('no state provider for side bar context'),
});
