export type NodeMetadata = {
  value: number;
  position: number;
  id: string;
  next?: NodeMetadata | null;
  color: string;
};

export type HistoryNode = {
  next: HistoryNode | null;
  prev: HistoryNode | null;
  element: NodeMetadata[];
  stateContext: string;
};
