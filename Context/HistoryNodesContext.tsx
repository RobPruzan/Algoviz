import { HistoryNode, NodeMetadata } from '@/lib/types';
import { Dispatch, SetStateAction, createContext } from 'react';

export type HistoryNodesContextState = {
  historyNodes: HistoryNode[];
  setHistoryNodes: Dispatch<SetStateAction<HistoryNode[]>>;
};

export const HistoryNodesContext = createContext<HistoryNodesContextState>({
  historyNodes: [],
  setHistoryNodes: () => console.error('no state provider for node context'),
});
