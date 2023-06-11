import {
  Algorithms,
  DisplayTypes,
  SideBarContextData,
  SideBarContextState,
} from '@/lib/types';
import { Dispatch, SetStateAction, createContext } from 'react';

export const INITIAL_SIDE_BAR_STATE: SideBarContextState = {
  algorithm: 'breadth first search',
  display: 'canvas',
};

export const SideBarContext = createContext<SideBarContextData>({
  sideBarState: INITIAL_SIDE_BAR_STATE,
  setSideBarState: () =>
    console.error('no state provider for side bar context'),
});
