import { HistoryNode, NodeMetadata } from '@/lib/types';
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  createContext,
} from 'react';

export type HistoryNodesContextState = {
  historyNodes: HistoryNode[];
  setHistoryNodes: Dispatch<SetStateAction<HistoryNode[]>>;
  quickSortTempHistoryArrayList: MutableRefObject<HistoryNode[]>;
  mergeSortTempHistoryArrayList: MutableRefObject<HistoryNode[]>;
};

export const HistoryNodesContext = createContext<HistoryNodesContextState>({
  historyNodes: [],
  setHistoryNodes: () => console.error('no state provider for node context'),
  quickSortTempHistoryArrayList: { current: [] },
  mergeSortTempHistoryArrayList: { current: [] },
});
