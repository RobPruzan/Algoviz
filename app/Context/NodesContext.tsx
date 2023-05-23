import { NodeMetadata } from '@/lib/types';
import { Dispatch, SetStateAction, createContext } from 'react';

type NodeContextState = {
  nodeRows: NodeMetadata[][];
  setNodeRows: Dispatch<SetStateAction<NodeMetadata[][]>>;
};

export const NodesContext = createContext<NodeContextState>({
  nodeRows: [],
  setNodeRows: () => console.warn('no state provider'),
});
